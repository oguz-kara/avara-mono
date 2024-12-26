import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService, Product, Prisma } from '@av/database'
import { EntityType } from '@av/localize'
import {
  EntityType as GraphQLEntityType,
  TranslationPersistenceService,
} from '@av/localize'
import { EVENT_LIST, PaginatedItemsResponse, RequestContext } from '@av/common'
import { PaginationValidator } from '@av/common/utils/pagination.validator'
import {
  CreateProductInput,
  UpdateProductInput,
} from '../../api/graphql/types/product.types'
import { TranslatableEntityEventEmitter } from '@av/localize'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SeoMetadata } from '@av/seo'

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly paginationValidator: PaginationValidator,
    @Inject(forwardRef(() => TranslatableEntityEventEmitter))
    private readonly translatableEntityEventEmitter: TranslatableEntityEventEmitter,
    @Inject(forwardRef(() => TranslationPersistenceService))
    private readonly translationPersistenceService: TranslationPersistenceService,
  ) {}

  async create(
    ctx: RequestContext,
    data: CreateProductInput,
  ): Promise<Product> {
    const input = this.buildCreateProductInput(data, ctx)

    if (data?.facetValueIds?.length > 0)
      await this.verifyFacetValuesExist(data.facetValueIds)

    const createdProduct = await this.prisma.product.create({
      data: input,
      include: { seoMetadata: true, featuredAsset: true },
    })

    this.emitProductCreatedEvents(createdProduct, ctx)

    if (data?.seoMetadata) {
      const createdSeoMetadata = await this.prisma.seoMetadata.findFirst({
        where: { productId: createdProduct.id },
      })

      this.emitSeoMetadataCreatedEvent(createdSeoMetadata, ctx)
    }

    return createdProduct
  }

  async getById(
    ctx: RequestContext,
    id: string,
    options?: {
      translated?: boolean
      relations?: Record<string, boolean | object>
    },
  ): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, channelToken: ctx.channel.token },
      include: options?.relations ?? undefined,
    })

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found.`)

    if (ctx.localizationSettings.enabled && options?.translated) {
      const translatedProduct =
        await this.translationPersistenceService.mergeEntityWithTranslation<Product>(
          ctx,
          product,
          EntityType.PRODUCT,
          options?.relations,
        )

      return translatedProduct as Product
    }

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

    if (ctx.localizationSettings.enabled) {
      const translatedProduct =
        await this.translationPersistenceService.mergeEntityWithTranslation<Product>(
          ctx,
          product,
          EntityType.PRODUCT,
          relations,
        )

      return translatedProduct as Product
    }

    return product
  }

  async getMany(
    ctx: RequestContext,
    params?: {
      skip?: number
      take?: number | 'all'
      where?: Prisma.ProductWhereInput
      orderBy?: Prisma.ProductOrderByWithRelationInput
    },
    relations?: Record<string, boolean | object>,
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

    if (ctx.localizationSettings.enabled) {
      const translatedProduct =
        await this.translationPersistenceService.mergeEntityListWithTranslation<Product>(
          ctx,
          items as any,
          EntityType.PRODUCT,
          relations,
        )

      return {
        items: translatedProduct as any,
        pagination: { skip, take, total },
      }
    }

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

    const { facetValueIds, seoMetadata } = data

    if (facetValueIds) await this.verifyFacetValuesExist(facetValueIds)

    const input = this.buildUpdateProductInput(data, ctx)

    const hasSeoMetadata = await this.prisma.seoMetadata.findFirst({
      where: { productId: id, channelToken: ctx.channel.token },
    })

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: input,
      include: relations ?? undefined,
    })

    this.emitProductUpdatedEvents(updatedProduct, ctx)

    if (seoMetadata && !hasSeoMetadata) {
      this.emitSeoMetadataCreatedEvent(seoMetadata as SeoMetadata, ctx)
    } else if (seoMetadata && hasSeoMetadata) {
      this.emitSeoMetadataUpdatedEvent(seoMetadata as SeoMetadata, ctx)
    }

    return updatedProduct
  }

  async delete(
    ctx: RequestContext,
    id: string,
    relations?: Record<string, boolean | object>,
  ): Promise<Product> {
    await this.getById(ctx, id, relations)

    const deletedProduct = await this.prisma.product.delete({
      where: { id },
      include: { seoMetadata: true },
    })

    if (ctx.localizationSettings.enabled && deletedProduct) {
      this.translatableEntityEventEmitter.emitDeletedEvent(
        deletedProduct.id,
        EntityType.PRODUCT as GraphQLEntityType,
        ctx,
      )

      if (deletedProduct.seoMetadata?.id)
        this.translatableEntityEventEmitter.emitDeletedEvent(
          deletedProduct.seoMetadata.id,
          EntityType.SEO_METADATA,
          ctx,
        )
    }

    return deletedProduct
  }

  async deleteMany(
    ctx: RequestContext,
    ids: string[],
    relations?: Record<string, boolean | object>,
  ): Promise<Prisma.BatchPayload> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: { ...relations, seoMetadata: true },
    })

    const seoMetadataIds = products
      .map((p) => p.seoMetadata?.id)
      .filter(Boolean)

    if (products.length !== ids.length)
      throw new NotFoundException(`Products not found: ${ids.join(', ')}`)

    const count = await this.prisma.product.deleteMany({
      where: { id: { in: ids }, channelToken: ctx.channel.token },
    })

    this.translatableEntityEventEmitter.emitDeletedMultipleEvent(
      ids,
      EntityType.PRODUCT,
      ctx,
    )

    if (seoMetadataIds.length > 0) {
      this.translatableEntityEventEmitter.emitDeletedMultipleEvent(
        seoMetadataIds,
        EntityType.SEO_METADATA,
        ctx,
      )
    }

    return count
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

    if (ctx.localizationSettings.enabled) {
      const translatedProduct =
        await this.translationPersistenceService.mergeEntityListWithTranslation<Product>(
          ctx,
          items,
          EntityType.PRODUCT,
          relations,
        )

      return {
        items: translatedProduct as Product[],
        pagination: { skip, take, total },
      }
    }

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
        EntityType.SEO_METADATA as GraphQLEntityType,
        translatableSeoMetadataFields,
        ctx,
      )
    }
  }

  private emitProductCreatedEvents(
    product: Product & { seoMetadata: SeoMetadata | null },
    ctx: RequestContext,
  ) {
    const translatableProductFields = {
      name: product.name,
      description: product.description,
      slug: product.slug,
    }

    this.eventEmitter.emit(EVENT_LIST.PRODUCT_CREATED, {
      product,
      seoMetadata: product.seoMetadata || null,
      ctx,
    })

    if (ctx.localizationSettings.enabled) {
      this.translatableEntityEventEmitter.emitCreatedEvent(
        product.id,
        EntityType.PRODUCT as GraphQLEntityType,
        translatableProductFields,
        ctx,
      )
    }
  }

  private emitProductUpdatedEvents(product: Product, ctx: RequestContext) {
    const translatableProductFields = {
      name: product.name || undefined,
      description: product.description || undefined,
      slug: product.slug || undefined,
    }

    this.translatableEntityEventEmitter.emitUpdatedEvent(
      product.id,
      EntityType.PRODUCT as GraphQLEntityType,
      translatableProductFields,
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
      EntityType.SEO_METADATA as GraphQLEntityType,
      translatableSeoMetadataFields,
      ctx,
    )
  }

  private buildCreateProductInput(
    product: CreateProductInput,
    ctx: RequestContext,
  ): Prisma.ProductCreateInput {
    const {
      facetValueIds = [],
      documentIds = [],
      seoMetadata,
      featuredAssetId,
      ...productData
    } = product

    return {
      ...productData,
      channelToken: ctx.channel.token,
      createdBy: ctx.user?.id || 'system',
      ...(featuredAssetId && {
        featuredAsset: { connect: { id: featuredAssetId } },
      }),
      ...(seoMetadata && {
        seoMetadata: {
          create: {
            ...seoMetadata,
            channelToken: ctx.channel.token,
          },
        },
      }),
      ...(facetValueIds.length > 0 && {
        facetValues: { connect: facetValueIds.map((id) => ({ id })) },
      }),
      ...(documentIds.length > 0 && {
        documents: { connect: documentIds.map((id) => ({ id })) },
      }),
    }
  }

  private buildUpdateProductInput(
    product: UpdateProductInput,
    ctx: RequestContext,
  ): Prisma.ProductUpdateInput {
    const {
      facetValueIds,
      documentIds,
      seoMetadata,
      featuredAssetId,
      ...productData
    } = product

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

    return input
  }
}
