import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'
import { UseInterceptors } from '@nestjs/common'
import { TranslationResponse, TranslationResponseArray } from './types'
import { UpsertTranslationInput } from './dto'
<<<<<<< HEAD
import { TranslationPersistenceService } from '../../application/translation-persistence.service'
import { GqlEntityType as GraphQLEntityType } from '@av/localize'
=======
import { EntityType as GraphQLEntityType } from '@av/localize'
import { TranslationPersistenceService } from '@av/localize/application/services/translation-persistence.service'
>>>>>>> integrate-keycloak

@Resolver(() => TranslationResponse)
@UseInterceptors(RequestContextInterceptor)
export class TranslationResolver {
  constructor(
    private readonly translationPersistenceService: TranslationPersistenceService,
  ) {}

  @Mutation(() => TranslationResponse)
  async upsertTranslation(
    @Args('input') input: UpsertTranslationInput,
    @Ctx() ctx: RequestContext,
  ): Promise<TranslationResponse> {
    return this.translationPersistenceService.upsertTranslations(ctx, input)
  }

  @Query(() => TranslationResponse)
  async translation(
    @Ctx() ctx: RequestContext,
    @Args('entityId', { type: () => String }) entityId: string,
    @Args('entityType', { type: () => GraphQLEntityType })
    entityType: GraphQLEntityType,
    @Args('locale', { type: () => String }) locale: string,
  ): Promise<TranslationResponse> {
    const translation = await this.translationPersistenceService.getTranslation(
      ctx,
      entityType,
      entityId,
      locale,
    )

    return { fields: translation }
  }

  @Query(() => TranslationResponseArray)
  async translations(
    @Ctx() ctx: RequestContext,
    @Args('entityId', { type: () => String }) entityId: string,
    @Args('entityType', { type: () => GraphQLEntityType })
    entityType: GraphQLEntityType,
  ): Promise<TranslationResponseArray> {
    const translations =
      await this.translationPersistenceService.getTranslationsOfEntity(
        ctx,
        entityType,
        entityId,
      )

    return { items: translations }
  }
}
