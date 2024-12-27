import { Module } from '@nestjs/common'
import { SeoMetadataService } from './application/services/seo-metadata.service'
import { PrismaModule } from '@av/database'
import { PaginationValidator } from '@av/common'
import { SitemapService } from './application/services/sitemap.service'
import { SegmentService } from './application/services/segment.service'
import { LocalizeModule } from '@av/localize'
import { HreflangUrlsService } from './application/lib'

@Module({
  imports: [PrismaModule, LocalizeModule],
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
