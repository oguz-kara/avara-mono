import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { EVENT_LIST, TranslateableEntityCreatedEvent } from '@av/common'
import { TranslateAIService } from '../translate-ai.service'
import { PrismaService } from '@av/database'
import { TranslationPersistenceService } from '../translation-persistence.service'
import { ChannelService } from '@av/channel'
import { TranslateableEntityUpdatedEvent } from '@av/common/events/translateable-entity.updated.event'

@Injectable()
export class TranslatableEntityListener {
  private readonly logger = new Logger(TranslatableEntityListener.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly translateAiService: TranslateAIService,
    private readonly translationPersistenceService: TranslationPersistenceService,
    private readonly channelService: ChannelService,
  ) {}

  @OnEvent(EVENT_LIST.TRANSLATEABLE_ENTITY_CREATED)
  async handleTranslateableEntityCreatedEvent(
    event: TranslateableEntityCreatedEvent,
  ) {
    const { entityId, entityType, fields, ctx } = event

    const fieldsToTranslate = Object.entries(fields)
      .filter((entry) => Boolean(entry[1]))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    const channel = await this.channelService.getChannelByToken(
      ctx,
      ctx.channel.token,
      {
        channelSettings: true,
      },
    )

    const autoTranslate = channel.channelSettings?.autoTranslate || true

    if (!autoTranslate) {
      this.logger.debug(
        `Auto translate is disabled for channel ${channel.token}`,
      )

      this.logger.debug(`Aborting listener...`, {
        channel: channel.token,
        entityType,
        entityId,
      })
      return
    }

    if (Object.keys(fieldsToTranslate).length === 0) {
      this.logger.debug(`No fields to translate for entity ${entityId}`, {
        channel: channel.token,
        entityType,
        entityId,
      })
      return
    }

    const langs = await this.prisma.locales.findMany({
      where: {
        channel_token: channel.token,
      },
    })

    const translations = await Promise.all(
      langs.map(async (lang) => {
        this.logger.debug(
          `Translating fields ${JSON.stringify(fieldsToTranslate)} from ${ctx.channel.defaultLanguageCode} to ${lang.code}`,
        )
        const translatedContent = await this.translateAiService.translate(
          JSON.stringify(fieldsToTranslate),
          ctx.channel.defaultLanguageCode,
          lang.code,
        )

        this.logger.debug(
          `Translated fields ${JSON.stringify(translatedContent)} to ${lang.code}`,
        )

        const createdTranslation =
          await this.translationPersistenceService.upsertTranslations(ctx, {
            entityType: entityType,
            entityId: entityId.toString(),
            locale: lang.code,
            fields: translatedContent as Record<string, string>,
            autoGenerated: true,
          })

        this.logger.debug(
          `Created translation ${JSON.stringify(createdTranslation)}`,
        )

        return createdTranslation
      }),
    )

    return translations
  }

  async handleTranslateableEntityUpdatedEvent(
    event: TranslateableEntityUpdatedEvent,
  ) {
    const { entityId, entityType, fields, ctx } = event

    const fieldsToTranslate = Object.entries(fields)
      .filter((entry) => Boolean(entry[1]))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    const channel = await this.channelService.getChannelByToken(
      ctx,
      ctx.channel.token,
      {
        channelSettings: true,
      },
    )

    const autoTranslate = channel.channelSettings?.autoTranslate || true

    if (!autoTranslate) {
      this.logger.debug(
        `Auto translate is disabled for channel ${channel.token}`,
      )

      this.logger.debug(`Aborting listener...`, {
        channel: channel.token,
        entityType,
        entityId,
      })
      return
    }

    if (Object.keys(fieldsToTranslate).length === 0) {
      this.logger.debug(`No fields to translate for entity ${entityId}`, {
        channel: channel.token,
        entityType,
        entityId,
      })
      return
    }

    const langs = await this.prisma.locales.findMany({
      where: {
        channel_token: channel.token,
      },
    })

    const translations = await Promise.all(
      langs.map(async (lang) => {
        this.logger.debug(
          `Updating translation of fields ${JSON.stringify(fieldsToTranslate)} from ${ctx.channel.defaultLanguageCode} to ${lang.code}`,
        )
        const translatedContent = await this.translateAiService.translate(
          JSON.stringify(fieldsToTranslate),
          ctx.channel.defaultLanguageCode,
          lang.code,
        )

        this.logger.debug(
          `Updated translation fields ${JSON.stringify(translatedContent)} to ${lang.code}`,
        )

        const updatedTranslation =
          await this.translationPersistenceService.upsertTranslations(ctx, {
            entityType: entityType,
            entityId: entityId.toString(),
            locale: lang.code,
            fields: translatedContent as Record<string, string>,
            autoGenerated: true,
          })

        this.logger.debug(
          `Updated translation ${JSON.stringify(updatedTranslation)}`,
        )

        return updatedTranslation
      }),
    )

    return translations
  }
}
