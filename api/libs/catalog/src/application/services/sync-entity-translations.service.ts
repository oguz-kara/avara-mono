import { CollectionService } from '@av/catalog/application/services/collection.service'
import { FacetValueService } from '@av/catalog/application/services/facet-value.service'
import { FacetService } from '@av/catalog/application/services/facet.service'
import { ProductService } from '@av/catalog/application/services/product.service'
import { RequestContext } from '@av/common'
import {
  LocalesService,
  TranslationOrchestratorService,
  TranslationPersistenceService,
} from '@av/localize'
import { TranslationProvider } from '@av/localize/api/graphql/enum'
import { SegmentService } from '@av/seo'
import { SeoMetadataService } from '@av/seo/application/services/seo-metadata.service'
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EntityType } from '@prisma/client'

@Injectable()
export class SyncEntityTranslationsService {
  private readonly logger = new Logger(SyncEntityTranslationsService.name)
  private readonly translationProvider: string

  constructor(
    @Inject(forwardRef(() => SegmentService))
    private readonly segmentService: SegmentService,
    private readonly productService: ProductService,
    private readonly collectionService: CollectionService,
    private readonly facetService: FacetService,
    private readonly facetValueService: FacetValueService,
    private readonly seoMetadataService: SeoMetadataService,
    private readonly translationPersistenceService: TranslationPersistenceService,
    private readonly localesService: LocalesService,
    private readonly translationOrchestratorService: TranslationOrchestratorService,
    private readonly configService: ConfigService,
  ) {
    this.translationProvider = configService.get(
      'app.defaultSettings.translationProvider',
    )
  }

  async syncExistingEntities(ctx: RequestContext) {
    const productData = await this.productService.getMany(ctx, {
      take: 'all',
    })

    const collectionData = await this.collectionService.getMany(ctx, {
      take: 'all',
    })

    const facetData = await this.facetService.getMany(ctx, {
      take: 'all',
    })

    const facetValueData = await this.facetValueService.getMany(ctx, {
      take: 'all',
    })

    const seoMetadataData = await this.seoMetadataService.getMany(ctx, {
      take: 'all',
    })

    const segmentData = await this.segmentService.getMany(ctx)

    await this.syncByEntityType(ctx, EntityType.PRODUCT, productData.items, [
      'slug',
      'description',
    ])

    await this.syncByEntityType(
      ctx,
      EntityType.COLLECTION,
      collectionData.items,
      ['name', 'slug', 'description'],
    )

    await this.syncByEntityType(ctx, EntityType.FACET, facetData.items, [
      'name',
      'code',
    ])

    await this.syncByEntityType(
      ctx,
      EntityType.FACET_VALUE,
      facetValueData.items,
      ['name', 'code'],
    )

    await this.syncByEntityType(
      ctx,
      EntityType.SEO_METADATA,
      seoMetadataData.items,
      ['title', 'description', 'keywords', 'ogTitle', 'ogDescription'],
    )

    await this.syncByEntityType(ctx, EntityType.SEGMENT, segmentData, ['name'])
  }

  private async syncByEntityType(
    ctx: RequestContext,
    entityType: EntityType,
    entities: Record<string, any>[],
    translateableFieldList: string[],
  ) {
    const locales = await this.localesService.getActiveLocales(ctx)
    const langs = locales.map((l) => l.code)
    console.log({ langs })
    console.log({ entities })

    this.logger.log(`Syncing ${entityType} entities`)

    const syncResults = (
      await Promise.all(
        entities.map(async (e) => {
          const translateableFields = translateableFieldList.reduce(
            (acc, field) => {
              if (e[field]) acc[field] = e[field]
              return acc
            },
            {},
          )

          this.logger.log(`Syncing ${entityType} entity ${e.id}`)
          this.logger.log(`Fields -> ${JSON.stringify(translateableFields)}`)

          const translatedFields = await Promise.all(
            langs.map(async (l) => {
              const entries = Object.entries(translateableFields)
              const filteredFields = await Promise.all(
                entries.filter(async ([k]) => {
                  const hasTranslation =
                    await this.translationPersistenceService.translationFieldExists(
                      ctx,
                      String(e.id),
                      entityType,
                      k,
                      l,
                    )

                  if (hasTranslation)
                    this.logger.log(
                      `Translation already exists for ${k}, skipping...`,
                    )

                  return !hasTranslation
                }),
              )
              const translatedFields =
                await this.translationOrchestratorService.translateFields(
                  ctx,
                  Object.fromEntries(filteredFields) as any,
                  ctx.channel.defaultLanguageCode,
                  l,
                )
              return this.translationPersistenceService.upsertTranslations(
                ctx,
                {
                  autoGenerated: true,
                  entityId: String(e.id),
                  entityType,
                  fields: translatedFields,
                  lastSyncedAt: new Date(),
                  translationProvider: this
                    .translationProvider as TranslationProvider,
                  locale: l,
                },
              )
            }),
          )

          this.logger.log(`Synced -> ${JSON.stringify(translatedFields)}`)

          return translatedFields
        }),
      )
    ).filter(Boolean)

    console.log({ syncResults })

    return syncResults
  }
}
