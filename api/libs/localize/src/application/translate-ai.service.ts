import { Injectable } from '@nestjs/common'
import { TranslateService } from './interfaces/translation-service.interface'
import { AIService } from '@av/ai'

@Injectable()
export class TranslateAIService implements TranslateService {
  constructor(private readonly aiService: AIService) {}

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: { version?: string; isJson?: boolean } = {
      version: 'gpt-3.5-turbo',
      isJson: true,
    },
  ): Promise<string | Record<string, string>> {
    if (options.isJson) {
      const prompt = this.createJsonPrompt(text, sourceLanguage, targetLanguage)
      const response = JSON.parse(
        await this.aiService.generateResponse(prompt, options),
      )
      return response as Promise<Record<string, string>>
    }

    const prompt = this.createTextPrompt(text, sourceLanguage, targetLanguage)
    const response = await this.aiService.generateResponse(prompt, options)

    return response as Promise<string>
  }

  private createTextPrompt(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): string {
    return `Translate the following text from ${sourceLanguage} to ${targetLanguage}: "${text}"`
  }

  private createJsonPrompt(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): string {
    return `
    Translate the following json from ${sourceLanguage} to ${targetLanguage}: "${text}", return only the json object.
    
    Format: Provide the output strictly as a JSON object without any additional text, code block syntax, or formatting. Ensure it is directly parseable using JSON.parse() and ensure it's not throws bad control character in string literal error, make sure to remove all the bad characters.
    Keys: The JSON object must contain the following keys:
    `
  }
}
