// src/modules/asset/infrastructure/factories/storage-strategy.factory.ts
import { Injectable } from '@nestjs/common'
import { AssetStorageStrategy } from '../../domain/services/asset-storage-strategy.interface'
import { LocalStorageStrategy } from '../services/local-storage-strategy.service'
import { ConfigService } from '@nestjs/config'

type StorageTypes = 'local'

@Injectable()
export class StorageStrategyFactory {
  constructor(
    private localStrategy: LocalStorageStrategy,
    private readonly configService: ConfigService,
  ) {}

  create(type: StorageTypes = 'local'): AssetStorageStrategy {
    const storageType = type
      ? type
      : this.configService.get<string>('asset.storage.strategy')

    switch (storageType) {
      case 'local':
        return this.localStrategy
      default:
        return this.localStrategy
    }
  }
}
