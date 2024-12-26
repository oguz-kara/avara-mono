import { RequestContext } from '@av/common'
import { EntityType } from '@av/localize'

export class TranslateableEntityDeletedMultipleEvent {
  constructor(
    public readonly entityIds: string[],
    public readonly entityType: EntityType,
    public readonly ctx: RequestContext,
  ) {}
}
