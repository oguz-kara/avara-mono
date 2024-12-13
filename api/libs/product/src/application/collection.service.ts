import { Injectable } from '@nestjs/common'

import { PrismaService, Collection, Prisma, Product } from '@av/database'
import {
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  RequestContext,
} from '@av/common'
import { PaginationValidator } from '@av/common/utils/pagination.validator'
import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../api/graphql/inputs/collection.dto'
import { RuleType } from '../api/graphql/enums/rule.enum'

@Injectable()
export class CollectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
  ) {}

  async create(
    ctx: RequestContext,
    data: CreateCollectionInput,
  ): Promise<Collection> {
    const { featuredAssetId, documentIds, seoMetadata, productIds, ...rest } =
      data
    const inputData: Prisma.CollectionCreateInput = {
      ...rest,
      channelToken: ctx.channel.token,
      rules: {
        toJSON() {
          return data.rules
        },
      },
    }

    if (productIds) {
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

    return await this.prisma.collection.create({
      data: inputData,
    })
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

    return collection
  }

  async getMany(
    ctx: RequestContext,
    params?: {
      skip?: number
      take?: number
      cursor?: Prisma.CollectionWhereUniqueInput
      where?: Prisma.CollectionWhereInput
      orderBy?: Prisma.CollectionOrderByWithRelationInput
    },
  ): Promise<PaginatedItemsResponse<Collection>> {
    const { cursor, where, orderBy } = params || {}

    console.log(where)

    const validatedPaginatedParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginatedParams)
      throw new ExceedingMaxLimitError('Invalid pagination parameters')

    const { skip, take } = validatedPaginatedParams as PaginationParams

    const items = await this.prisma.collection.findMany({
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
    data: UpdateCollectionInput,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    const { featuredAssetId, documentIds, seoMetadata, productIds, ...rest } =
      data
    const inputData: Prisma.CollectionUpdateInput = {
      ...rest,
      channelToken: ctx.channel.token,
      rules: {
        toJSON() {
          return data.rules
        },
      },
    }

    await this.getById(ctx, id, relations)

    if (productIds) {
    }

    if (featuredAssetId)
      inputData.featuredAsset = {
        connect: { id: featuredAssetId },
      }

    if (documentIds)
      inputData.documents = {
        connect: documentIds.map((id) => ({ id })),
      }

    if (seoMetadata)
      inputData.seoMetadata = {
        update: {
          ...seoMetadata,
          channelToken: ctx.channel.token,
        },
      }

    return this.prisma.collection.update({
      where: { id },
      data: inputData,
    })
  }

  async editParent(
    ctx: RequestContext,
    id: string,
    parentId: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    await this.getById(ctx, id, relations) // Ensure collection exists

    return this.prisma.collection.update({
      where: { id },
      data: {
        parent: {
          connect: { id: parentId },
        },
        updatedBy: ctx.user?.id || 'system',
      },
    })
  }

  async delete(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Collection> {
    await this.getById(ctx, id, relations) // Ensure collection exists

    return this.prisma.collection.delete({
      where: { id, channelToken: ctx.channel.token },
    })
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
  ): Promise<PaginatedItemsResponse<Collection>> {
    const { skip, take, where } = params || {}

    const items = await this.prisma.collection.findMany({
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
    })

    return {
      items,
      pagination: {
        skip,
        take,
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

    console.log(JSON.stringify({ rules }, null, 2))

    const where = this.buildCombinedFilter(rules)

    console.log(JSON.stringify({ where }, null, 2))

    const validatedPaginationParams =
      this.paginationValidator.validatePaginationParams({
        skip: params?.skip,
        take: params?.take,
      })

    if (!validatedPaginationParams) throw new ExceedingMaxLimitError()

    const { skip, take } = validatedPaginationParams as PaginationParams

    const items = await this.prisma.product.findMany({
      where: {
        ...where,
        channelToken: ctx.channel.token,
      },
      include: relations ?? undefined,
      skip,
      take,
    })

    return {
      items,
      pagination: { skip: skip ?? 0, take: take ?? 10 },
    }
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
    return rules.reduce((acc, curr) => {
      const parsedFilter = this.parseFilter(curr)
      if (parsedFilter.combineWithAnd) {
        Object.assign(acc, parsedFilter.condition)
      } else {
        if (!acc.OR) acc.OR = []
        acc.OR.push(parsedFilter.condition)
      }
      return acc
    }, {})
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
