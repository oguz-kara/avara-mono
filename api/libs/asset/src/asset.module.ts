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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
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
