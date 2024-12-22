import { Module } from '@nestjs/common'

import { PrismaModule } from '@av/database'
import { PaginationValidator, RequestContextModule } from '@av/common'
import { ProductResolver } from './api/graphql/resolvers/product.resolver'
import { ProductService } from './application/services/product.service'
import { CollectionService } from './application/services/collection.service'
import { CollectionResolver } from './api/graphql/resolvers/collection.resolver'
import { FacetService } from './application/services/facet.service'
import { FacetResolver } from './api/graphql/resolvers/facet.resolver'
import { FacetValueService } from './application/services/facet-value.service'
import { FacetValueResolver } from './api/graphql/resolvers/facet-value.resolver'
import { GenerateCategoryCollectionService } from './application/services/generate-category-collection.service'
import { GenerateFacetCollectionsResolver } from './api/graphql/resolvers/generate-facet-collections.resolver'
import { AiModule } from '@av/ai'
import { GenerateProductsWithCategoriesService } from './application/services/generate-products-with-categoeries.service'
import { LocalizeModule } from '@av/localize'
import { SeoModule } from '@av/seo'

@Module({
  imports: [
    PrismaModule,
    RequestContextModule,
    AiModule,
    LocalizeModule,
    SeoModule,
  ],
  providers: [
    ProductService,
    ProductResolver,
    CollectionService,
    CollectionResolver,
    PaginationValidator,
    FacetService,
    FacetResolver,
    FacetValueService,
    FacetValueResolver,
    GenerateCategoryCollectionService,
    GenerateFacetCollectionsResolver,
    GenerateProductsWithCategoriesService,
  ],
  exports: [
    ProductService,
    CollectionService,
    FacetService,
    FacetValueService,
    GenerateCategoryCollectionService,
    GenerateProductsWithCategoriesService,
  ],
})
export class CatalogModule {}
