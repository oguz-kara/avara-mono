import { UseInterceptors } from '@nestjs/common'
import { Resolver, Args, ObjectType, Field, Mutation } from '@nestjs/graphql'
import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'
import GraphQLJSON from 'graphql-type-json'

import { GenerateCategoryCollectionService } from '@av/catalog/application/services/generate-category-collection.service'
import { GenerateProductsWithCategoriesService } from '@av/catalog/application/services/generate-products-with-categoeries.service'

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
    private readonly generateProductsWithCategoriesService: GenerateProductsWithCategoriesService,
  ) {}

  @Mutation(() => FacetCollectionResponse)
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

  @Mutation(() => FacetCollectionResponse)
  async generateProductsWithCategories(
    @Ctx() ctx: RequestContext,
    @Args('data', { type: () => GraphQLJSON }) data: any,
  ): Promise<FacetCollectionResponse> {
    return this.generateProductsWithCategoriesService.generateProductsWithCategories(
      ctx,
      data,
    )
  }
}
