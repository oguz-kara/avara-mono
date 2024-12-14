import { ServeStaticModule } from '@nestjs/serve-static'
import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as multer from 'multer'
import { join } from 'path'

import {
  AssetService,
  FileTypeService,
  ImageProcessor,
  StorageStrategyFactory,
  FilenameNormalizer,
  AssetController,
  LocalStorageStrategy,
} from '.'
import { PaginationValidator, RequestContextModule } from '@av/common'
import { PrismaService } from '@av/database'
import { LocalFileSystemService } from './infrastructure/services/local-file-system.service'
import { PathService } from './infrastructure/services/path.service'

@Module({
  imports: [
    RequestContextModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        storage: multer.memoryStorage(),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production'
        const rootPath = isProduction
          ? join(
              config.get('ASSET_STORAGE_PATH') || '/usr/src/app/uploads',
              'preview',
            )
          : join(__dirname, '..', 'uploads')

        return [
          {
            rootPath,
            serveRoot: '/uploads',
          },
        ]
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AssetController,
    AssetService,
    FileTypeService,
    ImageProcessor,
    LocalStorageStrategy,
    StorageStrategyFactory,
    FilenameNormalizer,
    PaginationValidator,
    PrismaService,
    LocalFileSystemService,
    PathService,
  ],
  controllers: [AssetController],
  exports: [AssetController],
})
export class AssetModule {}
