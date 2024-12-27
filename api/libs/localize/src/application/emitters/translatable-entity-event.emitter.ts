<<<<<<< HEAD
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
=======
import {
  TranslateableEntityCreatedEvent,
  TranslateableEntityDeletedEvent,
  TranslateableEntityDeletedMultipleEvent,
  TranslateableEntityUpdatedEvent,
} from '@av/common'
import { EVENT_LIST } from '@av/common'
import { RequestContext } from '@av/common'
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EntityType as GraphQLEntityType } from '@av/localize'
import { TranslateableEntityUpdatedMultipleEvent } from '@av/common/events/translateable-entity-updated-multiple.event'
import { TranslateableEntityCreatedMultipleEvent } from '@av/common/events/translateable-entity-created-multiple.event'
>>>>>>> integrate-keycloak

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

  async emitUpdatedEvent(
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

<<<<<<< HEAD
  emitDeletedEvent(
=======
  async emitDeletedEvent(
>>>>>>> integrate-keycloak
    entityId: string,
    entityType: GraphQLEntityType,
    ctx: RequestContext,
  ) {
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_DELETED,
      new TranslateableEntityDeletedEvent(entityId, entityType, ctx),
    )
  }

<<<<<<< HEAD
  emitDeletedMultipleEvent(
=======
  async emitDeletedMultipleEvent(
>>>>>>> integrate-keycloak
    entityIds: string[],
    entityType: GraphQLEntityType,
    ctx: RequestContext,
  ) {
<<<<<<< HEAD
=======
    console.log('continue')
>>>>>>> integrate-keycloak
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_DELETED_MULTIPLE,
      new TranslateableEntityDeletedMultipleEvent(entityIds, entityType, ctx),
    )
  }
<<<<<<< HEAD
=======

  async emitUpdatedMultipleEvent(
    entities: Record<string, any>[],
    entityType: GraphQLEntityType,
    ctx: RequestContext,
  ) {
    console.log('continue')
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_UPDATED_MULTIPLE,
      new TranslateableEntityUpdatedMultipleEvent(entities, entityType, ctx),
    )
  }

  async emitCreateMultipleEvent(
    entities: Record<string, any>[],
    entityType: GraphQLEntityType,
    ctx: RequestContext,
  ) {
    console.log('continue')
    this.eventEmitter.emit(
      EVENT_LIST.TRANSLATEABLE_ENTITY_CREATED_MULTIPLE,
      new TranslateableEntityCreatedMultipleEvent(entities, entityType, ctx),
    )
  }
>>>>>>> integrate-keycloak
}
