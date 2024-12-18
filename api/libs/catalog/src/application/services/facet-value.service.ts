import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService, Prisma, FacetValue } from '@av/database'
import {
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  PaginationValidator,
  RequestContext,
} from '@av/common'
import { CreateFacetValueInput } from '../../api/graphql/inputs/facet-value.dto'

@Injectable()
export class FacetValueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
  ) {}

  async create(
    ctx: RequestContext,
    input: CreateFacetValueInput,
  ): Promise<FacetValue> {
    const { facetId, ...rest } = input
    return this.prisma.facetValue.create({
      data: {
        ...rest,
        channelToken: ctx.channel.token,
        createdBy: ctx.user?.id || 'system',
        facet: {
          connect: { id: facetId },
        },
      },
      include: {
        facet: true,
      },
    })
  }

  async createMany(
    ctx: RequestContext,
    input: CreateFacetValueInput[],
  ): Promise<number> {
    const result = await this.prisma.facetValue.createMany({
      data: input.map(({ facetId, ...rest }) => ({
        ...rest,
        channelToken: ctx.channel.token,
        createdBy: ctx.user?.id || 'system',
        facetId,
      })),
    })

    return result.count
  }

  async getById(ctx: RequestContext, id: string): Promise<FacetValue> {
    const facetValue = await this.prisma.facetValue.findUnique({
      where: { id, channelToken: ctx.channel.token },
      include: { facet: true },
    })

    return facetValue
  }

  async getMany(
    ctx: RequestContext,
    facetId: string,
    params?: {
      skip?: number
      take?: number
      cursor?: Prisma.FacetValueWhereUniqueInput
      where?: Prisma.FacetValueWhereInput
      orderBy?: Prisma.FacetValueOrderByWithRelationInput
    },
  ): Promise<PaginatedItemsResponse<FacetValue>> {
    const { cursor, where, orderBy } = params || {}

    const validatedPaginatedParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginatedParams) throw new ExceedingMaxLimitError()

    const { skip, take } = validatedPaginatedParams as PaginationParams

    const items = await this.prisma.facetValue.findMany({
      skip: skip ?? 0,
      take: take ?? 10,
      cursor,
      where: { ...where, channelToken: ctx.channel.token, facetId },
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

  async updateFacetValue(
    ctx: RequestContext,
    id: string,
    data: Prisma.FacetValueUpdateInput,
  ): Promise<FacetValue> {
    const facetValue = await this.getById(ctx, id)

    if (!facetValue)
      throw new NotFoundException(`FacetValue with ID '${id}' not found`)

    return this.prisma.facetValue.update({
      where: { id },
      data: {
        ...data,
        updatedBy: ctx.user?.id || 'system',
      },
    })
  }

  async deleteFacetValue(ctx: RequestContext, id: string): Promise<FacetValue> {
    const facetValue = await this.getById(ctx, id)

    if (!facetValue)
      throw new NotFoundException(`FacetValue with ID '${id}' not found`)

    return this.prisma.facetValue.delete({
      where: { id },
    })
  }

  async search(
    ctx: RequestContext,
    query: string,
    relations?: Record<string, boolean | object>,
    params?: {
      skip?: number
      take?: number
      where?: Prisma.FacetValueWhereInput
    },
  ): Promise<PaginatedItemsResponse<FacetValue>> {
    const { skip, take } = this.paginationValidator.validatePaginationParams({
      skip: params?.skip,
      take: params?.take,
    })

    const searchConditions: Prisma.FacetValueWhereInput = {
      channelToken: ctx.channel.token,
      OR: [{ name: { contains: query, mode: 'insensitive' } }],
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.facetValue.findMany({
        where: searchConditions,
        skip,
        take,
        include: relations ?? undefined,
      }),
      this.prisma.facetValue.count({ where: searchConditions }),
    ])

    return {
      items,
      pagination: { skip, take, total },
    }
  }
}
