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
    return `Translate the following text from ${sourceLanguage} to ${targetLanguage}: "${text}" and return only the translated text.
    e.g., Hello, world! -> Hola, mundo!
    `
  }

  private createJsonPrompt(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): string {
    return `
      Translate the following JSON object from ${sourceLanguage} to ${targetLanguage}. 
      Output the result strictly as a valid JSON object, without any additional text, code block syntax, or comments. 
  
      Instructions:
      - Only translate the values in the JSON object; do not modify the keys.
      - The output must be directly parseable using JSON.parse() without causing any errors.
      - Remove any invalid control characters or formatting issues in the input to ensure the JSON remains valid.
      - Preserve the JSON structure exactly as it is while translating the values.
  
      Input JSON:
      ${text}
  
      Output: A valid JSON object with all values translated into ${targetLanguage}.
    `
  }
}
