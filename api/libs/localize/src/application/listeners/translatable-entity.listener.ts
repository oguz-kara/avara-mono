import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import {
  EVENT_LIST,
  TranslateableEntityCreatedEvent,
  TranslateableEntityDeletedEvent,
  TranslateableEntityDeletedMultipleEvent,
  TranslateableEntityUpdatedEvent,
} from '@av/common'

import { TranslationOrchestratorService } from '../services/translation-orchestrator.service'
import { LocalizationSettingsService } from '../services/localization-settings.service'
import { TranslateableEntityCreatedMultipleEvent } from '@av/common/events/translateable-entity-created-multiple.event'
import { TranslateableEntityUpdatedMultipleEvent } from '@av/common/events/translateable-entity-updated-multiple.event'

@Injectable()
export class TranslatableEntityListener {
  constructor(
    private readonly translationOrchestratorService: TranslationOrchestratorService,
    private readonly localizationSettingsService: LocalizationSettingsService,
  ) {}

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_CREATED)
  async handleTranslateableEntityCreatedEvent(
    event: TranslateableEntityCreatedEvent,
  ) {
    if (await this.isLocalizationEnabled(event)) {
      return this.translationOrchestratorService.handleEntityCreatedEvent(event)
    }
  }

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_UPDATED)
  async handleTranslateableEntityUpdatedEvent(
    event: TranslateableEntityUpdatedEvent,
  ) {
    if (await this.isLocalizationEnabled(event)) {
      return this.translationOrchestratorService.handleEntityUpdatedEvent(event)
    }
  }

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_DELETED)
  async handleTranslateableEntityDeletedEvent(
    event: TranslateableEntityDeletedEvent,
  ) {
    if (await this.isLocalizationEnabled(event)) {
      return this.translationOrchestratorService.handleEntityDeletedEvent(event)
    }
  }

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_DELETED_MULTIPLE)
  async handleTranslateableEntityDeletedMultipleEvent(
    event: TranslateableEntityDeletedMultipleEvent,
  ) {
    if (await this.isLocalizationEnabled(event)) {
      console.log('event emitted')
      return this.translationOrchestratorService.handleEntityDeletedMultipleEvent(
        event,
      )
    }
  }

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_CREATED_MULTIPLE)
  async handleTranslateableEntityCreatedMultipleEvent(
    event: TranslateableEntityCreatedMultipleEvent,
  ) {
    return this.translationOrchestratorService.handleEntityCreatedMultipleEvent(
      event,
    )
  }

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_UPDATED_MULTIPLE)
  async handleTranslateableEntityUpdatedMultipleEvent(
    event: TranslateableEntityUpdatedMultipleEvent,
  ) {
    return this.translationOrchestratorService.handleEntityUpdatedMultipleEvent(
      event,
    )
  }

  private async isLocalizationEnabled(event: any): Promise<boolean> {
    console.log('event', event)
    if (!event.ctx?.channel?.token) {
      return false
    }

    return await this.localizationSettingsService.isAutoTranslateEnabled(
      event.ctx,
    )
  }
}
