import { Injectable } from '@nestjs/common'
import { AIProvider } from '../interfaces/ai-provider.interface'
import { ChatGPTProvider } from '../providers/chatgpt-provider'

@Injectable()
export class AIService {
  private providers: { [key: string]: AIProvider }

  constructor(private chatGPTProvider: ChatGPTProvider) {
    this.providers = {
      chatgpt: this.chatGPTProvider,
      // Future providers can be added here
    }
  }

  async generateResponse(prompt: string): Promise<any> {
    const provider = this.providers['chatgpt']
    if (!provider) {
      throw new Error(`AI provider chatgpt not supported.`)
    }

    return JSON.parse(await provider.generateResponse(prompt))
  }
}
