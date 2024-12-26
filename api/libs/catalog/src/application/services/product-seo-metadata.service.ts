import { Injectable, Logger } from '@nestjs/common'
import { Asset, Product, SeoMetadata } from '@av/database'
import { EntityType } from '@av/database'
import { TranslationPersistenceService } from '@av/localize'
import { RequestContext } from '@av/common'
import { ConfigService } from '@nestjs/config'
import { ProductService } from './product.service'
import { HreflangUrlsService, SegmentService, HreflangUrl } from '@av/seo'

type ProductType = Product & {
  seoMetadata: SeoMetadata | null
  featuredAsset: Asset | null
}

@Injectable()
export class ProductSeoMetadataService {
  private readonly logger = new Logger(ProductSeoMetadataService.name)
  private readonly productSegmentPath: string
  private readonly clientBaseUrl: string
  private readonly brandName: string

  constructor(
    private readonly productService: ProductService,
    private readonly translationService: TranslationPersistenceService,
    private readonly configService: ConfigService,
    private readonly hreflangUrlsService: HreflangUrlsService,
    private readonly segmentService: SegmentService,
  ) {
    this.productSegmentPath =
      this.configService.get('localization.segmentPaths')?.products ||
      '/products'
    this.clientBaseUrl = this.configService.get('client.baseUrl')
    this.brandName = this.configService.get('brand.name')
  }

  async getProductSeoMetadata(
    ctx: RequestContext,
    productId: string,
  ): Promise<{
    jsonld: any
    urls: HreflangUrl[]
    seoMetadata: SeoMetadata | null
  }> {
    const product = (await this.productService.getById(ctx, productId, {
      translated: true,
      relations: {
        seoMetadata: true,
        featuredAsset: true,
      },
    })) as ProductType

    if (!product) {
      throw new Error(`Product not found for id ${productId}`)
    }

    const jsonld = await this.createProductStructuredData(ctx, product)
    const urls = await this.createHreflangUrls(ctx, product)
    return { jsonld, urls, seoMetadata: product.seoMetadata }
  }

  private async createProductStructuredData(
    ctx: RequestContext,
    product: ProductType,
  ) {
    const { seoMetadata, featuredAsset } = product

    const segment = await this.segmentService.getLocalizedSegmentByPath(
      ctx,
      this.productSegmentPath,
    )

    if (!seoMetadata) {
      throw new Error(`SEO metadata not found for product ${product?.id}`)
    }

    const languageCode = !ctx.isDefaultLanguage ? `/${ctx.languageCode}/` : '/'

    const url = `${this.clientBaseUrl}${languageCode}${(segment as any)?.name}/${product.slug}`

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product?.name,
      description: product?.description,
      url,
      sku: product?.id,
      ...(featuredAsset &&
        featuredAsset.preview && { image: featuredAsset.preview }),
      brand: {
        '@type': 'Brand',
        name: this.brandName,
      },
    }
  }

  private async createHreflangUrls(ctx: RequestContext, product: Product) {
    const translations = await this.translationService.getTranslationsOfEntity(
      ctx,
      EntityType.PRODUCT,
      product?.id,
    )

    const defaultProduct = await this.productService.getById(ctx, product?.id, {
      translated: false,
    })

    return this.hreflangUrlsService.createSortedHreflangUrls(
      ctx,
      defaultProduct?.slug,
      translations,
      this.productSegmentPath,
    )
  }
}
