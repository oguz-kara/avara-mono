import { UseInterceptors } from '@nestjs/common'
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'

import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'

import { SegmentService } from '@av/seo/application/services/segment.service'
import {
  CreateSegmentInput,
  SegmentsResponseType,
} from '../types/segment.types'

@Resolver(() => SegmentsResponseType)
@UseInterceptors(RequestContextInterceptor)
export class SegmentResolver {
  constructor(private readonly segmentService: SegmentService) {}

  @Query(() => SegmentsResponseType)
  async segments(@Ctx() ctx: RequestContext): Promise<SegmentsResponseType> {
    const segments = await this.segmentService.getSegmentsWithTranslations(ctx)
    return { segments }
  }

  @Mutation(() => SegmentsResponseType)
  async createSegment(
    @Ctx() ctx: RequestContext,
    @Args('input') input: CreateSegmentInput,
  ): Promise<SegmentsResponseType> {
    const segments = await this.segmentService.createSegment(ctx, input)

    return { segments }
  }
}
