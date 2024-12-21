import { RequestContext } from '@av/common'
import { EntityType } from '@av/localize'

export class TranslateableEntityCreatedEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: EntityType,
    public readonly fields: Record<string, string>,
    public readonly ctx: RequestContext,
  ) {}
}
