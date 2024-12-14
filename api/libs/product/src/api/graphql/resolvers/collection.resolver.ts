import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'

import {
  Ctx,
  PaginatedItemsResponse,
  PaginatedResponseMeta,
  PaginationInput,
  RequestContext,
  RequestContextInterceptor,
  WithRelations,
} from '@av/common'
import { Collection } from '../types/collection.types'
import { FindCollectionsResponse } from '../types/collection.types'
import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../inputs/collection.dto'
import { CollectionService } from '@av/product/application/collection.service'
import { Product } from '../types/product.types'
import { FindProductsResponse } from '../inputs/product.dto'

@Resolver(() => Collection)
@UseInterceptors(RequestContextInterceptor)
export class CollectionResolver {
  constructor(private readonly collectionService: CollectionService) {}

  @Query(() => FindCollectionsResponse)
  async collections(
    @Ctx() ctx: RequestContext,
    @Args('parentId', { type: () => String, nullable: true })
    parentId?: string | null,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedItemsResponse<Collection>> {
    return this.collectionService.getMany(ctx, {
      where: { parentId },
      ...pagination,
    })
  }

  @Query(() => Collection)
  async collection(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
    @WithRelations() relations: Record<string, boolean | object>,
  ): Promise<Collection> {
    return this.collectionService.getById(ctx, id, relations)
  }

  @Mutation(() => Collection)
  async createCollection(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CreateCollectionInput,
  ): Promise<Collection> {
    return this.collectionService.create(ctx, input)
  }

  @Mutation(() => Collection)
  async updateCollection(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateCollectionInput,
  ): Promise<Collection> {
    return this.collectionService.update(ctx, id, input)
  }

  @Mutation(() => Collection)
  async editParentCollection(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
    @Args('parentId', { type: () => String, nullable: true })
    parentId: string | null,
  ): Promise<Collection> {
    return this.collectionService.editParent(ctx, id, parentId)
  }

  @Mutation(() => Collection)
  async deleteCollection(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Collection> {
    return this.collectionService.delete(ctx, id)
  }

  @Query(() => PaginatedResponseMeta)
  async searchCollections(
    @Ctx() ctx: RequestContext,
    @Args('query', { type: () => String }) query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<PaginatedItemsResponse<Collection>> {
    return this.collectionService.search(ctx, query, { skip, take })
  }

  @Query(() => FindProductsResponse)
  async collectionProducts(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('collectionId', { type: () => String }) collectionId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedItemsResponse<Product>> {
    return this.collectionService.getProducts(
      ctx,
      collectionId,
      relations,
      pagination,
    )
  }
}
