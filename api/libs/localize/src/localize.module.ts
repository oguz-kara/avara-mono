import { Module } from '@nestjs/common'
import { OpenAITranslateProvider } from './infrastructure/providers/open-ai-translate.provider'
import { TranslatableEntityListener } from './application/listeners/translatable-entity.listener'
import { AiModule } from '@av/ai'
import { PrismaModule } from '@av/database'
import { ChannelModule } from '@av/channel'
import { TranslatableEntityEventEmitter } from './application/emitters/translatable-entity-event.emitter'
import { TranslateProviderFactory } from './infrastructure/factories/translate-provider.factory'
import { GoogleTranslateProvider } from './infrastructure/providers/google-translate.provider'
import { LocalizationSettingsService } from './application/services/localization-settings.service'
import { TranslationOrchestratorService } from './application/services/translation-orchestrator.service'
import { TranslationPersistenceService } from './application/services/translation-persistence.service'
import { SeoMetadataTranslationService } from './application/services/seo-metadata-translation.service'
import { LocalesService } from './application/services/locales.service'

@Module({
  imports: [AiModule, PrismaModule, ChannelModule],
  providers: [
    OpenAITranslateProvider,
    TranslationPersistenceService,
    TranslationOrchestratorService,
    SeoMetadataTranslationService,
    TranslatableEntityListener,
    TranslatableEntityEventEmitter,
    TranslateProviderFactory,
    GoogleTranslateProvider,
    LocalizationSettingsService,
    LocalesService,
  ],
  exports: [
    OpenAITranslateProvider,
    GoogleTranslateProvider,
    TranslationPersistenceService,
    TranslatableEntityEventEmitter,
    TranslateProviderFactory,
    LocalizationSettingsService,
    SeoMetadataTranslationService,
    LocalesService,
  ],
})
export class LocalizeModule {}
