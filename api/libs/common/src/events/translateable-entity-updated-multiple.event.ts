import { RequestContext } from '@av/common'
import { EntityType } from '@av/localize'

export class TranslateableEntityUpdatedMultipleEvent {
  constructor(
    public readonly entities: Record<string, any>[],
    public readonly entityType: EntityType,
    public readonly ctx: RequestContext,
  ) {}
}
