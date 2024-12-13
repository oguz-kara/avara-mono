import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'

import {
  Ctx,
  PaginatedItemsResponse,
  PaginationInput,
  RequestContext,
  RequestContextInterceptor,
} from '@av/common'

import {
  SeoMetadata,
  CreateSeoMetadataInput,
  UpdateSeoMetadataInput,
  FindSeoMetadataResponse,
} from '../types/seo-metadata.types'
import { SeoMetadataService } from '../../application/seo-metadata.service'

@Resolver(() => SeoMetadata)
@UseInterceptors(RequestContextInterceptor)
export class SeoMetadataResolver {
  constructor(private readonly seoService: SeoMetadataService) {}

  @Query(() => FindSeoMetadataResponse)
  async seoMetadatas(
    @Ctx() ctx: RequestContext,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedItemsResponse<SeoMetadata>> {
    return this.seoService.getMany(ctx, pagination)
  }

  @Query(() => SeoMetadata, { nullable: true })
  async seoMetadata(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<SeoMetadata> {
    return this.seoService.getById(ctx, id)
  }

  @Mutation(() => SeoMetadata)
  async createSeoMetadata(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CreateSeoMetadataInput,
  ): Promise<SeoMetadata> {
    return this.seoService.create(ctx, input)
  }

  @Mutation(() => SeoMetadata)
  async updateSeoMetadata(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateSeoMetadataInput,
  ): Promise<SeoMetadata> {
    return this.seoService.update(ctx, id, input)
  }

  @Mutation(() => SeoMetadata)
  async deleteSeoMetadata(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<SeoMetadata> {
    return this.seoService.delete(ctx, id)
  }
}
