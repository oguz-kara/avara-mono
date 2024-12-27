import { SyncEntityTranslationsService } from '@av/catalog/application/services/sync-entity-translations.service'
import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'
import { UseInterceptors } from '@nestjs/common'
import { Mutation, Resolver } from '@nestjs/graphql'

@Resolver(() => Boolean)
@UseInterceptors(RequestContextInterceptor)
export class LangSyncResolver {
  constructor(
    private readonly syncEntitiesService: SyncEntityTranslationsService,
  ) {}

  @Mutation(() => Boolean)
  async syncExistingEntities(@Ctx() ctx: RequestContext): Promise<boolean> {
    await this.syncEntitiesService.syncExistingEntities(ctx)
    return true
  }
}
