import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query } from '@nestjs/graphql'

import {
  Ctx,
  PaginatedItemsResponse,
  RequestContext,
  RequestContextInterceptor,
} from '@av/common'

import { SitemapService } from '@av/seo/application/services/sitemap.service'
import { Sitemap } from '../types/sitemap.types'

@Resolver(() => Sitemap)
@UseInterceptors(RequestContextInterceptor)
export class SitemapResolver {
  constructor(private readonly seoMetadata: SitemapService) {}

  @Query(() => Sitemap)
  async sitemap(
    @Ctx() ctx: RequestContext,
  ): Promise<PaginatedItemsResponse<Sitemap>> {
    return this.seoMetadata.generateSitemap(ctx)
  }
}
