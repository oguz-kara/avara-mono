import { PaginationInput } from '@av/common'
import { PaginatedItemsResponse } from '@av/common'
import { Args, Query } from '@nestjs/graphql'

import { RequestContext } from '@av/common'

import { Ctx } from '@av/common'

import { WithRelations } from '@av/common'

import { ProductService } from '@av/catalog/application/services/product.service'
import { RequestContextInterceptor } from '@av/common'
import { UseInterceptors } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { FindProductsResponse } from '../inputs/product.dto'
import { Product } from '../types/product.types'

@Resolver(() => Product)
@UseInterceptors(RequestContextInterceptor)
export class PublicProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => FindProductsResponse)
  async products(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedItemsResponse<Product>> {
    return this.productService.getMany(ctx, pagination, relations)
  }

  @Query(() => Product)
  async product(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Product> {
    return this.productService.getById(ctx, id, {
      relations,
      translated: true,
    })
  }

  @Query(() => Product)
  async productBySlug(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<Product> {
    return this.productService.getBySlug(ctx, slug, relations)
  }
}
