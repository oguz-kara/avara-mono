import { Ctx, RequestContext, RequestContextInterceptor } from '@av/common'
import { UseInterceptors } from '@nestjs/common'
import { Mutation, Resolver } from '@nestjs/graphql'
import { SyncEntityTranslationsService } from '../../application/services/sync-entity-translations.service'

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
