import { Module } from '@nestjs/common'
import { ChannelModule } from '@av/channel'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from '@av/keycloak'
import { RoleGuard } from '@av/keycloak'
import { ResourceGuard } from '@av/keycloak'
import { SeoModule } from '@av/seo'
import { UserModule } from '@av/user'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { AssetModule } from '@av/asset'
import { LocalizeModule } from '@av/localize'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      debug: true,
      driver: ApolloDriver,
      path: '/admin-api',
      playground: true,
      include: [
        SeoModule,
        ChannelModule,
        UserModule,
        AssetModule,
        LocalizeModule,
      ],
      autoSchemaFile: 'schema.graphql',
      sortSchema: true,
      typePaths: [
        join(process.cwd(), 'libs/common/src/graphql/admin/schema.graphql'),
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class ProtectedModule {}
