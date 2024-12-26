import { Injectable, Logger } from '@nestjs/common'
import { Asset, Collection, SeoMetadata } from '@av/database'
import { EntityType } from '@av/database'
import { RequestContext } from '@av/common'
import { ConfigService } from '@nestjs/config'
import { SegmentService } from '@av/seo'
import { CollectionService } from './collection.service'
import { TranslationPersistenceService } from '@av/localize'

type CollectionType = Collection & {
  seoMetadata: SeoMetadata | null
  featuredAsset: Asset | null
}

@Injectable()
export class CollectionSeoMetadataService {
  private readonly logger = new Logger(CollectionSeoMetadataService.name)
  private readonly collectionSegmentPath: string
  private readonly clientBaseUrl: string
  private readonly brandName: string

  constructor(
    private readonly collectionService: CollectionService,
    private readonly configService: ConfigService,
    private readonly segmentService: SegmentService,
    private readonly translationService: TranslationPersistenceService,
  ) {
    this.collectionSegmentPath =
      this.configService.get('localization.segmentPaths')?.collections ||
      '/collections'
    this.clientBaseUrl = this.configService.get('client.baseUrl')
    this.brandName = this.configService.get('brand.name')
  }

  async getCollectionSeoMetadata(ctx: RequestContext, collectionId: string) {
    const collection = (await this.collectionService.getById(
      ctx,
      collectionId,
      {
        seoMetadata: true,
        featuredAsset: true,
      },
    )) as CollectionType

    if (!collection) {
      throw new Error(`Collection not found for id ${collectionId}`)
    }

    const jsonld = await this.createCollectionStructuredData(ctx, collection)
    const urls = await this.createHreflangUrls(ctx, collection)
    return { jsonld, urls, seoMetadata: collection.seoMetadata }
  }

  private async createCollectionStructuredData(
    ctx: RequestContext,
    collection: CollectionType,
  ) {
    const { seoMetadata, featuredAsset } = collection

    if (!seoMetadata) {
      throw new Error(`SEO metadata not found for Collection ${collection?.id}`)
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Collection',
      name: collection?.name,
      description: collection?.description,
      sku: collection?.id,
      ...(featuredAsset &&
        featuredAsset.preview && { image: featuredAsset.preview }),
      brand: {
        '@type': 'Brand',
        name: this.brandName,
      },
    }
  }

  private async createHreflangUrls(
    ctx: RequestContext,
    collection: CollectionType,
  ) {
    const translations = await this.translationService.getTranslationsOfEntity(
      ctx,
      EntityType.COLLECTION,
      collection?.id,
    )

    return this.createSortedHreflangUrls(ctx, collection, translations)
  }

  private async createHreflangUrlEntry(
    ctx: RequestContext,
    slug: string,
    localizedSegment: string,
    lang?: string,
  ) {
    if (!localizedSegment || !this.clientBaseUrl) {
      return null
    }

    const url =
      lang && lang !== 'x-default'
        ? `${this.clientBaseUrl}/${lang}/${localizedSegment}/${slug}`
        : `${this.clientBaseUrl}/${localizedSegment}/${slug}`

    return {
      url,
      hreflang: lang,
      rel: ctx.languageCode === lang ? 'canonical' : 'alternate',
    }
  }

  private async createSortedHreflangUrls(
    ctx: RequestContext,
    collection: CollectionType,
    collectionTranslations: Record<string, string>[],
  ) {
    if (!this.collectionSegmentPath) {
      this.logger.error(
        'Collection segment path not found at createSortedHreflangUrls, Collection-seo.service',
      )
      return []
    }

    const segment = await this.segmentService.getSegmentByPath(
      ctx,
      this.collectionSegmentPath,
    )

    const urls = await Promise.all(
      collectionTranslations.map(async (translation) => {
        const localizedSegment = segment.translations.find(
          (s) => s.locale === translation.locale,
        )
        if (!localizedSegment) {
          this.logger.error(
            `Localized segment not found at createSortedHreflangUrls, Collection-seo.service, ${translation.locale}`,
          )
          return null
        }
        return await this.createHreflangUrlEntry(
          ctx,
          translation.slug,
          localizedSegment.name,
          translation.locale,
        )
      }),
    )

    const hasCanonical = urls.find((url) => url?.rel === 'canonical')
    const xDefaultUrl = await this.createHreflangUrlEntry(
      ctx,
      collection.slug,
      segment.segment.name,
      'x-default',
    )
    const defaultLangUrl = await this.createHreflangUrlEntry(
      ctx,
      collection.slug,
      segment.segment.name,
    )

    const cn = hasCanonical
      ? [
          { ...defaultLangUrl, hreflang: ctx.channel.defaultLanguageCode },
          xDefaultUrl,
        ]
      : [
          {
            ...defaultLangUrl,
            rel: 'canonical',
            hreflang: ctx.channel.defaultLanguageCode,
          },
        ]

    return [...urls.filter(Boolean), ...cn].sort((a, b) => {
      if (a?.rel === 'canonical') return -1
      if (b?.rel === 'canonical') return 1
      if (a?.hreflang === 'x-default') return -1
      if (b?.hreflang === 'x-default') return 1
      return 0
    })
  }
}
