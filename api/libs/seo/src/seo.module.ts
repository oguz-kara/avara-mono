import { Module } from '@nestjs/common'
import { SeoMetadataResolver } from './api/resolvers/seo-metadata.resolver'
import { SeoMetadataService } from './application/seo-metadata.service'
import { PrismaModule } from '@av/database'
import { PaginationValidator, RequestContextModule } from '@av/common'
import { CommonModule } from '@av/common/common.module'
import { SitemapService } from './application/sitemap.service'
import { SitemapResolver } from './api/resolvers/sitemap.resolver'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { LocalizeModule } from '@av/localize'

@Module({
  imports: [
    PrismaModule,
    RequestContextModule,
    CommonModule,
    EventEmitterModule.forRoot(),
    LocalizeModule,
  ],
  providers: [
    SeoMetadataResolver,
    SeoMetadataService,
    PaginationValidator,
    SitemapService,
    SitemapResolver,
  ],
  exports: [SeoMetadataService],
})
export class SeoModule {}
