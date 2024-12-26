import { RequestContext } from '@av/common'
import { EntityType } from '@av/localize'

export class TranslateableEntityDeletedEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: EntityType,
    public readonly ctx: RequestContext,
  ) {}
}
