import { TranslateableEntityCreatedEvent } from '@av/common'
import { EVENT_LIST } from '@av/common'
import { RequestContext } from '@av/common'
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EntityType as GraphQLEntityType } from '@av/localize'
import { TranslateableEntityUpdatedEvent } from '@av/common/events/translateable-entity.updated.event'

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
}
