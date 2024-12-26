import { RequestContext } from '@av/common'
import { PrismaService, SeoMetadata } from '@av/database'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SitemapService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSitemap(ctx: RequestContext): Promise<any> {
    const seoMetadatas = await this.getSeoMetadatas(ctx)

    const urls = seoMetadatas.map((seoMetadata) => ({
      loc: seoMetadata.canonicalUrl,
      lastmod: seoMetadata.updatedAt?.toISOString(),
      priority: seoMetadata.priority,
      changefreq: seoMetadata.changefreq,
    }))

    return { urls }
  }

  private async getSeoMetadatas(ctx: RequestContext): Promise<SeoMetadata[]> {
    return await this.prisma.seoMetadata.findMany({
      where: {
        channelToken: ctx.channel.token,
      },
    })
  }
}
