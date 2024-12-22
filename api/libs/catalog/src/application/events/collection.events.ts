import { RequestContext } from '@av/common'
import { Collection } from '@av/database'

export class CollectionCreatedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly Collection: Collection,
  ) {}
}

export class CollectionUpdatedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly Collection: Collection,
  ) {}
}

export class CollectionDeletedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly Collection: Collection,
  ) {}
}
