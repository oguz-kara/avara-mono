import { RequestContext } from '@av/common'
import { GqlEntityType } from '@av/localize'

export class TranslateableEntityDeletedMultipleEvent {
  constructor(
    public readonly entityIds: string[],
    public readonly entityType: GqlEntityType,
    public readonly ctx: RequestContext,
  ) {}
}
