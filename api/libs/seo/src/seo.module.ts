import { Module } from '@nestjs/common'
import { SeoMetadataService } from './application/services/seo-metadata.service'
import { PrismaModule } from '@av/database'
<<<<<<< HEAD
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
=======
import { PaginationValidator } from '@av/common'
import { SitemapService } from './application/services/sitemap.service'
import { SegmentService } from './application/services/segment.service'
import { LocalizeModule } from '@av/localize'
import { HreflangUrlsService } from './application/lib'

@Module({
  imports: [PrismaModule, LocalizeModule],
>>>>>>> integrate-keycloak
  providers: [
    SeoMetadataService,
    PaginationValidator,
    SitemapService,
    SegmentService,
    HreflangUrlsService,
  ],
  exports: [SeoMetadataService, SegmentService, HreflangUrlsService],
})
export class SeoModule {}
