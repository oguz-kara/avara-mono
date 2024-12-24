import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ConfigService } from '@nestjs/config'
import { ChannelService } from '@av/channel'
import { ChannelData } from '../context/channel-context.interface'

@Injectable()
export class ChannelGuard implements CanActivate {
  private readonly DEFAULT_CHANNEL_TOKEN: string
  private readonly DEFAULT_CHANNEL_LANGUAGE_CODE: string
  private readonly DEFAULT_CHANNEL_CURRENCY_CODE: string
  private readonly DEFAULT_CHANNEL_CODE: string

  constructor(
    private readonly channelService: ChannelService,
    private readonly configService: ConfigService,
  ) {
    this.DEFAULT_CHANNEL_TOKEN = configService.get(
      'channel.defaultChannelToken',
    )
    this.DEFAULT_CHANNEL_LANGUAGE_CODE = configService.get(
      'channel.defaultChannelLanguageCode',
    )
    this.DEFAULT_CHANNEL_CURRENCY_CODE = configService.get(
      'channel.defaultChannelCurrencyCode',
    )
    this.DEFAULT_CHANNEL_CODE = configService.get('channel.defaultChannelCode')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.setChannelToRequest(context)

    return true
  }

  private async setChannelToRequest(context: ExecutionContext) {
    const request = this.getRequest(context)

    const channelToken = request.headers['x-channel-token']

    const channel = await this.channelService.getChannelByToken(channelToken)

    console.log({ channel })

    const channelData: ChannelData = channel
      ? {
          token: channel.token,
          code: channel.code,
          defaultLanguageCode: channel.defaultLanguageCode,
          currencyCode: channel.currencyCode,
        }
      : this.getDefaultChannelData()

    console.log({ channelData })

    request.channel = channelData
  }

  private getDefaultChannelData(): ChannelData {
    return {
      token: this.DEFAULT_CHANNEL_TOKEN,
      defaultLanguageCode: this.DEFAULT_CHANNEL_LANGUAGE_CODE,
      currencyCode: this.DEFAULT_CHANNEL_CURRENCY_CODE,
      code: this.DEFAULT_CHANNEL_CODE,
    }
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
