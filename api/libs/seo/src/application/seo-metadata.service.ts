import { EventEmitter2 } from '@nestjs/event-emitter'
import { Injectable } from '@nestjs/common'

import { PrismaService, SeoMetadata, Prisma, EntityType } from '@av/database'
import {
  EVENT_LIST,
  ExceedingMaxLimitError,
  PaginatedItemsResponse,
  PaginationParams,
  RequestContext,
} from '@av/common'
import { PaginationValidator } from '@av/common/utils/pagination.validator'
import { GqlEntityType, TranslatableEntityEventEmitter } from '@av/localize'
import {
  SeoMetadataCreatedEvent,
  SeoMetadataDeletedEvent,
  SeoMetadataUpdatedEvent,
} from './events/seo-metadata.events'
import { TranslationPersistenceService } from '@av/localize/application/translation-persistence.service'

@Injectable()
export class SeoMetadataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationValidator: PaginationValidator,
    private readonly translatableEntityEventEmitter: TranslatableEntityEventEmitter,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationPersistenceService,
  ) {}

  async create(
    ctx: RequestContext,
    data: Omit<Prisma.SeoMetadataCreateInput, 'channelToken'>,
  ): Promise<SeoMetadata> {
    const createdSeoMetadata = await this.prisma.seoMetadata.create({
      data: {
        ...data,
        channelToken: ctx.channel.token,
      },
    })

    const translatableSeoMetadataFields = {
      name: createdSeoMetadata?.name,
      path: createdSeoMetadata?.path,
      title: createdSeoMetadata?.title,
      description: createdSeoMetadata?.description,
      keywords: createdSeoMetadata?.keywords,
      ogTitle: createdSeoMetadata?.ogTitle,
      ogDescription: createdSeoMetadata?.ogDescription,
    }

    this.translatableEntityEventEmitter.emitCreatedEvent(
      createdSeoMetadata.id,
      EntityType.SEO_METADATA as GqlEntityType,
      translatableSeoMetadataFields,
      ctx,
    )

    this.eventEmitter.emit(
      EVENT_LIST.SEO_METADATA_CREATED,
      new SeoMetadataCreatedEvent(ctx, createdSeoMetadata),
    )

    return createdSeoMetadata
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
    const updatedSeoMetadata = await this.prisma.seoMetadata.update({
      where: { id },
      data: {
        ...data,
      },
    })

    const translatableSeoMetadataFields = {
      name: updatedSeoMetadata?.name,
      path: updatedSeoMetadata?.path,
      title: updatedSeoMetadata?.title,
      description: updatedSeoMetadata?.description,
      keywords: updatedSeoMetadata?.keywords,
      ogTitle: updatedSeoMetadata?.ogTitle,
      ogDescription: updatedSeoMetadata?.ogDescription,
    }

    this.translatableEntityEventEmitter.emitUpdatedEvent(
      updatedSeoMetadata.id,
      EntityType.SEO_METADATA as GqlEntityType,
      translatableSeoMetadataFields,
      ctx,
    )

    this.eventEmitter.emit(
      EVENT_LIST.SEO_METADATA_UPDATED,
      new SeoMetadataUpdatedEvent(ctx, updatedSeoMetadata),
    )

    return updatedSeoMetadata
  }

  async delete(ctx: RequestContext, id: string): Promise<SeoMetadata> {
    const deletedSeoMetadata = await this.prisma.seoMetadata.delete({
      where: { id, channelToken: ctx.channel.token },
    })

    this.translatableEntityEventEmitter.emitDeletedEvent(
      deletedSeoMetadata.id,
      EntityType.SEO_METADATA as GqlEntityType,
      ctx,
    )

    this.eventEmitter.emit(
      EVENT_LIST.SEO_METADATA_DELETED,
      new SeoMetadataDeletedEvent(ctx, deletedSeoMetadata),
    )

    return deletedSeoMetadata
  }
}
