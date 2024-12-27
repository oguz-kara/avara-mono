import { Module } from '@nestjs/common'
import { PaginationValidator } from '@av/common'
import { AiModule } from '@av/ai'
import { LocalizeModule } from '@av/localize'
import { SeoModule } from '@av/seo'

import { ProductService } from './application/services/product.service'
import { CollectionService } from './application/services/collection.service'
import { FacetService } from './application/services/facet.service'
import { FacetValueService } from './application/services/facet-value.service'
import { GenerateCategoryCollectionService } from './application/services/generate-category-collection.service'
import { GenerateProductsWithCategoriesService } from './application/services/generate-products-with-categoeries.service'
import { ProductSeoMetadataService } from './application/services/product-seo-metadata.service'
import { CollectionSeoMetadataService } from './application/services/collection-seo-metadata.service'
import { SyncEntityTranslationsService } from './application/services/sync-entity-translations.service'

@Module({
  imports: [AiModule, LocalizeModule, SeoModule],
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
