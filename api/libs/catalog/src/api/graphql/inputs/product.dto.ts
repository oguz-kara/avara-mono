import { Field, ObjectType } from '@nestjs/graphql'
import { Product } from '../types/product.types'
import { PaginatedResponseMeta } from '@av/common'
import { SeoMetadata } from '@av/seo'
import GraphQLJSON from 'graphql-type-json'

@ObjectType()
export class FindProductsResponse {
  @Field(() => [Product])
  items: Product[]

  @Field(() => PaginatedResponseMeta)
  pagination: PaginatedResponseMeta
}

@ObjectType()
export class ProductSeoData {
  @Field(() => SeoMetadata)
  seoMetadata: SeoMetadata

  @Field(() => [AlternateUrlObject])
  urls: AlternateUrlObject[]

  @Field(() => GraphQLJSON)
  jsonld: any
}

@ObjectType()
export class AlternateUrlObject {
  @Field(() => String)
  url: string

  @Field(() => String)
  hreflang: string

  @Field(() => String)
  rel: string
}
