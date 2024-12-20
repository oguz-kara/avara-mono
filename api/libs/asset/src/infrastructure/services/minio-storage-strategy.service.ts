import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import {
  Asset,
  DbTransactionalClient,
  ImageVariant,
  PrismaService,
} from '@av/database'
import { AssetStorageStrategy } from '../../domain/services/asset-storage-strategy.interface'
import { ImageProcessor } from '../../domain/services/image-processor.service'
import { UnsupportedFileError } from '../../domain/errors/unsupported-file-error'
import { DefaultScreenSizeItem } from '../../domain/types/default-screen-size-item.type'
import { defaultScreenSizes } from 'config/default-screen-sizes.config'
import { FilenameNormalizer } from '@av/asset/domain'
import { RequestContext } from '@av/common'

@Injectable()
export class MinioStorageStrategy implements AssetStorageStrategy {
  private readonly s3: S3Client
  private readonly bucketName: string
  private readonly variationSizes: Record<string, DefaultScreenSizeItem>

  constructor(
    private readonly configService: ConfigService,
    private readonly imageProcessor: ImageProcessor,
    private readonly prisma: PrismaService,
    private readonly filenameNormalizer: FilenameNormalizer,
  ) {
    this.s3 = new S3Client({
      endpoint: this.configService.get<string>('minio.endpoint'), // MinIO URL
      region: 'eu-central-1', // Dummy region for compatibility
      credentials: {
        accessKeyId: this.configService.get<string>('minio.accessKey'),
        secretAccessKey: this.configService.get<string>('minio.secretKey'),
      },
      forcePathStyle: true, // Required for MinIO
    })
    this.bucketName =
      this.configService.get<string>('minio.bucketName') || 'assets'
    this.variationSizes = {
      ...defaultScreenSizes,
      ...this.configService.get<Record<string, DefaultScreenSizeItem>>(
        'asset.variation.sizes',
        {},
      ),
    }
  }

  private async uploadToMinio(
    key: string,
    file: Buffer,
    mimeType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })
    await this.s3.send(command)
    return `${this.configService.get<string>('minio.publicUrl')}/${key}`
  }

  private async deleteFromMinio(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })
    await this.s3.send(command)
  }

  async save(
    ctx: RequestContext,
    asset: Asset,
    file: Buffer,
    options?: { tx?: DbTransactionalClient },
  ): Promise<Asset> {
    const dbClient = options?.tx || this.prisma
    try {
      const key = `original/${asset.name}`
      const previewUrl = await this.uploadToMinio(key, file, asset.mimeType)

      return await dbClient.asset.create({
        data: {
          ...asset,
          preview: previewUrl,
          channelToken: ctx.channel.token,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async saveImageWithScreenVariations(
    ctx: RequestContext,
    asset: Asset,
    file: Buffer,
    options?: { tx?: DbTransactionalClient },
  ): Promise<Asset> {
    if (asset.type !== 'IMAGE') {
      throw new UnsupportedFileError(
        'Only images are supported for this operation!',
      )
    }

    const dbClient = options?.tx || this.prisma

    try {
      const originalKey = `original/${asset.name}`
      const previewUrl = await this.uploadToMinio(
        originalKey,
        file,
        asset.mimeType,
      )

      const savedAsset = await dbClient.asset.create({
        data: {
          ...asset,
          preview: previewUrl,
          channelToken: ctx.channel.token,
        },
      })

      const imageVariantPromises = Object.entries(this.variationSizes).map(
        async ([key, size]) => {
          const { buffer, height, width } =
            await this.imageProcessor.resizeImage(file, size)
          const variationKey = `variations/${key}/${asset.name}`
          const variantPreviewUrl = await this.uploadToMinio(
            variationKey,
            buffer,
            asset.mimeType,
          )

          await dbClient.imageVariant.create({
            data: {
              assetId: savedAsset.id,
              variantName: key,
              width,
              height,
              mimeType: asset.mimeType,
              fileSize: buffer.length,
              source: variationKey,
              preview: variantPreviewUrl,
              storageProvider: 'MINIO',
              channelToken: ctx.channel.token,
            },
          })
        },
      )

      await Promise.all(imageVariantPromises)

      return savedAsset
    } catch (error) {
      throw error
    }
  }

  async getAssetBy(ctx: RequestContext, asset: Asset): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: asset.source,
      })
      const response = await this.s3.send(command)

      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk)
      }

      return Buffer.concat(chunks)
    } catch (error) {
      throw error
    }
  }

  async delete(
    ctx: RequestContext,
    asset: Asset & { variants: ImageVariant[] },
  ): Promise<void> {
    await Promise.all([
      this.deleteFromMinio(asset.source),
      ...asset.variants.map((variant) => this.deleteFromMinio(variant.source)),
    ])

    await this.prisma.asset.delete({
      where: { id: asset.id, channelToken: ctx.channel.token },
    })
  }

  async deleteAll(): Promise<void> {
    await this.prisma.imageVariant.deleteMany()
    await this.prisma.asset.deleteMany()

    // Optional: Implement logic to delete all objects in the MinIO bucket
  }
}
