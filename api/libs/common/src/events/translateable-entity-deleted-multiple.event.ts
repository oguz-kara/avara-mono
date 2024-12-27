import { RequestContext } from '@av/common'
<<<<<<< HEAD
import { GqlEntityType } from '@av/localize'
=======
import { EntityType } from '@av/localize'
>>>>>>> integrate-keycloak

export class TranslateableEntityDeletedMultipleEvent {
  constructor(
    public readonly entityIds: string[],
<<<<<<< HEAD
    public readonly entityType: GqlEntityType,
=======
    public readonly entityType: EntityType,
>>>>>>> integrate-keycloak
    public readonly ctx: RequestContext,
  ) {}
}
