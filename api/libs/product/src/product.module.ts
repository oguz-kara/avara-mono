import { Module } from '@nestjs/common'

import { PrismaModule } from '@av/database'
import { PaginationValidator, RequestContextModule } from '@av/common'
import { ProductResolver } from './api/graphql/resolvers/product.resolver'
import { ProductService } from './application/product.service'
import { CollectionService } from './application/collection.service'
import { CollectionResolver } from './api/graphql/resolvers/collection.resolver'
import { FacetService } from './application/facet.service'
import { FacetResolver } from './api/graphql/resolvers/facet.resolver'
import { FacetValueService } from './application/facet-value.service'
import { FacetValueResolver } from './api/graphql/resolvers/facet-value.resolver'

@Module({
  imports: [PrismaModule, RequestContextModule],
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
  ],
  exports: [ProductService],
})
export class ProductModule {}
