import { RequestContext } from '@av/common'
import { GqlEntityType } from '@av/localize'

export class TranslateableEntityCreatedEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: GqlEntityType,
    public readonly fields: Record<string, string>,
    public readonly ctx: RequestContext,
  ) {}
}
