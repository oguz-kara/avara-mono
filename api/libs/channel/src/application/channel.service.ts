import { NotFoundException, Injectable } from '@nestjs/common'
import {
  PrismaService,
  Channel,
  Prisma,
  ChannelType,
  ChannelSettings,
} from '@av/database'
import { RequestContext } from '@av/common'
import { generateChannelToken } from '@av/common'

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}

  async createChannel(
    ctx: RequestContext,
    data: Prisma.ChannelCreateInput,
    relations: Prisma.ChannelInclude = {},
  ): Promise<Channel> {
    const token = generateChannelToken()
    const createdBy = ctx.user?.id || 'system'

    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.channel.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        })
      }

      return await tx.channel.create({
        data: {
          ...data,
          token,
          createdBy,
        },
        include: relations || undefined,
      })
    })
  }

  // Get Channel by ID
  async getChannelById(ctx: RequestContext, id: number): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({ where: { id } })
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} does not exist.`)
    }
    return channel
  }

  async getChannelByToken(
    ctx: RequestContext,
    token: string,
    relations: Prisma.ChannelInclude = {},
  ): Promise<Channel & { channelSettings: ChannelSettings }> {
    const channel = await this.prisma.channel.findUnique({
      where: { token },
      include: relations || undefined,
    })
    if (!channel) {
      throw new NotFoundException(`Channel with token ${token} does not exist.`)
    }

    return channel
  }

  async updateChannel(
    ctx: RequestContext,
    id: number,
    data: Prisma.ChannelUpdateInput,
  ): Promise<Channel> {
    await this.getChannelById(ctx, id)
    const createdBy = ctx.user?.id || 'system'

    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.channel.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        })
      }

      return await tx.channel.update({
        where: { id },
        data: { ...data, createdBy },
      })
    })
  }

  async deleteChannel(ctx: RequestContext, id: number): Promise<Channel> {
    await this.getChannelById(ctx, id) // Ensure the channel exists
    return await this.prisma.channel.delete({ where: { id } })
  }

  async listChannels(
    ctx: RequestContext,
    params?: Prisma.ChannelFindManyArgs,
  ): Promise<Channel[]> {
    return await this.prisma.channel.findMany(params)
  }

  async getOrCreateDefaultChannel(
    ctx: RequestContext,
    token: string,
  ): Promise<Channel & { settings: Partial<ChannelSettings> }> {
    const channel = await this.prisma.channel.findFirst({
      where: { token },
      include: { channelSettings: true },
    })
    if (channel)
      return {
        ...channel,
        settings: {
          baseUrl: channel.channelSettings.baseUrl,
          autoTranslate: channel.channelSettings.autoTranslate,
        },
      }

    const defaultChannel = await this.prisma.channel.findFirst({
      where: { isDefault: true },
      include: { channelSettings: true },
    })
    if (defaultChannel)
      return {
        ...defaultChannel,
        settings: {
          baseUrl: defaultChannel.channelSettings.baseUrl,
          autoTranslate: defaultChannel.channelSettings.autoTranslate,
        },
      }

    const createdChannel = (await this.createChannel(
      ctx,
      {
        code: 'default',
        name: 'Default Channel',
        isDefault: true,
        type: ChannelType.RETAIL,
        currencyCode: 'USD',
        defaultLanguageCode: 'en',
        token: generateChannelToken(),
        createdBy: ctx.user?.id,
      },
      { channelSettings: true },
    )) as Channel & { channelSettings: ChannelSettings }

    return {
      ...createdChannel,
      settings: {
        baseUrl: createdChannel.channelSettings.baseUrl,
        autoTranslate: createdChannel.channelSettings.autoTranslate,
      },
    }
  }
}
