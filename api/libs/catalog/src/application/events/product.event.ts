import { RequestContext } from '@av/common'
import { Asset, Product, SeoMetadata } from '@av/database'

export class ProductCreatedEvent {
  constructor(
    public readonly product: Product & {
      seoMetadata: SeoMetadata
      featuredAsset: Asset
    },
    public readonly ctx: RequestContext,
  ) {}
}

export class ProductUpdatedEvent {
  constructor(
    public readonly product: Product,
    public readonly seoMetadata: SeoMetadata | null,
    public readonly ctx: RequestContext,
  ) {}
}
