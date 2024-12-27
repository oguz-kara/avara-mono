import { Module } from '@nestjs/common'
import { PaginationValidator } from '@av/common'
import { AiModule } from '@av/ai'

import { ProductService } from './application/services/product.service'
import { CollectionService } from './application/services/collection.service'
import { FacetService } from './application/services/facet.service'
import { FacetValueService } from './application/services/facet-value.service'
import { GenerateCategoryCollectionService } from './application/services/generate-category-collection.service'
import { GenerateProductsWithCategoriesService } from './application/services/generate-products-with-categoeries.service'
import { LocalizeModule } from '@av/localize'
import {
  CollectionSeoMetadataService,
  ProductSeoMetadataService,
  SyncEntityTranslationsService,
} from './application'

@Module({
  imports: [AiModule, LocalizeModule],
  providers: [
    ProductService,
    CollectionService,
    PaginationValidator,
    FacetService,
    FacetValueService,
    GenerateCategoryCollectionService,
    GenerateProductsWithCategoriesService,
    ProductSeoMetadataService,
    CollectionSeoMetadataService,
    SyncEntityTranslationsService,
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
