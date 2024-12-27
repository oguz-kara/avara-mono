import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'

import {
  Ctx,
  PaginatedItemsResponse,
  PaginationInput,
  RequestContext,
  RequestContextInterceptor,
  WithRelations,
} from '@av/common'
import {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '../types/product.types'
import { FindProductsResponse } from '../inputs/product.dto'
import { ProductService } from '@av/catalog/application/services/product.service'
import { Prisma } from '@prisma/client'
import { BatchPayload } from '@av/database'

@Resolver(() => Product)
@UseInterceptors(RequestContextInterceptor)
export class ProductResolver {
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

  @Mutation(() => Product)
  async createProduct(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CreateProductInput,
  ): Promise<Product> {
    return this.productService.create(ctx, input)
  }

  @Mutation(() => Product)
  async updateProduct(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.productService.update(ctx, id, input as any)
  }

  @Mutation(() => Product)
  async deleteProduct(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Product> {
    return this.productService.delete(ctx, id)
  }

  @Mutation(() => BatchPayload)
  async deleteProducts(
    @Ctx() ctx: RequestContext,
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<Prisma.BatchPayload> {
    return this.productService.deleteMany(ctx, ids)
  }

  @Query(() => FindProductsResponse)
  async searchProducts(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('query', { type: () => String }) query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<PaginatedItemsResponse<Product>> {
    return this.productService.search(ctx, query, relations, { skip, take })
  }
}
