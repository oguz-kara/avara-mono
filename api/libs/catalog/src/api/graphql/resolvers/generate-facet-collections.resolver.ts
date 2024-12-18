import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query, Args, ObjectType, Field } from '@nestjs/graphql'
import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'
import GraphQLJSON from 'graphql-type-json'

import { GenerateCategoryCollectionService } from '@av/catalog/application/services/generate-category-collection.service'
import { GeneratedCollection } from '../types/generated-collection'

@ObjectType()
class FacetCollectionResponse {
  @Field(() => String)
  success: string
}

@Resolver(() => Object)
@UseInterceptors(RequestContextInterceptor)
export class GenerateFacetCollectionsResolver {
  constructor(
    private readonly generateCategoryCollectionService: GenerateCategoryCollectionService,
  ) {}

  @Query(() => FacetCollectionResponse)
  async generateFacetCollections(
    @Ctx() ctx: RequestContext,
    @Args('data', { type: () => GraphQLJSON }) data: any,
  ): Promise<FacetCollectionResponse> {
    const result =
      await this.generateCategoryCollectionService.generateCategoryCollection(
        ctx,
        data,
        null,
      )
    return { success: result }
  }

  @Query(() => GeneratedCollection)
  async getGeneratedCollection(
    @Ctx() ctx: RequestContext,
    @Args('title', { type: () => String }) title: string,
  ): Promise<object> {
    return this.generateCategoryCollectionService.generateSingleCollection(
      title,
    )
  }
}
