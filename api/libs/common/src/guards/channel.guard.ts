import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ConfigService } from '@nestjs/config'
import { ChannelService } from '@av/channel'
import { ChannelData } from '../context/channel-context.interface'
import { Channel, LocalizationSettings } from '@av/database'

@Injectable()
export class ChannelGuard implements CanActivate {
  private readonly defaultChannel: Channel
  private readonly defaultLocalizationSettings: LocalizationSettings

  constructor(
    private readonly channelService: ChannelService,
    private readonly configService: ConfigService,
  ) {
    this.defaultChannel = configService.get('channel.defaultChannel')
    this.defaultLocalizationSettings = configService.get(
      'localization.defaultSettings',
    )
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.setLocalizationSettingsToRequest(context)
    await this.setChannelToRequest(context)

    return true
  }

  private async setChannelToRequest(context: ExecutionContext) {
    const request = this.getRequest(context)

    const channelToken = request.headers['x-channel-token']

    const channel = channelToken
      ? await this.channelService.getChannelByToken(channelToken)
      : this.getDefaultChannelData()

    const channelData: ChannelData = {
      token: channel.token,
      code: channel.code,
      defaultLanguageCode: channel.defaultLanguageCode,
      currencyCode: channel.currencyCode,
    }

    request.channel = channelData
  }

  private setLocalizationSettingsToRequest(context: ExecutionContext) {
    const request = this.getRequest(context)

    const settings = this.getDefaultLocalizationSettings()

    request.localizationSettings = settings
  }

  private getDefaultChannelData(): ChannelData {
    return this.defaultChannel
  }

  private getDefaultLocalizationSettings(): LocalizationSettings {
    return this.defaultLocalizationSettings
  }

  private getRequest(context: ExecutionContext) {
    const isGraphQL = (context.getType() as string) === 'graphql'

    if (isGraphQL) {
      return GqlExecutionContext.create(context).getContext().req
    } else {
      return context.switchToHttp().getRequest()
    }
  }
}
