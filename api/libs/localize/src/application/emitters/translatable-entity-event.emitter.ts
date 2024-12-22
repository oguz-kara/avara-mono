import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import {
  TranslateableEntityCreatedEvent,
  TranslateableEntityDeletedEvent,
  TranslateableEntityDeletedMultipleEvent,
  TranslateableEntityUpdatedEvent,
  EVENT_LIST,
  RequestContext,
} from '@av/common'
import { GqlEntityType as GraphQLEntityType } from '@av/localize'

@Injectable()
export class TranslatableEntityEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitCreatedEvent(
    entityId: string,
    entityType: GraphQLEntityType,
    fields: Record<string, string>,
    ctx: RequestContext,
  ) {
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_CREATED,
      new TranslateableEntityCreatedEvent(entityId, entityType, fields, ctx),
    )
  }

  emitUpdatedEvent(
    entityId: string,
    entityType: GraphQLEntityType,
    fields: Record<string, string>,
    ctx: RequestContext,
  ) {
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_UPDATED,
      new TranslateableEntityUpdatedEvent(entityId, entityType, fields, ctx),
    )
  }

  emitDeletedEvent(
    entityId: string,
    entityType: GraphQLEntityType,
    ctx: RequestContext,
  ) {
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_DELETED,
      new TranslateableEntityDeletedEvent(entityId, entityType, ctx),
    )
  }

  emitDeletedMultipleEvent(
    entityIds: string[],
    entityType: GraphQLEntityType,
    ctx: RequestContext,
  ) {
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_DELETED_MULTIPLE,
      new TranslateableEntityDeletedMultipleEvent(entityIds, entityType, ctx),
    )
  }
}
