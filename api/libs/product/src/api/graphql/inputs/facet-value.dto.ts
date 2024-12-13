import { InputType, Field, ID, PartialType } from '@nestjs/graphql'

@InputType()
export class CreateFacetValueInput {
  @Field()
  name: string

  @Field()
  code: string

  @Field(() => ID)
  facetId: string
}

@InputType()
export class UpdateFacetValueInput extends PartialType(CreateFacetValueInput) {
  @Field(() => ID)
  id: string
}

@InputType()
export class FacetValueInput {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  code: string
}
