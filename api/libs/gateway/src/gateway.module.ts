import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ChannelGuard } from '@av/common'
import { APP_GUARD } from '@nestjs/core'
import { AccessTokenMiddleware } from '@av/keycloak/middleware/access-token.middleware'
import { PublicModule } from './public.module'

@Module({
  imports: [PublicModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ChannelGuard,
    },
  ],
})
export class GatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessTokenMiddleware).forRoutes('*')
  }
}
