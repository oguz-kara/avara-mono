import { Field, ObjectType } from '@nestjs/graphql'
import { Product } from '../types/product.types'
import { PaginatedResponseMeta } from '@av/common'

@ObjectType()
export class FindProductsResponse {
  @Field(() => [Product])
  items: Product[]

  @Field(() => PaginatedResponseMeta)
  pagination: PaginatedResponseMeta
}
