import { ObjectType, Field, ID } from '@nestjs/graphql'
import { FacetValue } from './facet-value.types'
import { PaginatedResponseMeta } from '@av/common'

@ObjectType()
export class Facet {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field()
  code: string

  @Field()
  isPrivate: boolean

  @Field(() => [FacetValue], { nullable: true })
  values?: FacetValue[]

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field({ nullable: true })
  deletedAt?: Date
}

@ObjectType()
export class FindFacetsResponse {
  @Field(() => [Facet])
  items: Facet[]

  @Field(() => PaginatedResponseMeta)
  pagination: PaginatedResponseMeta
}
