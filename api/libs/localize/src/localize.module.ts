import { Module } from '@nestjs/common'
import { OpenAITranslateProvider } from './infrastructure/providers/open-ai-translate.provider'
import { TranslationPersistenceService } from './application/translation-persistence.service'
import { TranslatableEntityListener } from './application/listeners/translatable-entity.listener'
import { TranslationResolver } from './api/graphql/translation.resolver'
import { AiModule } from '@av/ai'
import { PrismaModule } from '@av/database'
import { ChannelModule } from '@av/channel'
import { RequestContextModule } from '@av/common'
import { TranslatableEntityEventEmitter } from './application/emitters/translatable-entity-event.emitter'
import { TranslateProviderFactory } from './infrastructure/factories/translate-provider.factory'
import { GoogleTranslateProvider } from './infrastructure/providers/google-translate.provider'
import { LocalizationSettingsService } from './application/services/localization-settings.service'

@Module({
  imports: [AiModule, PrismaModule, ChannelModule, RequestContextModule],
  providers: [
    OpenAITranslateProvider,
    TranslationPersistenceService,
    TranslatableEntityListener,
    TranslationResolver,
    TranslatableEntityEventEmitter,
    TranslateProviderFactory,
    GoogleTranslateProvider,
    LocalizationSettingsService,
  ],
  exports: [
    OpenAITranslateProvider,
    GoogleTranslateProvider,
    TranslationPersistenceService,
    TranslatableEntityEventEmitter,
    LocalizationSettingsService,
    TranslateProviderFactory,
  ],
})
export class LocalizeModule {}
