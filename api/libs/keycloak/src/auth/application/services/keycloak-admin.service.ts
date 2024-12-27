import { Injectable } from '@nestjs/common'
import KcAdminClient from '@keycloak/keycloak-admin-client'

@Injectable()
export class KeycloakAdminService extends KcAdminClient {
  constructor() {
    super({
      baseUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
      realmName: process.env.KEYCLOAK_REALM,
    })
  }
}
