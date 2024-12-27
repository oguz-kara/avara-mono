import { RequestContext } from '@av/common'
import { PrismaService } from '@av/database'
import { Injectable } from '@nestjs/common'

@Injectable()
export class LocalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveLocales(ctx: RequestContext) {
    return this.prisma.locales.findMany({
      where: {
        channel_token: ctx.channel?.token,
        isActive: true,
      },
    })
  }

  async hasLocale(ctx: RequestContext, locale: string) {
    const locales = await this.getActiveLocales(ctx)
    return locales.some((l) => l.code === locale)
  }
}
