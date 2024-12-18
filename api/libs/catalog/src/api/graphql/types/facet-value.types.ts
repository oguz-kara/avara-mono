import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Facet } from './facet.types'
import { PaginatedResponseMeta } from '@av/common'

@ObjectType()
export class FacetValue {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field()
  code: string

  @Field(() => Facet, { nullable: true })
  facet?: Facet
}

@ObjectType()
export class FindFacetValuesResponse {
  @Field(() => [FacetValue])
  items: FacetValue[]

  @Field(() => PaginatedResponseMeta)
  pagination: PaginatedResponseMeta
}
