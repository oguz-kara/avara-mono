import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'
import { Product } from '../types/product.types'
import { ProductSeoData } from '../inputs/product.dto'
import { ProductSeoMetadataService } from '@av/catalog/application/services/product-seo-metadata.service'

@Resolver(() => Product)
@UseInterceptors(RequestContextInterceptor)
export class ProductSeoResolver {
  constructor(private readonly productSeoService: ProductSeoMetadataService) {}

  @Query(() => ProductSeoData)
  async productSeoData(
    @Ctx() ctx: RequestContext,
    @Args('productId', { type: () => String }) productId: string,
  ): Promise<ProductSeoData> {
    return this.productSeoService.getProductSeoMetadata(ctx, productId)
  }
}
