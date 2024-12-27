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
  LocalStorageStrategy,
} from '.'
import { PaginationValidator } from '@av/common'
import { PrismaService } from '@av/database'
import { LocalFileSystemService } from './infrastructure/services/local-file-system.service'
import { PathService } from './infrastructure/services/path.service'
import { MinioStorageStrategy } from './infrastructure/services/minio-storage-strategy.service'

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        storage: multer.memoryStorage(),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [
    AssetService,
    FileTypeService,
    ImageProcessor,
    LocalStorageStrategy,
    MinioStorageStrategy,
    StorageStrategyFactory,
    FilenameNormalizer,
    PaginationValidator,
    PrismaService,
    LocalFileSystemService,
    PathService,
  ],
  controllers: [],
  exports: [],
})
export class AssetModule {}
