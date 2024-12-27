import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { PublicCatalogModule } from '@av/catalog/public-catalog.module'

@Module({
  imports: [
    PublicCatalogModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      debug: true,
      driver: ApolloDriver,
      path: '/shop-api',
      playground: true,
      autoSchemaFile: 'shop-schema.graphql',
      sortSchema: true,
      include: [PublicCatalogModule],
      // typePaths: [
      //   join(process.cwd(), 'libs/common/src/graphql/shop/**/*.graphql'),
      // ],
    }),
  ],
  providers: [],
})
export class PublicModule {}
