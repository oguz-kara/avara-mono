import { Injectable } from '@nestjs/common'
import { KeycloakAdminService } from './services/keycloak-admin.service'

@Injectable()
export class AuthService {
  constructor(private readonly keycloakAdminService: KeycloakAdminService) {}

  async authenticate(username: string, password: string) {
    await this.keycloakAdminService.auth({
      username,
      password,
      grantType: 'password',
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    })
  }
}
