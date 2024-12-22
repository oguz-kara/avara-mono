import { RequestContext } from '@av/common'
import { GqlEntityType } from '@av/localize'

export class TranslateableEntityDeletedEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: GqlEntityType,
    public readonly ctx: RequestContext,
  ) {}
}
