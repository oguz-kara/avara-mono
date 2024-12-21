import { Module } from '@nestjs/common'
import { TranslateAIService } from './application/translate-ai.service'
import { TranslationPersistenceService } from './application/translation-persistence.service'
import { TranslatableEntityListener } from './application/listeners/translatable-entity.listener'
import { TranslationResolver } from './api/graphql/translation.resolver'
import { AiModule } from '@av/ai'
import { PrismaModule } from '@av/database'
import { ChannelModule } from '@av/channel'
import { RequestContextModule } from '@av/common'
import { TranslatableEntityEventEmitter } from './application/emitters/translatable-entity-event.emitter'

@Module({
  imports: [AiModule, PrismaModule, ChannelModule, RequestContextModule],
  providers: [
    TranslateAIService,
    TranslationPersistenceService,
    TranslatableEntityListener,
    TranslationResolver,
    TranslatableEntityEventEmitter,
  ],
  exports: [
    TranslateAIService,
    TranslationPersistenceService,
    TranslatableEntityEventEmitter,
  ],
})
export class LocalizeModule {}
