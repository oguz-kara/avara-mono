import { Module } from '@nestjs/common'
import { SeoMetadataResolver } from './api/resolvers/seo-metadata.resolver'
import { SeoMetadataService } from './application/seo-metadata.service'
import { PrismaModule } from '@av/database'
import { PaginationValidator, RequestContextModule } from '@av/common'
import { CommonModule } from '@av/common/common.module'
import { SitemapService } from './application/sitemap.service'
import { SitemapResolver } from './api/resolvers/sitemap.resolver'
import { SegmentService } from './application/segment.service'
import { SegmentResolver } from './api/resolvers/segment.resolver'
import { LocalizeModule } from '@av/localize'

@Module({
  imports: [PrismaModule, RequestContextModule, CommonModule, LocalizeModule],
  providers: [
    SeoMetadataResolver,
    SeoMetadataService,
    PaginationValidator,
    SitemapService,
    SitemapResolver,
    SegmentService,
    SegmentResolver,
  ],
  exports: [SeoMetadataService],
})
export class SeoModule {}
