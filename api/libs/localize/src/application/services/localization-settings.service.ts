import { Injectable } from '@nestjs/common'
import {
  LocalizationSettings,
  Prisma,
  PrismaService,
  TranslationProvider,
} from '@av/database'
import { RequestContext } from '@av/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LocalizationSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getLocalizationSettings(
    ctx: RequestContext,
  ): Promise<LocalizationSettings> {
    const defaultSettings = this.configService.get(
      'localization.defaultSettings',
    )

    const settings = await this.prisma.localizationSettings.findFirst({
      where: { channel_token: ctx.channel.token },
    })

    if (!settings) {
      return defaultSettings
    }

    return settings
  }

  async getTranslationProvider(
    ctx: RequestContext,
  ): Promise<TranslationProvider> {
    const settings = await this.getLocalizationSettings(ctx)
    return settings.translationProvider
  }

  async getLocalizationSettingsByChannel(
    ctx: RequestContext,
  ): Promise<LocalizationSettings> {
    return this.prisma.localizationSettings.findFirst({
      where: { channel_token: ctx.channel.token },
    })
  }

  async createLocalizationSettings(
    ctx: RequestContext,
    data: Prisma.LocalizationSettingsCreateInput,
  ): Promise<LocalizationSettings> {
    return this.prisma.localizationSettings.create({
      data: { ...data, channel_token: ctx.channel.token },
    })
  }

  async updateLocalizationSettings(
    ctx: RequestContext,
    data: Prisma.LocalizationSettingsUpdateInput,
  ): Promise<LocalizationSettings> {
    const settings = await this.getLocalizationSettings(ctx)

    return this.prisma.localizationSettings.update({
      where: { id: settings.id },
      data,
    })
  }

  async deleteLocalizationSettings(ctx: RequestContext): Promise<void> {
    const settings = await this.getLocalizationSettings(ctx)

    await this.prisma.localizationSettings.delete({
      where: { id: settings.id },
    })
  }

  async isAutoTranslateEnabled(ctx: RequestContext): Promise<boolean> {
    const settings = await this.getLocalizationSettings(ctx)
    return settings.enabled && settings.autoTranslate
  }
}
