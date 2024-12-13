import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as path from 'path'

import { Asset, DbTransactionalClient, PrismaService } from '@av/database'

import { AssetStorageStrategy } from '../../domain/services/asset-storage-strategy.interface'
import { ImageProcessor } from '../../domain/services/image-processor.service'
import { UnsupportedFileError } from '../../domain/errors/unsupported-file-error'
import { DefaultScreenSizeItem } from '../../domain/types/default-screen-size-item.type'
import { defaultScreenSizes } from 'config/default-screen-sizes.config'
import { PathService } from './path.service'
import { LocalFileSystemService } from './local-file-system.service'
import { FilenameNormalizer } from '@av/asset/domain'
import { RequestContext } from '@av/common'

@Injectable()
export class LocalStorageStrategy implements AssetStorageStrategy {
  private readonly basePath: string
  private readonly localPath: string
  private readonly variationSizes: Record<string, DefaultScreenSizeItem>
  private readonly storageUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly imageProcessor: ImageProcessor,
    private readonly prisma: PrismaService,
    private readonly fileSystemService: LocalFileSystemService,
    private readonly pathService: PathService,
    private readonly filenameNormalizer: FilenameNormalizer,
  ) {
    this.basePath = path.resolve(__dirname, 'assets', 'preview')
    this.localPath =
      this.configService.get<string>('asset.storage.localPath') || ''
    this.variationSizes = {
      ...defaultScreenSizes,
      ...this.configService.get<Record<string, DefaultScreenSizeItem>>(
        'asset.variation.sizes',
        {},
      ),
    }
    this.storageUrl = this.configService.get<string>('asset.storage.url') || ''
  }

  private async cleanUpFiles(files: string[]): Promise<void> {
    await Promise.all(
      files.map((filePath) => this.fileSystemService.deleteFile(filePath)),
    )
  }

  private setAssetSource(asset: Asset): void {
    asset.source = path.join(this.localPath, asset.name)
  }

  async save(
    ctx: RequestContext,
    asset: Asset,
    file: Buffer,
    options?: { tx?: DbTransactionalClient },
  ): Promise<Asset> {
    const dbClient = options?.tx || this.prisma
    const createdFiles: string[] = []
    try {
      await this.fileSystemService.ensureDirectoryExists(this.basePath)
      const filePath = this.pathService.buildAssetPath(
        this.basePath,
        asset.name,
      )
      await this.fileSystemService.writeFile(filePath, file)
      createdFiles.push(filePath)

      this.setAssetSource(asset)

      const previewUrl = `${this.storageUrl}/${asset.name}`

      return await dbClient.asset.create({
        data: {
          ...asset,
          preview: previewUrl,
          channelToken: ctx.channel.token,
        },
      })
    } catch (error) {
      await this.cleanUpFiles(createdFiles)
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
    const createdFiles: string[] = []

    try {
      await this.fileSystemService.ensureDirectoryExists(this.basePath)
      const originalPath = this.pathService.buildAssetPath(
        this.basePath,
        asset.name,
      )
      await this.fileSystemService.writeFile(originalPath, file)
      createdFiles.push(originalPath)

      this.setAssetSource(asset)
      const previewUrl = `${this.storageUrl}/${asset.name}`

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
          const variationName = this.filenameNormalizer.normalizeVariantName(
            savedAsset.name,
            key,
          )
          const variationPath = this.pathService.buildAssetPath(
            this.basePath,
            variationName,
          )
          await this.fileSystemService.writeFile(variationPath, buffer)
          createdFiles.push(variationPath)

          const variantPreviewUrl = `${this.storageUrl}/${variationName}`

          await dbClient.imageVariant.create({
            data: {
              assetId: savedAsset.id,
              variantName: key,
              width: width,
              height: height,
              mimeType: asset.mimeType,
              fileSize: buffer.length,
              source: path.join(this.localPath, variationName),
              preview: variantPreviewUrl,
              storageProvider: asset.storageProvider,
              channelToken: ctx.channel.token,
            },
          })
        },
      )
      await Promise.all(imageVariantPromises)

      return savedAsset
    } catch (error) {
      await this.cleanUpFiles(createdFiles)
      throw error
    }
  }

  async getAssetBy(ctx: RequestContext, asset: Asset): Promise<Buffer> {
    try {
      return await this.fileSystemService.readFile(asset.source)
    } catch (error) {
      console.error(`Error reading file: ${asset.source}`, error)
      throw error
    }
  }

  async delete(ctx: RequestContext, asset: Asset): Promise<void> {
    const dbClient = this.prisma

    await this.fileSystemService.deleteFile(asset.source)

    await dbClient.asset.delete({
      where: { id: asset.id, channelToken: ctx.channel.token },
    })
  }

  // Note: This method should be used cautiously and not in production environments
  async deleteAll(): Promise<void> {
    await this.prisma.imageVariant.deleteMany()
    await this.prisma.asset.deleteMany()

    await this.fileSystemService.deleteDirectory(this.basePath)
  }
}
