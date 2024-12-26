import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
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
import {
  EntityType,
  TranslatableEntityEventEmitter,
  TranslationPersistenceService,
} from '@av/localize'

@Injectable()
export class FacetService {
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
    input: Omit<Prisma.FacetCreateInput, 'channelToken'>,
  ): Promise<Facet> {
    const createdFacet = await this.prisma.facet.create({
      data: {
        ...input,
        channelToken: ctx.channel.token,
        createdBy: ctx.user?.id || 'system',
      },
    })

    if (createdFacet && ctx.localizationSettings.enabled) {
      const translateableFields = {
        name: createdFacet.name,
        code: createdFacet.code,
      }

      this.translationEventEmitter.emitCreatedEvent(
        createdFacet.id,
        EntityType.FACET,
        translateableFields,
        ctx,
      )
    }

    return createdFacet
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: UpdateFacetInput,
  ): Promise<Facet> {
    const facet = await this.getFacetById(ctx, id)

    if (!facet) throw new NotFoundException(`Facet with ID '${id}' not found`)

    const { values, ...rest } = data

    return this.prisma.$transaction(async (prisma) => {
      if (values?.length) {
        const updatedValues = await Promise.all(
          values.map(({ id, code, name }) =>
            prisma.facetValue.update({
              where: { id },
              data: { code, name },
              select: {
                id: true,
                code: true,
                name: true,
              },
            }),
          ),
        )

        if (updatedValues.length && ctx.localizationSettings.enabled) {
          this.translationEventEmitter.emitUpdatedMultipleEvent(
            updatedValues,
            EntityType.FACET_VALUE,
            ctx,
          )
        }
      }

      const updatedFacet = await prisma.facet.update({
        where: { id },
        data: {
          ...rest,
          updatedBy: ctx.user?.id || 'system',
        },
      })

      if (
        ctx.localizationSettings.enabled &&
        !ctx.isDefaultLanguage &&
        updatedFacet
      ) {
        const translateableFields = {
          name: updatedFacet.name,
          code: updatedFacet.code,
        }

        this.translationEventEmitter.emitUpdatedEvent(
          updatedFacet.id,
          EntityType.FACET,
          translateableFields,
          ctx,
        )
      }

      return updatedFacet
    })
  }

  async delete(ctx: RequestContext, id: string): Promise<Facet> {
    const facet = await this.getFacetById(ctx, id)

    if (!facet) throw new NotFoundException(`Facet with ID '${id}' not found`)

    const deletedFacet = await this.prisma.facet.delete({
      where: { id },
      include: { values: true },
    })

    if (deletedFacet && ctx.localizationSettings.enabled) {
      const facetValueIds = deletedFacet.values.map((value) => value.id)
      this.translationEventEmitter.emitDeletedEvent(
        deletedFacet.id,
        EntityType.FACET,
        ctx,
      )

      this.translationEventEmitter.emitDeletedMultipleEvent(
        facetValueIds,
        EntityType.FACET_VALUE,
        ctx,
      )
    }

    return deletedFacet
  }

  async createFacetWithValues(
    ctx: RequestContext,
    input: CreateFacetInput & { values?: { name: string; code: string }[] },
  ): Promise<Facet> {
    const { values, ...facetData } = input

    const createdFacet = await this.prisma.facet.create({
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

    if (createdFacet && ctx.localizationSettings.enabled) {
      const translateableFields = {
        name: createdFacet.name,
        code: createdFacet.code,
      }

      this.translationEventEmitter.emitCreatedEvent(
        createdFacet.id,
        EntityType.FACET,
        translateableFields,
        ctx,
      )

      if (values) {
        const facetValues = await this.prisma.facetValue.findMany({
          where: { facetId: createdFacet.id },
          select: {
            id: true,
            name: true,
            code: true,
          },
        })

        console.log({ facetValues })

        this.translationEventEmitter.emitCreateMultipleEvent(
          facetValues,
          EntityType.FACET_VALUE,
          ctx,
        )
      }
    }

    return createdFacet
  }

  async deleteMany(
    ctx: RequestContext,
    ids: string[],
  ): Promise<Prisma.BatchPayload> {
    const facets = await this.prisma.facet.findMany({
      where: { id: { in: ids }, channelToken: ctx.channel.token },
      include: { values: true },
    })

    if (facets.length !== ids.length)
      throw new NotFoundException('Some facets not found to delete!', {
        cause: 'NOT_FOUND',
      })

    const facetValueIds = facets.flatMap((facet) =>
      facet.values.map((value) => value.id),
    )

    const deletedFacets = await this.prisma.facet.deleteMany({
      where: { id: { in: ids }, channelToken: ctx.channel.token },
    })

    if (deletedFacets && ctx.localizationSettings.enabled) {
      this.translationEventEmitter.emitDeletedMultipleEvent(
        ids,
        EntityType.FACET,
        ctx,
      )

      this.translationEventEmitter.emitDeletedMultipleEvent(
        facetValueIds,
        EntityType.FACET_VALUE,
        ctx,
      )
    }

    return deletedFacets
  }

  async getFacetById(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, any>,
  ): Promise<Facet> {
    const facet = await this.prisma.facet.findUnique({
      where: { id, channelToken: ctx.channel.token },
      include: relations || undefined,
    })

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      return (await this.translateService.mergeEntityWithTranslation(
        ctx,
        facet,
        EntityType.FACET,
        relations,
      )) as Facet
    }

    return facet
  }

  async getMany(
    ctx: RequestContext,
    params?: {
      skip?: number
      take?: number | 'all'
      cursor?: Prisma.FacetWhereUniqueInput
      where?: Prisma.FacetWhereInput
      orderBy?: Prisma.FacetOrderByWithRelationInput
    },
    relations?: Record<string, any>,
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

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      const translatedItems =
        await this.translateService.mergeEntityListWithTranslation(
          ctx,
          items,
          EntityType.FACET,
          relations,
        )

      return {
        items: translatedItems as Facet[],
        pagination: { skip, take },
      }
    }

    return {
      items: items as Facet[],
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

    if (ctx.localizationSettings.enabled && !ctx.isDefaultLanguage) {
      const translatedItems =
        await this.translateService.mergeEntityListWithTranslation(
          ctx,
          items,
          EntityType.FACET,
          relations,
        )

      return {
        items: translatedItems as Facet[],
        pagination: { skip, take },
      }
    }

    return {
      items,
      pagination: { skip, take, total },
    }
  }

  async isFacetsExists(
    ctx: RequestContext,
    ids: string[],
  ): Promise<string[] | false> {
    const facets = await this.prisma.facet.findMany({
      where: { id: { in: ids }, channelToken: ctx.channel.token },
    })

    if (facets.length === ids.length) {
      return facets.map((f) => f.id)
    }

    return false
  }
}
