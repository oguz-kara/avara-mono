import { Injectable } from '@nestjs/common'
import { TranslateProvider } from '../../application/interfaces/translation-service.interface'
import { AIService } from '@av/ai'
import { TranslationProvider } from '@prisma/client'
import { LocalizationSettingsService } from '../../application/services/localization-settings.service'
import { RequestContext } from '@av/common'

@Injectable()
export class OpenAITranslateProvider implements TranslateProvider {
  constructor(
    private readonly aiService: AIService,
    private readonly localizationSettingsService: LocalizationSettingsService,
  ) {}

  async translate(
    ctx: RequestContext,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: { version?: string } = {},
  ): Promise<string | Record<string, string>> {
    if (!text) {
      return ''
    }

    try {
      const model = await this.getTranslationModel(ctx, options.version)
      const prompt = this.createTextPrompt(text, sourceLanguage, targetLanguage)
      const response = await this.aiService.generateResponse(prompt, {
        ...options,
        version: model,
      })

      if (!response) {
        throw new Error('Translation failed - empty response received')
      }

      return response
    } catch (error) {
      console.error('Translation failed:', error)
      throw new Error(`Failed to translate text: ${error.message}`)
    }
  }

  private async getTranslationModel(
    ctx: RequestContext,
    version?: string,
  ): Promise<string> {
    if (version) {
      return version
    }

    const settings =
      await this.localizationSettingsService.getLocalizationSettings(ctx)
    return this.translationProviderMapper(settings.translationProvider)
  }

  private createTextPrompt(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): string {
    return `Translate the following text from ${sourceLanguage} to ${targetLanguage} and return only the translated text: -> ${text}
    
    Format: Provide the output strictly as a string without any additional text, code block syntax, or formatting. Ensure it is directly parseable using JSON.parse() and ensure it's not throws bad control character in string literal error, make sure to remove all the bad characters.
    
    Example:
    Input: Hello, how are you?
    Output: Merhaba, nasılsınız?
    
    Input: The weather is nice today.
    Output: Hava güzel bugün.
    
    Input: I love programming.
    Output: Programlamayı seviyorum.
    
    `
  }

  private translationProviderMapper(provider: TranslationProvider): string {
    switch (provider) {
      case TranslationProvider.GPT_3_5_TURBO:
        return 'gpt-3.5-turbo'
      case TranslationProvider.GPT_4:
        return 'gpt-4'
      case TranslationProvider.GPT_4_O:
        return 'gpt-4o'
      case TranslationProvider.GPT_4_O_MINI:
        return 'gpt-4o-mini'
      case TranslationProvider.GPT_O1:
        return 'gpt-o1'
      case TranslationProvider.GPT_O1_MINI:
        return 'gpt-o1-mini'
      default:
        return 'gpt-3.5-turbo'
    }
  }
}
