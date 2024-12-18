import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService, Prisma, Facet } from '@av/database'
import {
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  PaginationValidator,
  RequestContext,
} from '@av/common'
import {
  CreateFacetInput,
  UpdateFacetInput,
} from '../../api/graphql/inputs/facet.dto'

@Injectable()
export class FacetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
  ) {}

  // Create a new facet
  async createFacet(
    ctx: RequestContext,
    input: Omit<Prisma.FacetCreateInput, 'channelToken'>,
  ): Promise<Facet> {
    return this.prisma.facet.create({
      data: {
        ...input,
        channelToken: ctx.channel.token,
        createdBy: ctx.user?.id || 'system',
      },
    })
  }

  async getFacetById(ctx: RequestContext, id: string): Promise<Facet> {
    const facet = await this.prisma.facet.findUnique({
      where: { id, channelToken: ctx.channel.token },
      include: { values: true },
    })

    return facet
  }

  async getMany(
    ctx: RequestContext,
    relations: Record<string, any>,
    params?: {
      skip?: number
      take?: number
      cursor?: Prisma.FacetWhereUniqueInput
      where?: Prisma.FacetWhereInput
      orderBy?: Prisma.FacetOrderByWithRelationInput
    },
  ): Promise<PaginatedItemsResponse<Facet>> {
    const { cursor, where, orderBy } = params || {}

    const validatedPaginatedParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginatedParams) throw new ExceedingMaxLimitError()

    const { skip, take } = validatedPaginatedParams as PaginationParams

    const items = await this.prisma.facet.findMany({
      skip: skip ?? 0,
      take: take ?? 10,
      cursor,
      where: { ...where, channelToken: ctx.channel.token },
      orderBy,
      include: relations ?? undefined,
    })

    return {
      items,
      pagination: {
        skip,
        take,
      },
    }
  }

  async updateFacet(
    ctx: RequestContext,
    id: string,
    data: UpdateFacetInput,
  ): Promise<Facet> {
    const facet = await this.getFacetById(ctx, id)

    if (!facet) {
      throw new NotFoundException(`Facet with ID '${id}' not found`)
    }

    const { values, ...rest } = data

    return this.prisma.$transaction(async (prisma) => {
      if (values?.length) {
        await Promise.all(
          values.map(({ id, code, name }) =>
            prisma.facetValue.update({
              where: { id },
              data: { code, name },
            }),
          ),
        )
      }

      return prisma.facet.update({
        where: { id },
        data: {
          ...rest,
          updatedBy: ctx.user?.id || 'system',
        },
      })
    })
  }

  async delete(ctx: RequestContext, id: string): Promise<Facet> {
    await this.getFacetById(ctx, id)
    return this.prisma.facet.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.user?.id || 'system',
      },
    })
  }

  async deleteMany(
    ctx: RequestContext,
    ids: string[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.facet.deleteMany({
      where: { id: { in: ids }, channelToken: ctx.channel.token },
    })
  }

  async createFacetWithValues(
    ctx: RequestContext,
    input: CreateFacetInput & { values?: { name: string; code: string }[] },
  ): Promise<Facet> {
    const { values, ...facetData } = input

    return this.prisma.facet.create({
      data: {
        ...facetData,
        channelToken: ctx.channel.token,
        createdBy: ctx.user?.id || 'system',
        values: values
          ? {
              create: values.map((value) => ({
                ...value,
                channelToken: ctx.channel.token,
                createdBy: ctx.user?.id || 'system',
              })),
            }
          : undefined,
      },
      include: {
        values: true,
      },
    })
  }

  async search(
    ctx: RequestContext,
    query: string,
    relations?: Record<string, boolean | object>,
    params?: {
      skip?: number
      take?: number
      where?: Prisma.FacetWhereInput
    },
  ): Promise<PaginatedItemsResponse<Facet>> {
    const { skip, take } = this.paginationValidator.validatePaginationParams({
      skip: params?.skip,
      take: params?.take,
    })

    const searchConditions: Prisma.FacetWhereInput = {
      channelToken: ctx.channel.token,
      OR: [{ name: { contains: query, mode: 'insensitive' } }],
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.facet.findMany({
        where: searchConditions,
        skip,
        take,
        include: relations ?? undefined,
      }),
      this.prisma.facet.count({ where: searchConditions }),
    ])

    return {
      items,
      pagination: { skip, take, total },
    }
  }
}
