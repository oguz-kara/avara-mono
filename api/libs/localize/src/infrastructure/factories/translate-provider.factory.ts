import { Injectable } from '@nestjs/common'

import { TranslateProvider } from '../../application/interfaces/translation-service.interface'
import { OpenAITranslateProvider } from '../providers/open-ai-translate.provider'
import { GoogleTranslateProvider } from '../providers/google-translate.provider'
import { TranslateModelType, TranslationProvider } from '@av/database'
import { RequestContext } from '@av/common'
import { LocalizationSettingsService } from '@av/localize/application/services/localization-settings.service'

@Injectable()
export class TranslateProviderFactory {
  constructor(
    private readonly googleTranslateProvider: GoogleTranslateProvider,
    private readonly openAITranslateProvider: OpenAITranslateProvider,
    private readonly localizationSettingsService: LocalizationSettingsService,
  ) {}

  async getProvider(
    ctx: RequestContext,
    provider: TranslationProvider,
  ): Promise<TranslateProvider> {
    const providerName = await this.getTranslateProviderName(ctx, provider)
    console.log({ providerName })

    if (providerName === TranslateModelType.GOOGLE_TRANSLATE) {
      return this.googleTranslateProvider
    }

    return this.openAITranslateProvider
  }

  async getTranslateProviderName(
    ctx: RequestContext,
    provider: TranslationProvider,
  ): Promise<string> {
    if (!provider) {
      const settings =
        await this.localizationSettingsService.getLocalizationSettings(ctx)
      provider =
        settings?.translationProvider ?? TranslationProvider.GPT_3_5_TURBO
    }

    if (provider === TranslationProvider.GOOGLE_TRANSLATE)
      return TranslateModelType.GOOGLE_TRANSLATE

    return TranslateModelType.GPT
  }
}
