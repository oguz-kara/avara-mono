import { forwardRef, Module } from '@nestjs/common'
import { SeoMetadataResolver } from './api/resolvers/seo-metadata.resolver'
import { SeoMetadataService } from './application/services/seo-metadata.service'
import { PrismaModule } from '@av/database'
import { PaginationValidator, RequestContextModule } from '@av/common'
import { CommonModule } from '@av/common/common.module'
import { SitemapService } from './application/services/sitemap.service'
import { SitemapResolver } from './api/resolvers/sitemap.resolver'
import { SegmentService } from './application/services/segment.service'
import { SegmentResolver } from './api/resolvers/segment.resolver'
import { LocalizeModule } from '@av/localize'
import { HreflangUrlsService } from './application/lib'

@Module({
  imports: [
    PrismaModule,
    RequestContextModule,
    CommonModule,
    forwardRef(() => LocalizeModule),
  ],
  providers: [
    SeoMetadataResolver,
    SeoMetadataService,
    PaginationValidator,
    SitemapService,
    SitemapResolver,
    SegmentService,
    SegmentResolver,
    HreflangUrlsService,
  ],
  exports: [SeoMetadataService, SegmentService, HreflangUrlsService],
})
export class SeoModule {}
