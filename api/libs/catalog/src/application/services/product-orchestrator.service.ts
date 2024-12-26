import { Injectable, Logger } from '@nestjs/common'
import { ProductCreatedEvent } from '../events/product.event'
import { Asset, EntityType, Product, SeoMetadata } from '@av/database'
import { LocalesService } from '@av/localize'
import {
  LocalizationSettingsService,
  TranslationPersistenceService,
} from '@av/localize'
import { SeoMetadataService } from '@av/seo'
import { SegmentService } from '@av/seo'
import { RequestContext } from '@av/common'
import { ConfigService } from '@nestjs/config'

type EventProduct = Product & {
  seoMetadata: SeoMetadata
  featuredAsset: Asset
}

@Injectable()
export class ProductOrchestratorService {
  private readonly logger = new Logger(ProductOrchestratorService.name)
  private readonly productSegmentPath: string
  private readonly clientBaseUrl: string
  private readonly brandName: string

  constructor(
    private readonly localesService: LocalesService,
    private readonly localizationSettingsService: LocalizationSettingsService,
    private readonly seoMetadataService: SeoMetadataService,
    private readonly segmentService: SegmentService,
    private readonly configService: ConfigService,
    private readonly translationService: TranslationPersistenceService,
  ) {
    this.productSegmentPath =
      this.configService.get('localization.segmentPaths')?.products ||
      '/products'
    this.clientBaseUrl = this.configService.get('client.baseUrl')
    this.brandName = this.configService.get('brand.name')
  }

  async handleProductCreatedEvent(event: ProductCreatedEvent) {
    const { product, ctx } = event
    const { seoMetadata } = product

    const autoTranslateEnabled =
      await this.localizationSettingsService.isAutoTranslateEnabled(ctx)
    const productSegment = await this.segmentService.getSegmentByPath(
      ctx,
      this.productSegmentPath,
    )

    const productId = product.id
    const channelToken = ctx.channel?.token

    if (!channelToken) {
      this.logger.error(
        `Product created event received for product ${productId} but no channel token found`,
      )
      return
    }

    if (autoTranslateEnabled && seoMetadata) {
      const updatedSeoMetadata = await this.generateSeoMetadata(
        ctx,
        product,
        seoMetadata,
        productSegment,
      )
      if (updatedSeoMetadata) {
        await this.seoMetadataService.update(
          ctx,
          seoMetadata.id,
          updatedSeoMetadata,
        )
      }
    }
  }

  private async generateSeoMetadata(
    ctx: RequestContext,
    product: EventProduct,
    seoMetadata: SeoMetadata,
    productSegment: Record<string, any>,
  ) {
    const alternates = await this.generateAlternateTags(
      ctx,
      product,
      productSegment.path,
    )
    const schemaMarkup = this.generateJsonLd(product, seoMetadata)

    return {
      alternates: JSON.stringify(alternates),
      schemaMarkup,
    }
  }

  private async generateAlternateTags(
    ctx: RequestContext,
    product: Product,
    productSegment: Record<string, any>,
  ) {
    if (!productSegment) {
      this.logger.warn(
        `Segment not found for product ${product.id} at path ${this.productSegmentPath}`,
      )
      return []
    }

    const productTranslations = await this.getProductTranslations(ctx, product)

    return productSegment.translations
      .map((translation) =>
        this.createAlternateTag(translation as any, productTranslations as any),
      )
      .filter(Boolean)
  }

  private createAlternateTag(
    translation: { locale: string; name: string },
    productTranslations: { locale: string; slug: string }[],
  ): { href: string; hreflang: string } | undefined {
    const slug = productTranslations.find(
      (t) => t.locale === translation.locale,
    )?.slug
    if (!slug) {
      this.logger.warn(`No slug found for locale ${translation.locale}`)
      return undefined
    }

    return {
      href: `${this.clientBaseUrl}/${translation.locale}/${translation.name}/${slug}`,
      hreflang: translation.locale,
    }
  }

  private async getProductTranslations(ctx: RequestContext, product: Product) {
    try {
      return await this.translationService.getTranslationsOfEntity(
        ctx,
        EntityType.PRODUCT,
        product.id.toString(),
      )
    } catch (error) {
      this.logger.error(
        `Failed to fetch translations for product ${product.id}: ${error.message}`,
      )
      return []
    }
  }

  private generateJsonLd(product: EventProduct, seoMetadata: SeoMetadata) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: seoMetadata.description || product.description,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: this.brandName,
      },
      image: product.featuredAsset?.preview,
    }
  }

  private mapAvailability(availability: string): string {
    switch (availability) {
      case 'in_stock':
        return 'https://schema.org/InStock'
      case 'out_of_stock':
        return 'https://schema.org/OutOfStock'
      case 'preorder':
        return 'https://schema.org/PreOrder'
      default:
        return 'https://schema.org/LimitedAvailability' // Default fallback
    }
  }
}
