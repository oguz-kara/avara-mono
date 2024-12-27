<<<<<<< HEAD
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { CatalogModule } from '@av/catalog'
import { ChannelModule } from '@av/channel'
import { RequestContextModule } from '@av/common'
import { AssetModule } from '@av/asset'
import { UserModule } from '@av/user'
import { SeoModule } from '@av/seo'
import { CommonModule } from '@av/common/common.module'
import { AppGuard } from '@av/common/guards/app.guard'
=======
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ChannelGuard } from '@av/common'
>>>>>>> integrate-keycloak
import { APP_GUARD } from '@nestjs/core'
import { AccessTokenMiddleware } from '@av/keycloak/middleware/access-token.middleware'
import { PublicModule } from './public.module'

@Module({
<<<<<<< HEAD
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
=======
  imports: [PublicModule],
>>>>>>> integrate-keycloak
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
