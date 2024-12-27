import {
  Inject,
  forwardRef,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  EntityType,
  EntityType as GqlEntityType,
  TranslationPersistenceService,
} from '@av/localize'
import {
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  RequestContext,
} from '@av/common'
import { TranslatableEntityEventEmitter } from '@av/localize'

import { PaginationValidator } from '@av/common/utils/pagination.validator'
import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../../api/graphql/inputs/collection.dto'
import { RuleType } from '../../api/graphql/enums/rule.enum'
import { Collection, Prisma, Product, SeoMetadata } from '@av/database'
import { PrismaService } from '@av/database'
import { isEmpty } from 'lodash'

@Injectable()
export class CollectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
    @Inject(forwardRef(() => TranslationPersistenceService))
    private readonly translationPersistenceService: TranslationPersistenceService,
    @Inject(forwardRef(() => TranslatableEntityEventEmitter))
    private readonly translatableEntityEventEmitter: TranslatableEntityEventEmitter,
  ) {}

  async create(
    ctx: RequestContext,
    data: CreateCollectionInput,
  ): Promise<Collection> {
    const { featuredAssetId, documentIds, seoMetadata, ...rest } = data
    const inputData: Prisma.CollectionCreateInput = {
      ...rest,
      channelToken: ctx.channel.token,
      rules: {
        toJSON() {
          return data.rules
        },
      },
    }

    if (featuredAssetId)
      inputData.featuredAsset = {
        connect: { id: featuredAssetId },
      }

    if (documentIds) {
      inputData.documents = {
        connect: documentIds.map((id) => ({ id })),
      }
    }

    if (seoMetadata)
      inputData.seoMetadata = {
        create: {
          ...seoMetadata,
          channelToken: ctx.channel.token,
        },
      }

    const createdCollection = await this.prisma.collection.create({
      data: inputData,
      include: {
        seoMetadata: true,
      },
    })

    if (ctx.localizationSettings.enabled) {
      this.emitCollectionCreatedEvents(createdCollection, ctx)

      if (createdCollection.seoMetadata)
        this.emitSeoMetadataCreatedEvent(createdCollection.seoMetadata, ctx)
    }

    return createdCollection
  }

  async getById(
    ctx: RequestContext,
    id: string,
    relations: Record<string, boolean | object>,
  ): Promise<Collection> {
    const collection = await this.prisma.collection.findUnique({
      where: { id, channelToken: ctx.channel.token },
      include: relations || undefined,
    })

    if (ctx.localizationSettings.enabled)
      return (await this.translationPersistenceService.mergeEntityWithTranslation<Collection>(
        ctx,
        collection,
        EntityType.COLLECTION,
        relations,
      )) as Collection

    return collection
  }

  async getMany(
    ctx: RequestContext,
    params?: {
      skip?: number
      take?: number | 'all'
      cursor?: Prisma.CollectionWhereUniqueInput
      where?: Prisma.CollectionWhereInput
      orderBy?: Prisma.CollectionOrderByWithRelationInput
    },
    relations?: Record<string, boolean | object>,
  ): Promise<PaginatedItemsResponse<Collection>> {
    const { cursor, where, orderBy } = params || {}

    const validatedPaginatedParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginatedParams)
      throw new ExceedingMaxLimitError('Invalid pagination parameters')

    const { skip, take } = validatedPaginatedParams as PaginationParams

    const [items, total] = await this.prisma.$transaction([
      this.prisma.collection.findMany({
        skip: skip ?? 0,
        take: take ?? 10,
        cursor,
        where: { ...where, channelToken: ctx.channel.token },
        orderBy,
      }),
      this.prisma.collection.count({
        where: { ...where, channelToken: ctx.channel.token },
      }),
    ])

    if (ctx.localizationSettings.enabled) {
      const translatedItems =
        await this.translationPersistenceService.mergeEntityListWithTranslation<Collection>(
          ctx,
          items,
          EntityType.COLLECTION,
          relations,
        )

      return {
        items: translatedItems as Collection[],
        pagination: {
          skip,
          take,
          total,
        },
      }
    }

    return {
      items,
      pagination: {
        skip,
        take,
        total,
      },
    }
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: UpdateCollectionInput,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    const { featuredAssetId, documentIds, seoMetadata, ...rest } = data
    const inputData: Prisma.CollectionUpdateInput = {
      ...rest,
      channelToken: ctx.channel.token,
      rules: {
        toJSON() {
          return data.rules
        },
      },
    }

    const collection = await this.getById(ctx, id, relations)

    if (!collection)
      throw new NotFoundException('Collection not found to update!')

    if (featuredAssetId)
      inputData.featuredAsset = {
        connect: { id: featuredAssetId },
      }

    if (documentIds)
      inputData.documents = {
        connect: documentIds.map((id) => ({ id })),
      }

    if (seoMetadata && !isEmpty(seoMetadata))
      inputData.seoMetadata = {
        update: {
          ...seoMetadata,
          channelToken: ctx.channel.token,
        },
      }

    const hasSeoMetadata = await this.prisma.seoMetadata.findFirst({
      where: { collectionId: id, channelToken: ctx.channel.token },
    })

    const updatedCollection = await this.prisma.collection.update({
      where: { id },
      data: inputData,
    })

    if (ctx.localizationSettings.enabled) {
      this.emitCollectionUpdatedEvents(updatedCollection, ctx)

      if (seoMetadata && !hasSeoMetadata) {
        this.emitSeoMetadataCreatedEvent(seoMetadata as SeoMetadata, ctx)
      } else if (seoMetadata && hasSeoMetadata) {
        this.emitSeoMetadataUpdatedEvent(seoMetadata as SeoMetadata, ctx)
      }
    }

    return updatedCollection
  }

  async editParent(
    ctx: RequestContext,
    id: string,
    parentId: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    const collection = await this.getById(ctx, id, relations)
    const parentCollection = await this.getById(ctx, parentId, relations)

    if (!collection)
      throw new NotFoundException('Collection not found to update!')

    if (!parentCollection)
      throw new NotFoundException('Parent collection not found!')

    return this.prisma.collection.update({
      where: { id },
      data: {
        ...(parentId !== null
          ? { parent: { connect: { id: parentId } } }
          : { parent: { disconnect: true } }),
        updatedBy: ctx.user?.id || 'system',
      },
    })
  }

  async delete(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    const collection = await this.getById(ctx, id, relations)

    if (!collection)
      throw new NotFoundException('Collection not found to delete!')

    const deletedCollection = await this.prisma.collection.delete({
      where: { id, channelToken: ctx.channel.token },
      include: { seoMetadata: true },
    })

    if (ctx.localizationSettings.enabled && deletedCollection) {
      this.translatableEntityEventEmitter.emitDeletedEvent(
        deletedCollection.id,
        EntityType.COLLECTION,
        ctx,
      )

      if (deletedCollection?.seoMetadata?.id)
        this.translatableEntityEventEmitter.emitDeletedEvent(
          deletedCollection.seoMetadata?.id,
          EntityType.COLLECTION,
          ctx,
        )
    }

    return deletedCollection
  }

  async markAsDeleted(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    await this.getById(ctx, id, relations) // Ensure collection exists

    return this.prisma.collection.update({
      where: { id, channelToken: ctx.channel.token },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.user?.id || 'system',
      },
    })
  }

  async search(
    ctx: RequestContext,
    query: string,
    params?: {
      skip?: number
      take?: number
      where?: Prisma.CollectionWhereInput
    },
    relations?: Record<string, boolean | object>,
  ): Promise<PaginatedItemsResponse<Collection>> {
    const { skip, take, where } = params || {}

    const [items, total] = await this.prisma.$transaction([
      this.prisma.collection.findMany({
        where: {
          ...where,
          channelToken: ctx.channel.token,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take,
        include: relations || undefined,
      }),
      this.prisma.collection.count({
        where: {
          ...where,
          channelToken: ctx.channel.token,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ])

    if (ctx.localizationSettings.enabled) {
      const translatedItems =
        await this.translationPersistenceService.mergeEntityListWithTranslation<Collection>(
          ctx,
          items,
          EntityType.COLLECTION,
          relations,
        )

      return {
        items: translatedItems as Collection[],
        pagination: { skip, take, total },
      }
    }

    return {
      items,
      pagination: {
        skip,
        take,
        total,
      },
    }
  }

  async getProducts(
    ctx: RequestContext,
    collectionId: string,
    relations?: Record<string, boolean | object>,
    params?: PaginationParams,
  ): Promise<PaginatedItemsResponse<Product>> {
    const descendantIds = await this.getDescendantCollectionIds(collectionId)
    const allCollectionIds = [collectionId, ...descendantIds]

    const rules = await this.getFiltersForCollections(allCollectionIds)

    const where = this.buildCombinedFilter(rules)

    if (!where) {
      return {
        items: [],
        pagination: { skip: 0, take: 0, total: 0 },
      }
    }

    const validatedPaginationParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginationParams) throw new ExceedingMaxLimitError()

    const { skip, take } = validatedPaginationParams as PaginationParams

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: {
          ...where,
          channelToken: ctx.channel.token,
        },
        include: relations ?? undefined,
        skip,
        take,
      }),
      this.prisma.product.count({
        where: {
          ...where,
          channelToken: ctx.channel.token,
        },
      }),
    ])

    if (ctx.localizationSettings.enabled) {
      const translatedItems =
        await this.translationPersistenceService.mergeEntityListWithTranslation<Product>(
          ctx,
          items,
          EntityType.PRODUCT,
          relations,
        )

      return {
        items: translatedItems as Product[],
        pagination: { skip, take, total },
      }
    }

    return {
      items,
      pagination: { skip, take, total },
    }
  }

  private emitCollectionCreatedEvents(
    collection: Collection & {
      seoMetadata: SeoMetadata
    },
    ctx: RequestContext,
  ) {
    const translatableCollectionFields = {
      name: collection.name,
      description: collection.description,
      slug: collection.slug,
    }

    if (ctx.localizationSettings.enabled) {
      this.translatableEntityEventEmitter.emitCreatedEvent(
        collection.id,
        EntityType.COLLECTION as GqlEntityType,
        translatableCollectionFields,
        ctx,
      )
    }
  }

  private async emitSeoMetadataCreatedEvent(
    seoMetadata: SeoMetadata,
    ctx: RequestContext,
  ) {
    const translatableSeoMetadataFields = {
      name: seoMetadata?.name,
      path: seoMetadata?.path,
      title: seoMetadata?.title,
      description: seoMetadata?.description,
      keywords: seoMetadata?.keywords,
      ogTitle: seoMetadata?.ogTitle,
      ogDescription: seoMetadata?.ogDescription,
      canonicalUrl: seoMetadata?.canonicalUrl,
    }

    if (seoMetadata && ctx.localizationSettings.enabled) {
      this.translatableEntityEventEmitter.emitCreatedEvent(
        seoMetadata.id,
        EntityType.SEO_METADATA,
        translatableSeoMetadataFields,
        ctx,
      )
    }
  }

  private emitCollectionUpdatedEvents(
    collection: Collection,
    ctx: RequestContext,
  ) {
    const translatableCollectionFields = {
      name: collection.name || undefined,
      description: collection.description || undefined,
      slug: collection.slug || undefined,
    }

    this.translatableEntityEventEmitter.emitUpdatedEvent(
      collection.id,
      EntityType.COLLECTION as GqlEntityType,
      translatableCollectionFields,
      ctx,
    )
  }

  private emitSeoMetadataUpdatedEvent(
    seoMetadata: SeoMetadata,
    ctx: RequestContext,
  ) {
    const translatableSeoMetadataFields = {
      name: seoMetadata?.name || undefined,
      path: seoMetadata?.path || undefined,
      title: seoMetadata?.title || undefined,
      description: seoMetadata?.description || undefined,
      keywords: seoMetadata?.keywords || undefined,
      ogTitle: seoMetadata?.ogTitle || undefined,
      ogDescription: seoMetadata?.ogDescription || undefined,
      canonicalUrl: seoMetadata?.canonicalUrl || undefined,
    }

    this.translatableEntityEventEmitter.emitUpdatedEvent(
      seoMetadata.id,
      EntityType.SEO_METADATA,
      translatableSeoMetadataFields,
      ctx,
    )
  }

  private async getDescendantCollectionIds(
    collectionId: string,
  ): Promise<string[]> {
    const childCollections = await this.prisma.collection.findMany({
      where: { parentId: collectionId },
      select: { id: true },
    })

    let ids = childCollections.map((c) => c.id)

    for (const child of childCollections) {
      const descendants = await this.getDescendantCollectionIds(child.id)
      ids = ids.concat(descendants)
    }

    return ids
  }

  private async getFiltersForCollections(
    collectionIds: string[],
  ): Promise<any[]> {
    const collections = await this.prisma.collection.findMany({
      where: { id: { in: collectionIds } },
      select: { rules: true },
    })

    const rules = collections
      .map((col) => col.rules)
      .filter((f) => f)
      .flat()

    return rules
  }

  private buildCombinedFilter(rules: any[]): Prisma.ProductWhereInput {
    const r = rules.reduce((acc, curr) => {
      const parsedFilter = this.parseFilter(curr)
      if (parsedFilter.combineWithAnd) {
        Object.assign(acc, parsedFilter.condition)
      } else {
        if (!acc.OR) acc.OR = []
        acc.OR.push(parsedFilter.condition)
      }
      return acc
    }, {})

    return Object.keys(r).length > 0 ? r : undefined
  }

  private parseFilter(filter: any): {
    combineWithAnd: boolean
    condition: Prisma.ProductWhereInput
  } {
    switch (filter.code) {
      case RuleType.FACET_VALUE_FILTER:
        return this.buildFacetValueCondition(filter.args)
      case RuleType.PRODUCT_NAME_FILTER:
        return this.buildNameCondition(filter.args)
      default:
        throw new Error(`Unsupported filter type: ${filter.code}`)
    }
  }

  private buildFacetValueCondition(args: any[]): {
    combineWithAnd: boolean
    condition: Prisma.ProductWhereInput
  } {
    const facetValueIdsArg = args.find((arg) => arg.name === 'facetValueIds')
    const containsAnyArg = args.find((arg) => arg.name === 'containsAny')
    const combineWithAndArg = args.find((arg) => arg.name === 'combineWithAnd')

    let facetValueIds = facetValueIdsArg?.value || []
    if (typeof facetValueIds === 'string') {
      try {
        facetValueIds = JSON.parse(facetValueIds)
      } catch (error) {
        throw new Error('Invalid facetValueIds format')
      }
    }

    const containsAny = containsAnyArg?.value === 'true'

    const condition: Prisma.ProductWhereInput = {
      facetValues: containsAny
        ? { some: { id: { in: facetValueIds } } }
        : { some: { id: { in: facetValueIds } } },
    }

    return {
      condition,
      combineWithAnd: combineWithAndArg?.value === 'true',
    }
  }

  private buildNameCondition(args: any[]): {
    combineWithAnd: boolean
    condition: Prisma.ProductWhereInput
  } {
    const operatorArg = args.find((arg) => arg.name === 'operator')
    const termArg = args.find((arg) => arg.name === 'term')
    const combineWithAndArg = args.find((arg) => arg.name === 'combineWithAnd')

    const operator = operatorArg?.value || 'contains'
    const term = termArg?.value || ''

    let nameCondition: Prisma.StringFilter

    switch (operator) {
      case 'startsWith':
        nameCondition = { startsWith: term, mode: 'insensitive' }
        break
      case 'endsWith':
        nameCondition = { endsWith: term, mode: 'insensitive' }
        break
      case 'equals':
        nameCondition = { equals: term, mode: 'insensitive' }
        break
      default:
        nameCondition = { contains: term, mode: 'insensitive' }
    }

    const condition: Prisma.ProductWhereInput = {
      name: nameCondition,
    }

    return {
      condition,
      combineWithAnd: combineWithAndArg?.value === 'true',
    }
  }
}
