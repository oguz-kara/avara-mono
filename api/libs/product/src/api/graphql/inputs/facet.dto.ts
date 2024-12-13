import { InputType, Field, PartialType, ID } from '@nestjs/graphql'
import { FacetValueInput } from './facet-value.dto'

@InputType()
export class CreateFacetInput {
  @Field()
  name: string

  @Field()
  code: string

  @Field({ defaultValue: false })
  isPrivate?: boolean
}

@InputType()
export class UpdateFacetInput extends PartialType(CreateFacetInput) {
  @Field(() => ID)
  id: string

  @Field(() => [FacetValueInput], { nullable: true })
  values?: FacetValueInput[]
}
