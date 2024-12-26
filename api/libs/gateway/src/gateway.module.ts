import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { CatalogModule } from '@av/catalog'
import { ChannelModule } from '@av/channel'
import { ChannelGuard, RequestContextModule } from '@av/common'
import { AssetModule } from '@av/asset'
import { UserModule } from '@av/user'
import { SeoModule } from '@av/seo'
import { CommonModule } from '@av/common/common.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { LocalizeModule } from '@av/localize'
import { AuthModule } from '@av/keycloak'
import { AccessTokenMiddleware } from '@av/keycloak/middleware/access-token.middleware'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1y' },
      }),
      inject: [ConfigService],
    }),
    ChannelModule,
    RequestContextModule,
    CatalogModule,
    AssetModule,
    UserModule,
    SeoModule,
    CommonModule,
    LocalizeModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      debug: true,
      driver: ApolloDriver,
      path: '/admin-api',
      playground: true,
      include: [
        SeoModule,
        ChannelModule,
        CatalogModule,
        UserModule,
        AssetModule,
        LocalizeModule,
      ],
      autoSchemaFile: 'schema.graphql',
      sortSchema: true,
      // typePaths: [
      //   join(process.cwd(), 'libs/common/src/graphql/admin/schema.graphql'),
      // ],
    }),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   debug: true,
    //   driver: ApolloDriver,
    //   path: '/shop-api',
    //   include: [],
    //   playground: true,
    //   typePaths: [
    //     join(process.cwd(), 'libs/common/src/graphql/shop/**/*.graphql'),
    //   ],
    // }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ChannelGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: ResourceGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RoleGuard,
    // },
  ],
})
export class GatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessTokenMiddleware).forRoutes('*')
  }
}
