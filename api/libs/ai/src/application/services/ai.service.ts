import { Injectable } from '@nestjs/common'
import { AIProvider } from '../interfaces/ai-provider.interface'
import { ChatGPTProvider } from '../providers/chatgpt-provider'

@Injectable()
export class AIService {
  private providers: { [key: string]: AIProvider }

  constructor(private chatGPTProvider: ChatGPTProvider) {
    this.providers = {
      chatgpt: this.chatGPTProvider,
    }
  }

  async generateResponse(
    prompt: string,
    options: { version?: string } = { version: 'gpt-3.5-turbo' },
  ): Promise<any> {
    const provider = this.providers['chatgpt']
    if (!provider) {
      throw new Error(`AI provider chatgpt not supported.`)
    }

    return await provider.generateResponse(prompt, options.version)
  }
}
