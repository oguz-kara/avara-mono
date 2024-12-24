import { NotFoundException, Injectable } from '@nestjs/common'
import { PrismaService, Channel, Prisma, ChannelType } from '@av/database'
import { RequestContext } from '@av/common'
import { generateChannelToken } from '@av/common'

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}

  async createChannel(
    ctx: RequestContext,
    data: Prisma.ChannelCreateInput,
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
        data: { ...data, token, createdBy },
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

  async getChannelByToken(token: string): Promise<Channel | null> {
    const channel = await this.prisma.channel.findUnique({
      where: { token },
    })

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
  ): Promise<Channel> {
    const channel = await this.prisma.channel.findFirst({ where: { token } })
    if (channel) return channel

    const defaultChannel = await this.prisma.channel.findFirst({
      where: { isDefault: true },
    })
    if (defaultChannel) return defaultChannel

    return this.createChannel(ctx, {
      code: 'default',
      name: 'Default Channel',
      isDefault: true,
      type: ChannelType.RETAIL,
      currencyCode: 'USD',
      defaultLanguageCode: 'en',
      token: generateChannelToken(),
      createdBy: ctx.user?.id,
    })
  }
}
