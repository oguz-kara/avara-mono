import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ExceedingMaxLimitError,
  PaginatedList,
  PaginationParams,
  PaginationValidator,
  RequestContext,
} from '@av/common'
import {
  Asset,
  AssetType,
  DbTransactionalClient,
  PrismaService,
} from '@av/database'

import { FilenameNormalizer } from '../../domain/services/filename-normalizer.service'
import { ImageProcessor } from '../../domain/services/image-processor.service'
import { StorageStrategyFactory } from '../../infrastructure/factories/storage-strategy.factory'
import { FileProcessingContext } from '../../domain/services/file-processing-context'
import { FileTypeService } from '../../domain/services/file-type.service'
import { FileMetadataExtractor } from '../../domain/utils/file-metadat-extractor.util'
import { NoFileUploadedError } from '../../domain/errors/no-file-uploaded-error'
import { FileTooLargeError } from '../../domain/errors/file-too-large-error'

type FileMetadata = {
  mimeType: string
  fileSize: number
  width?: number
  height?: number
}

@Injectable()
export class AssetService {
  private variationsEnabled: boolean

  constructor(
    private readonly filenameNormalizer: FilenameNormalizer,
    private readonly imageProcessor: ImageProcessor,
    private readonly storageFactory: StorageStrategyFactory,
    private readonly fileTypeService: FileTypeService,
    private readonly configService: ConfigService,
    private readonly paginationValidator: PaginationValidator,
    private readonly prisma: PrismaService,
  ) {
    this.variationsEnabled =
      this.configService.get<boolean>('asset.variation.variationsEnabled') ||
      false
  }

  async uploadSingle(
    ctx: RequestContext,
    file: Express.Multer.File,
    globalTx?: DbTransactionalClient,
  ): Promise<Asset> {
    if (!file) {
      throw new NoFileUploadedError()
    }

    const maxFileSize = this.configService.get<number>(
      'asset.storage.maxFileSize',
    )
    if (file.buffer.length > maxFileSize) {
      throw new FileTooLargeError(maxFileSize / 1024 / 1024)
    }

    const fileType = await this.fileTypeService.getFileTypeFromFile(file)
    const normalizedFilename = this.filenameNormalizer.normalize(
      file.originalname,
      fileType,
    )

    let fileMetadata: FileMetadata
    if (fileType === 'IMAGE') {
      fileMetadata = await this.imageProcessor.getBufferMetadata(file.buffer)
    } else {
      fileMetadata = FileMetadataExtractor.extractMetadata(
        file.buffer,
        file.originalname,
      )
    }

    const context = FileProcessingContext.create(file.buffer, file.originalname)
    context.normalizedFilename = normalizedFilename
    context.metadata = {
      ...fileMetadata,
      type: fileType as AssetType,
      source: 'not-added-yet',
    }

    const asset = context.getAsset(ctx)
    const storageService = this.storageFactory.create()
    const saveOptions = { tx: globalTx }

    let savedAsset: Asset
    if (this.variationsEnabled && fileType === 'IMAGE') {
      savedAsset = await storageService.saveImageWithScreenVariations(
        ctx,
        asset as Asset,
        file.buffer,
        saveOptions,
      )
    } else {
      savedAsset = await storageService.save(
        ctx,
        asset as Asset,
        file.buffer,
        saveOptions,
      )
    }

    return savedAsset
  }

  async uploadMultiple(
    ctx: RequestContext,
    files: Express.Multer.File[],
  ): Promise<Asset[]> {
    if (!files || files.length === 0) {
      throw new NoFileUploadedError()
    }

    return this.prisma.$transaction(async (tx) => {
      const uploadPromises = files.map((file) =>
        this.uploadSingle(ctx, file, tx),
      )
      return Promise.all(uploadPromises)
    })
  }

  async delete(ctx: RequestContext, assetId: string): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id: assetId,
        channelToken: ctx.channel.token,
      },
    })

    if (!asset) {
      throw new Error('Asset not found')
    }

    const storageService = this.storageFactory.create()

    await storageService.delete(ctx, asset)

    return asset
  }

  async deleteMany(ctx: RequestContext, assetIds: string[]): Promise<Asset[]> {
    const deletePromises = assetIds.map((assetId) => this.delete(ctx, assetId))
    return Promise.all(deletePromises)
  }

  async getMany(
    ctx: RequestContext,
    params?: PaginationParams,
  ): Promise<PaginatedList<Asset>> {
    const paginationParams =
      this.paginationValidator.validatePaginationParams(params)
    if (!paginationParams) {
      throw new ExceedingMaxLimitError()
    }

    const { skip, take } = paginationParams as PaginationParams

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where: { channelToken: ctx.channel.token },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: {
            select: {
              variantName: true,
              preview: true,
              width: true,
              height: true,
            },
          },
        },
      }),
      this.prisma.asset.count({
        where: { channelToken: ctx.channel.token },
      }),
    ])

    return {
      items,
      pagination: {
        skip,
        take,
        total,
      },
    }
  }

  async getById(ctx: RequestContext, assetId: string): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id: assetId,
        channelToken: ctx.channel.token,
      },
    })

    if (!asset) {
      throw new Error('Asset not found')
    }

    return asset
  }

  async deleteAll(ctx: RequestContext): Promise<void> {
    await this.prisma.asset.deleteMany({
      where: { channelToken: ctx.channel.token },
    })

    const storageService = this.storageFactory.create()
    await storageService.deleteAll(ctx)
  }
}
