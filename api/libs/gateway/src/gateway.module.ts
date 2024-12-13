import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ProductModule } from '@av/product'
import { ChannelModule } from '@av/channel'
import { RequestContextModule } from '@av/common'
import { AssetModule } from '@av/asset'
import { UserModule } from '@av/user'
import { SeoModule } from '@av/seo'
import { CommonModule } from '@av/common/common.module'
import { PermissionsGuard } from '@av/common/guards/permission.guard'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
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
    ProductModule,
    AssetModule,
    UserModule,
    SeoModule,
    CommonModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      debug: true,
      driver: ApolloDriver,
      path: '/admin-api',
      playground: true,
      include: [
        SeoModule,
        ChannelModule,
        ProductModule,
        UserModule,
        AssetModule,
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
      useClass: PermissionsGuard,
    },
  ],
})
export class GatewayModule {}
