import { Injectable } from '@nestjs/common'
import { TranslateProvider } from '../../application/interfaces/translation-service.interface'
import { LocalizationSettingsService } from '../../application/services/localization-settings.service'
import { RequestContext } from '@av/common'
import { ConfigService } from '@nestjs/config'
import { Translate } from '@google-cloud/translate/build/src/v2'

@Injectable()
export class GoogleTranslateProvider implements TranslateProvider {
  private readonly client: Translate

  constructor(
    private readonly localizationSettingsService: LocalizationSettingsService,
    private readonly appConfig: ConfigService,
  ) {
    this.client = new Translate({
      projectId: this.appConfig.get<string>('googleCloud.projectId'),
      key: this.appConfig.get<string>('googleCloud.apiKey'),
    })
  }

  async translate(
    ctx: RequestContext,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string | Record<string, string>> {
    if (!text) {
      return ''
    }

    const isSlug = text.includes('-') && !text.includes(' ')

    if (isSlug)
      return await this.translateSlug(text, sourceLanguage, targetLanguage)

    try {
      const [response] = await this.client.translate(text, {
        from: sourceLanguage,
        to: targetLanguage,
        format: 'text',
      })

      if (!response) {
        throw new Error('Translation failed - no translations received')
      }

      return response
    } catch (error) {
      console.error('Translation failed:', error)
      throw new Error(`Failed to translate text: ${error.message}`)
    }
  }

  private async translateSlug(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const words = text.split('-')
    try {
      const [response] = await this.client.translate(words.join(' '), {
        from: sourceLanguage,
        to: targetLanguage,
        format: 'text',
      })

      if (!response) {
        throw new Error('Translation failed - no translations received')
      }

      return response
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
    } catch (error) {
      console.error('Translation failed:', error)
      throw new Error(`Failed to translate slug: ${error.message}`)
    }
  }
}
