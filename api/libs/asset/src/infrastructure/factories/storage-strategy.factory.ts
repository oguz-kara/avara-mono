// src/modules/asset/infrastructure/factories/storage-strategy.factory.ts
import { Injectable } from '@nestjs/common'
import { AssetStorageStrategy } from '../../domain/services/asset-storage-strategy.interface'
import { LocalStorageStrategy } from '../services/local-storage-strategy.service'
import { ConfigService } from '@nestjs/config'
import { MinioStorageStrategy } from '../services/minio-storage-strategy.service'

type StorageTypes = 'local' | 'minio'

@Injectable()
export class StorageStrategyFactory {
  constructor(
    private readonly localStrategy: LocalStorageStrategy,
    private readonly minioStrategy: MinioStorageStrategy,
    private readonly configService: ConfigService,
  ) {}

  create(type: StorageTypes = 'minio'): AssetStorageStrategy {
    const storageType = type
      ? type
      : this.configService.get<string>('asset.storage.strategy')

    switch (storageType) {
      case 'local':
        return this.localStrategy
      case 'minio':
        return this.minioStrategy
      default:
        return this.localStrategy
    }
  }
}
