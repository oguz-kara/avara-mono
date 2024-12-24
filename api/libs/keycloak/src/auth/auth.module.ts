import { Module } from '@nestjs/common'
import {
  KeycloakConnectModule,
  KeycloakConnectOptions,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect'

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useFactory: (): KeycloakConnectOptions => ({
        authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
        realm: process.env.KEYCLOAK_REALM,
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        secret: process.env.KEYCLOAK_CLIENT_SECRET,
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        tokenValidation: TokenValidation.ONLINE,
        bearerOnly: false,
        cookieKey: 'access_token',
      }),
    }),
  ],
  exports: [KeycloakConnectModule],
})
export class AuthModule {}
