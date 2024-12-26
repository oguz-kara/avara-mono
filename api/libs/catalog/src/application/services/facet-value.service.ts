import {
  Inject,
  forwardRef,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService, Prisma, FacetValue } from '@av/database'
import {
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  PaginationValidator,
  RequestContext,
} from '@av/common'
import { CreateFacetValueInput } from '../../api/graphql/inputs/facet-value.dto'
import {
  EntityType,
  TranslatableEntityEventEmitter,
  TranslationPersistenceService,
} from '@av/localize'

@Injectable()
export class FacetValueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
    @Inject(forwardRef(() => TranslatableEntityEventEmitter))
    private readonly translationEventEmitter: TranslatableEntityEventEmitter,
    @Inject(forwardRef(() => TranslationPersistenceService))
    private readonly translateService: TranslationPersistenceService,
  ) {}

  async create(
    ctx: RequestContext,
    input: CreateFacetValueInput,
  ): Promise<FacetValue> {
    const { facetId, ...rest } = input
    const createdFacetValue = await this.prisma.facetValue.create({
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

    if (ctx.localizationSettings.enabled) {
      this.translationEventEmitter.emitCreatedEvent(
        createdFacetValue.id,
        EntityType.FACET_VALUE,
        { name: createdFacetValue.name, code: createdFacetValue.code },
        ctx,
      )
    }

    return createdFacetValue
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

    const createdFacetValues = await this.prisma.facetValue.findMany({
      where: { code: { in: input.map(({ code }) => code) } },
    })

    if (ctx.localizationSettings.enabled && result.count) {
      this.translationEventEmitter.emitCreateMultipleEvent(
        createdFacetValues.map(({ id, code, name }) => ({ id, code, name })),
        EntityType.FACET_VALUE,
        ctx,
      )
    }

    return result.count
  }

  async updateFacetValue(
    ctx: RequestContext,
    id: string,
    data: Prisma.FacetValueUpdateInput,
  ): Promise<FacetValue> {
    const facetValue = await this.getById(ctx, id)

    if (!facetValue)
      throw new NotFoundException(`FacetValue with ID '${id}' not found`)

    const updatedFacetValues = await this.prisma.facetValue.update({
      where: { id },
      data: {
        ...data,
        updatedBy: ctx.user?.id || 'system',
      },
    })

    if (ctx.localizationSettings.enabled) {
      this.translationEventEmitter.emitUpdatedEvent(
        updatedFacetValues.id,
        EntityType.FACET_VALUE,
        { name: updatedFacetValues.name, code: updatedFacetValues.code },
        ctx,
      )
    }

    return updatedFacetValues
  }

  async deleteFacetValue(ctx: RequestContext, id: string): Promise<FacetValue> {
    const facetValue = await this.getById(ctx, id)

    if (!facetValue)
      throw new NotFoundException(`FacetValue with ID '${id}' not found`)

    const deletedFacetValue = await this.prisma.facetValue.delete({
      where: { id },
    })

    if (ctx.localizationSettings.enabled) {
      this.translationEventEmitter.emitDeletedEvent(
        deletedFacetValue.id,
        EntityType.FACET_VALUE,
        ctx,
      )
    }

    return deletedFacetValue
  }

  async getById(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<FacetValue> {
    const facetValue = await this.prisma.facetValue.findUnique({
      where: { id, channelToken: ctx.channel.token },
      include: { facet: true },
    })

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      return (await this.translateService.mergeEntityWithTranslation(
        ctx,
        facetValue,
        EntityType.FACET_VALUE,
        relations,
      )) as FacetValue
    }

    return facetValue
  }

  async getManyByFacetId(
    ctx: RequestContext,
    facetId: string,
    params?: {
      skip?: number
      take?: number | 'all'
      cursor?: Prisma.FacetValueWhereUniqueInput
      where?: Prisma.FacetValueWhereInput
      orderBy?: Prisma.FacetValueOrderByWithRelationInput
    },
    relations?: Record<string, boolean | object>,
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

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      const translatedFacetValues =
        await this.translateService.mergeEntityListWithTranslation(
          ctx,
          items,
          EntityType.FACET_VALUE,
          relations,
        )

      return {
        items: translatedFacetValues as FacetValue[],
        pagination: {
          skip,
          take,
        },
      }
    }

    return {
      items: items as FacetValue[],
      pagination: {
        skip,
        take,
      },
    }
  }

  async getMany(
    ctx: RequestContext,
    params?: {
      skip?: number
      take?: number | 'all'
      cursor?: Prisma.FacetValueWhereUniqueInput
      where?: Prisma.FacetValueWhereInput
      orderBy?: Prisma.FacetValueOrderByWithRelationInput
    },
    relations?: Record<string, boolean | object>,
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
      where: { ...where, channelToken: ctx.channel.token },
      orderBy,
    })

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      const translatedFacetValues =
        await this.translateService.mergeEntityListWithTranslation(
          ctx,
          items,
          EntityType.FACET_VALUE,
          relations,
        )

      return {
        items: translatedFacetValues as FacetValue[],
        pagination: {
          skip,
          take,
        },
      }
    }

    return {
      items: items as FacetValue[],
      pagination: {
        skip,
        take,
      },
    }
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

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      const translatedFacetValues =
        await this.translateService.mergeEntityListWithTranslation(
          ctx,
          items,
          EntityType.FACET_VALUE,
          relations,
        )

      return {
        items: translatedFacetValues as FacetValue[],
        pagination: {
          skip,
          take,
        },
      }
    }

    return {
      items: items as FacetValue[],
      pagination: { skip, take, total },
    }
  }
}
