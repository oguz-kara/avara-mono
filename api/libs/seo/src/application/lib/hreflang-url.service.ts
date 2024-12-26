import { Injectable, Logger } from '@nestjs/common'
import { RequestContext } from '@av/common'
import { ConfigService } from '@nestjs/config'
import { SegmentService } from '../services/segment.service'

export type HreflangUrl = {
  rel: 'canonical' | 'alternate'
  hreflang: string
  url: string
}

@Injectable()
export class HreflangUrlsService {
  private readonly logger = new Logger(HreflangUrlsService.name)
  private readonly clientBaseUrl: string

  constructor(
    private readonly configService: ConfigService,
    private readonly segmentService: SegmentService,
  ) {
    this.clientBaseUrl = this.configService.get('client.baseUrl')
  }

  async createSortedHreflangUrls(
    ctx: RequestContext,
    defaultSlug: string,
    translations: Record<string, string>[],
    segmentPath: string,
  ): Promise<HreflangUrl[]> {
    if (!segmentPath) {
      this.logger.error('Segment path not found at createSortedHreflangUrls')
      return []
    }

    const segment = await this.segmentService.getSegmentByPath(ctx, segmentPath)

    const urls = await Promise.all(
      translations.map(async (translation) => {
        const localizedSegment = segment.translations.find(
          (s) => s.locale === translation.locale,
        )
        if (!localizedSegment) {
          this.logger.error(
            `Localized segment not found for locale: ${translation.locale}`,
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
      defaultSlug,
      segment.segment.name,
      'x-default',
    )
    const defaultLangUrl = await this.createHreflangUrlEntry(
      ctx,
      defaultSlug,
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
          xDefaultUrl,
        ]

    return [...urls.filter(Boolean), ...cn].sort((a, b) => {
      if (a?.rel === 'canonical') return -1
      if (b?.rel === 'canonical') return 1
      if (a?.hreflang === 'x-default') return -1
      if (b?.hreflang === 'x-default') return 1
      return 0
    }) as HreflangUrl[]
  }

  private async createHreflangUrlEntry(
    ctx: RequestContext,
    slug: string,
    localizedSegment: string,
    lang?: string,
  ): Promise<HreflangUrl | null> {
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
}
