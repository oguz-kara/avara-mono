import { RequestContext } from '@av/common'
import { TranslationPersistenceService } from './translation-persistence.service'
import { Injectable } from '@nestjs/common'
import { SeoMetadataTranslation } from '../types'
import { EntityType, SeoMetadata } from '@av/database'

@Injectable()
export class SeoMetadataTranslationService {
  constructor(
    private readonly translationPersistenceService: TranslationPersistenceService,
  ) {}

  async getTranslationBySeoMetadataId(
    ctx: RequestContext,
    seoMetadataId: string,
  ): Promise<SeoMetadataTranslation | null> {
    const translation = await this.translationPersistenceService.getTranslation(
      ctx,
      EntityType.SEO_METADATA,
      seoMetadataId,
      ctx.languageCode,
    )

    if (!translation) {
      return null
    }

    return translation as SeoMetadataTranslation
  }

  async mergeTranslationWithSeoMetadata(
    ctx: RequestContext,
    seoMetadata: SeoMetadata,
  ) {
    const seoMetadataTranslation = await this.getTranslationBySeoMetadataId(
      ctx,
      seoMetadata.id,
    )

    if (!seoMetadataTranslation) {
      return seoMetadata
    }

    const mergedSeoMetadata = {
      ...seoMetadata,
      title: seoMetadataTranslation.title,
      description: seoMetadataTranslation.description,
      keywords: seoMetadataTranslation.keywords,
      ogTitle: seoMetadataTranslation.ogTitle,
      ogDescription: seoMetadataTranslation.ogDescription,
    }

    return mergedSeoMetadata
  }
}
