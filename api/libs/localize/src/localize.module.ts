import { forwardRef, Module } from '@nestjs/common'
import { OpenAITranslateProvider } from './infrastructure/providers/open-ai-translate.provider'
import { TranslatableEntityListener } from './application/listeners/translatable-entity.listener'
import { TranslationResolver } from './api/graphql/translation.resolver'
import { AiModule } from '@av/ai'
import { PrismaModule } from '@av/database'
import { ChannelModule } from '@av/channel'
import { CommonModule, RequestContextModule } from '@av/common'
import { TranslatableEntityEventEmitter } from './application/emitters/translatable-entity-event.emitter'
import { TranslateProviderFactory } from './infrastructure/factories/translate-provider.factory'
import { GoogleTranslateProvider } from './infrastructure/providers/google-translate.provider'
import { LocalizationSettingsService } from './application/services/localization-settings.service'
import { TranslationOrchestratorService } from './application/services/translation-orchestrator.service'
import { TranslationPersistenceService } from './application/services/translation-persistence.service'
import { SeoMetadataTranslationService } from './application/services/seo-metadata-translation.service'
import { LocalesService } from './application/services/locales.service'
import { SyncEntityTranslationsService } from './application/services/sync-entity-translations.service'
import { LangSyncResolver } from './api/graphql/lang-sync.resolver'
import { CatalogModule } from '@av/catalog'
import { SeoModule } from '@av/seo'

@Module({
  imports: [
    AiModule,
    PrismaModule,
    ChannelModule,
    RequestContextModule,
    CommonModule,
    forwardRef(() => SeoModule),
    forwardRef(() => CatalogModule),
  ],
  providers: [
    OpenAITranslateProvider,
    TranslationPersistenceService,
    TranslationOrchestratorService,
    SeoMetadataTranslationService,
    TranslatableEntityListener,
    TranslationResolver,
    LangSyncResolver,
    TranslatableEntityEventEmitter,
    TranslateProviderFactory,
    GoogleTranslateProvider,
    LocalizationSettingsService,
    LocalesService,
    SyncEntityTranslationsService,
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
