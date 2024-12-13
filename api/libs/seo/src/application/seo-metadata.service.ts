import { Injectable } from '@nestjs/common'

import { PrismaService, SeoMetadata, Prisma } from '@av/database'
import {
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  RequestContext,
} from '@av/common'
import { PaginationValidator } from '@av/common/utils/pagination.validator'

@Injectable()
export class SeoMetadataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
  ) {}

  async create(
    ctx: RequestContext,
    data: Omit<Prisma.SeoMetadataCreateInput, 'channelToken'>,
  ): Promise<SeoMetadata> {
    return this.prisma.seoMetadata.create({
      data: {
        ...data,
        channelToken: ctx.channel.token,
      },
    })
  }

  async getById(ctx: RequestContext, id: string): Promise<SeoMetadata> {
    const seoMetadata = await this.prisma.seoMetadata.findUnique({
      where: { id, channelToken: ctx.channel.token },
    })

    return seoMetadata
  }

  async getMany(
    ctx: RequestContext,
    params?: {
      skip?: number
      take?: number
      cursor?: Prisma.SeoMetadataWhereUniqueInput
      where?: Prisma.SeoMetadataWhereInput
      orderBy?: Prisma.SeoMetadataOrderByWithRelationInput
    },
  ): Promise<PaginatedItemsResponse<SeoMetadata>> {
    const { cursor, where, orderBy } = params || {}

    const validatedPaginatedParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginatedParams) throw new ExceedingMaxLimitError()

    const { skip, take } = validatedPaginatedParams as PaginationParams

    const items = await this.prisma.seoMetadata.findMany({
      skip: skip ?? 0,
      take: take ?? 10,
      cursor,
      where: { ...where, channelToken: ctx.channel.token },
      orderBy,
    })

    return {
      items,
      pagination: {
        skip,
        take,
      },
    }
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: Prisma.SeoMetadataUpdateInput,
  ): Promise<SeoMetadata> {
    return this.prisma.seoMetadata.update({
      where: { id },
      data: {
        ...data,
      },
    })
  }

  async delete(ctx: RequestContext, id: string): Promise<SeoMetadata> {
    return this.prisma.seoMetadata.delete({
      where: { id, channelToken: ctx.channel.token },
    })
  }
}
