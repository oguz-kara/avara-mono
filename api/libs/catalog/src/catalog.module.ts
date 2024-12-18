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

@Module({
  imports: [PrismaModule, RequestContextModule, AiModule],
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
  ],
  exports: [
    ProductService,
    CollectionService,
    FacetService,
    FacetValueService,
    GenerateCategoryCollectionService,
  ],
})
export class ProductModule {}
