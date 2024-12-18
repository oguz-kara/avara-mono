import { Injectable } from '@nestjs/common'
import { AIProvider } from '../interfaces/ai-provider.interface'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import type { ChatCompletionMessage } from 'openai/resources/chat'
import { AIModel } from '../types/version.type'

@Injectable()
export class ChatGPTProvider implements AIProvider {
  private openai: OpenAI

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('CHATGPT_API_KEY'),
    })
  }

  async generateResponse(
    prompt: string,
    model: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    try {
      const messages: ChatCompletionMessage[] = [
        { role: 'assistant', content: prompt },
      ] as any

      const response = await this.openai.chat.completions.create({
        model,
        messages,
      })

      return response.choices[0].message?.content.trim() || ''
    } catch (error) {
      // Handle errors appropriately
      console.error('Error generating response from ChatGPT:', error)
      throw new Error('Failed to generate response from ChatGPT.')
    }
  }
}
