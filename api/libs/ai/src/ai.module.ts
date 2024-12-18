import { Module } from '@nestjs/common'
import { AIService } from './application/services/ai.service'
import { ChatGPTProvider } from './application/providers/chatgpt-provider'

@Module({
  providers: [AIService, ChatGPTProvider],
  exports: [AIService],
})
export class AiModule {}
