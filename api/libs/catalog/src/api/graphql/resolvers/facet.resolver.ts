import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql'
import {
  Ctx,
  PaginatedItemsResponse,
  RequestContext,
  RequestContextInterceptor,
  WithRelations,
} from '@av/common'
import { Facet, FindFacetsResponse } from '../types/facet.types'
import { CreateFacetInput } from '../inputs/facet.dto'
import { UpdateFacetInput } from '../inputs/facet.dto'
import { FacetService } from '@av/catalog/application/services/facet.service'
import { CreateFacetValueInput } from '../inputs/facet-value.dto'
import { UseInterceptors } from '@nestjs/common'
import { Resource } from '@av/keycloak'

@Resolver(() => Facet)
@Resource('Facet')
@UseInterceptors(RequestContextInterceptor)
export class FacetResolver {
  constructor(private readonly facetService: FacetService) {}

  @Mutation(() => Facet)
  async createFacet(
    @Args('input') input: CreateFacetInput,
    @Ctx() ctx: RequestContext,
  ): Promise<Facet> {
    return this.facetService.create(ctx, input)
  }

  @Query(() => Facet)
  async facet(
    @Args('id', { type: () => ID }) id: string,
    @Ctx()
    ctx: RequestContext,
    @WithRelations() relations: Record<string, any>,
  ): Promise<Facet> {
    return this.facetService.getFacetById(ctx, id, relations)
  }

  @Query(() => FindFacetsResponse)
  async facets(
    @WithRelations() relations: Record<string, any>,
    @Ctx() ctx: RequestContext,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<PaginatedItemsResponse<Facet>> {
    return this.facetService.getMany(ctx, { skip, take }, relations)
  }

  @Mutation(() => Facet)
  async updateFacet(
    @Args('input') input: UpdateFacetInput,
    @Ctx() ctx: RequestContext,
  ): Promise<Facet> {
    return this.facetService.update(ctx, input.id, input)
  }

  @Mutation(() => Facet)
  async deleteFacet(
    @Args('id', { type: () => ID }) id: string,
    @Ctx() ctx: RequestContext,
  ): Promise<Facet> {
    return this.facetService.delete(ctx, id)
  }

  @Mutation(() => Number)
  async deleteFacetList(
    @Args('ids', { type: () => [ID] }) ids: string[],
    @Ctx() ctx: RequestContext,
  ): Promise<number> {
    const result = await this.facetService.deleteMany(ctx, ids)

    return result.count
  }

  @Mutation(() => Facet)
  async createFacetWithValues(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CreateFacetInput,
    @Args('values', { type: () => [CreateFacetValueInput], nullable: true })
    values?: CreateFacetValueInput[],
  ): Promise<Facet> {
    return this.facetService.createFacetWithValues(ctx, { ...input, values })
  }

  @Query(() => FindFacetsResponse)
  async searchFacets(
    @WithRelations() relations: Record<string, boolean | object>,
    @Ctx() ctx: RequestContext,
    @Args('query', { type: () => String }) query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<PaginatedItemsResponse<Facet>> {
    return this.facetService.search(ctx, query, relations, { skip, take })
  }
}
