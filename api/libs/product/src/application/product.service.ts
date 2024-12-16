import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService, Product, Prisma } from '@av/database'
import { PaginatedItemsResponse, RequestContext } from '@av/common'
import { PaginationValidator } from '@av/common/utils/pagination.validator'
import {
  CreateProductInput,
  UpdateProductInput,
} from '../api/graphql/types/product.types'

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
  ) {}

  async create(
    ctx: RequestContext,
    data: CreateProductInput,
  ): Promise<Product> {
    const {
      facetValueIds,
      documentIds,
      seoMetadata,
      featuredAssetId,
      ...productData
    } = data
    const input: Prisma.ProductCreateInput = {
      ...productData,
      channelToken: ctx.channel.token,
    }

    if (featuredAssetId) {
      input.featuredAsset = {
        connect: { id: featuredAssetId },
      }
    }

    if (seoMetadata) {
      input.seoMetadata = {
        create: {
          ...seoMetadata,
          channelToken: ctx.channel.token,
        },
      }
    }

    if (facetValueIds) {
      input.facetValues = {
        connect: facetValueIds.map((id) => ({ id })),
      }
    }

    if (documentIds) {
      input.documents = {
        connect: documentIds.map((id) => ({ id })),
      }
    }

    if (facetValueIds && facetValueIds.length > 0)
      await this.verifyFacetValuesExist(facetValueIds)

    return this.prisma.product.create({
      data: {
        ...input,
        createdBy: ctx.user?.id || 'system',
        channelToken: ctx.channel.token,
      },
    })
  }

  async getById(
    ctx: RequestContext,
    id: string,
    relations: Record<string, boolean | object>,
  ): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, channelToken: ctx.channel.token },
      include: relations ?? undefined,
    })

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found.`)

    return product
  }

  async getBySlug(
    ctx: RequestContext,
    slug: string,
    relations: Record<string, boolean | object>,
  ): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { slug, channelToken: ctx.channel.token },
      include: relations ?? undefined,
    })

    if (!product)
      throw new NotFoundException(`Product with slug ${slug} not found.`)

    return product
  }

  async getMany(
    ctx: RequestContext,
    relations: Record<string, boolean | object>,
    params?: {
      skip?: number
      take?: number
      where?: Prisma.ProductWhereInput
      orderBy?: Prisma.ProductOrderByWithRelationInput
    },
  ): Promise<PaginatedItemsResponse<Product>> {
    const { skip, take } =
      this.paginationValidator.validatePaginationParams(params)

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take,
        where: { ...params?.where, channelToken: ctx.channel.token },
        include: relations ?? undefined,
      }),
      this.prisma.product.count({
        where: { ...params?.where, channelToken: ctx.channel.token },
      }),
    ])

    return {
      items,
      pagination: { skip, take, total },
    }
  }

  async update(
    ctx: RequestContext,
    id: string,
    data: UpdateProductInput,
    relations?: Record<string, boolean | object>,
  ): Promise<Product> {
    await this.getById(ctx, id, relations)

    const {
      facetValueIds,
      documentIds,
      seoMetadata,
      featuredAssetId,
      ...productData
    } = data

    const input: Prisma.ProductUpdateInput = {
      ...productData,
      channelToken: ctx.channel.token,
    }

    if (featuredAssetId) {
      input.featuredAsset = {
        connect: { id: featuredAssetId },
      }
    }

    if (facetValueIds) {
      await this.verifyFacetValuesExist(facetValueIds)

      input.facetValues = {
        set: facetValueIds.map((id) => ({ id })),
      }
    }

    if (documentIds)
      input.documents = {
        set: documentIds.map((id) => ({ id })),
      }

    if (seoMetadata)
      input.seoMetadata = {
        update: {
          ...seoMetadata,
        },
      }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...input,
        updatedBy: ctx.user?.id || 'system',
      },
      include: relations ?? undefined,
    })
  }

  async delete(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Product> {
    await this.getById(ctx, id, relations)

    return this.prisma.product.delete({
      where: { id },
    })
  }

  async deleteMany(
    ctx: RequestContext,
    ids: string[],
    relations?: Record<string, boolean | object>,
  ): Promise<Prisma.BatchPayload> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: relations ?? undefined,
    })

    if (products.length !== ids.length)
      throw new NotFoundException(`Products not found: ${ids.join(', ')}`)

    return this.prisma.product.deleteMany({
      where: { id: { in: ids } },
    })
  }

  async markAsDeleted(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Product> {
    await this.getById(ctx, id, relations)

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.user?.id || 'system',
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
      where?: Prisma.ProductWhereInput
    },
  ): Promise<PaginatedItemsResponse<Product>> {
    const { skip, take } = this.paginationValidator.validatePaginationParams({
      skip: params?.skip,
      take: params?.take,
    })

    const searchConditions: Prisma.ProductWhereInput = {
      channelToken: ctx.channel.token,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
      ],
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: searchConditions,
        skip,
        take,
        include: relations ?? undefined,
      }),
      this.prisma.product.count({ where: searchConditions }),
    ])

    return {
      items,
      pagination: { skip, take, total },
    }
  }

  async addFacetValues(
    ctx: RequestContext,
    id: string,
    facetValueIds: string[],
    relations?: Record<string, boolean | object>,
  ): Promise<Product> {
    await this.getById(ctx, id, relations)
    await this.verifyFacetValuesExist(facetValueIds)

    return this.prisma.product.update({
      where: { id },
      data: {
        facetValues: {
          connect: facetValueIds.map((facetValueId) => ({ id: facetValueId })),
        },
        updatedBy: ctx.user?.id || 'system',
      },
    })
  }

  async removeFacetValues(
    ctx: RequestContext,
    id: string,
    facetValueIds: string[],
    relations?: Record<string, boolean | object>,
  ): Promise<Product> {
    await this.getById(ctx, id, relations)
    await this.verifyFacetValuesExist(facetValueIds)

    return this.prisma.product.update({
      where: { id },
      data: {
        facetValues: {
          disconnect: facetValueIds.map((facetValueId) => ({
            id: facetValueId,
          })),
        },
        updatedBy: ctx.user?.id || 'system',
      },
    })
  }

  private async verifyFacetValuesExist(ids: string[]): Promise<void> {
    const existingFacetValues = await this.prisma.facetValue.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    })

    const existingIds = existingFacetValues.map((fv) => fv.id)
    const missingIds = ids.filter((id) => !existingIds.includes(id))

    if (missingIds.length > 0) {
      throw new ConflictException(
        `Facet values not found: ${missingIds.join(', ')}`,
        'SOME_FACET_VALUES_DO_NOT_EXIST',
      )
    }
  }
}
