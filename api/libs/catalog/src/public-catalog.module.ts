import { Module } from '@nestjs/common'

import { ProductService } from './application/services/product.service'
import { AiModule } from '@av/ai'
import { LocalizeModule } from '@av/localize'
import { SeoModule } from '@av/seo'
import { PublicProductResolver } from './api/graphql/resolvers/public-product.resolver'

@Module({
  imports: [AiModule, LocalizeModule, SeoModule],
  providers: [ProductService, PublicProductResolver],
  exports: [ProductService, PublicProductResolver],
})
export class PublicCatalogModule {}
