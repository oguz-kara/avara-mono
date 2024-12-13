import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql'
import {
  Ctx,
  PaginatedItemsResponse,
  RequestContext,
  RequestContextInterceptor,
  WithRelations,
} from '@av/common'
import { FacetValue, FindFacetValuesResponse } from '../types/facet-value.types'
import { CreateFacetValueInput } from '../inputs/facet-value.dto'
import { UpdateFacetValueInput } from '../inputs/facet-value.dto'
import { FacetValueService } from '@av/product/application/facet-value.service'
import { UseInterceptors } from '@nestjs/common'

@Resolver(() => FacetValue)
@UseInterceptors(RequestContextInterceptor)
export class FacetValueResolver {
  constructor(private readonly facetValueService: FacetValueService) {}

  @Mutation(() => FacetValue)
  async createFacetValue(
    @Args('input') input: CreateFacetValueInput,
    @Ctx() ctx: RequestContext,
  ): Promise<FacetValue> {
    return this.facetValueService.create(ctx, input)
  }

  @Query(() => FacetValue)
  async facetValue(
    @Args('id', { type: () => ID }) id: string,
    @Ctx() ctx: RequestContext,
  ): Promise<FacetValue> {
    return this.facetValueService.getById(ctx, id)
  }

  @Query(() => FindFacetValuesResponse)
  async facetValues(
    @Ctx() ctx: RequestContext,
    @Args('facetId', { type: () => ID }) facetId: string,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<PaginatedItemsResponse<FacetValue>> {
    return this.facetValueService.getMany(ctx, facetId, {
      skip,
      take,
    })
  }

  @Mutation(() => Number)
  async createFacetValues(
    @Ctx() ctx: RequestContext,
    @Args('input', { type: () => [CreateFacetValueInput] })
    input: CreateFacetValueInput[],
  ): Promise<number> {
    return this.facetValueService.createMany(ctx, input)
  }

  @Mutation(() => FacetValue)
  async updateFacetValue(
    @Ctx() ctx: RequestContext,
    @Args('input') input: UpdateFacetValueInput,
  ): Promise<FacetValue> {
    return this.facetValueService.updateFacetValue(ctx, input.id, input)
  }

  @Mutation(() => FacetValue)
  async deleteFacetValue(
    @Ctx() ctx: RequestContext,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FacetValue> {
    return this.facetValueService.deleteFacetValue(ctx, id)
  }

  @Query(() => FindFacetValuesResponse)
  async searchFacetValues(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('query', { type: () => String }) query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<PaginatedItemsResponse<FacetValue>> {
    return this.facetValueService.search(ctx, query, relations, { skip, take })
  }
}
