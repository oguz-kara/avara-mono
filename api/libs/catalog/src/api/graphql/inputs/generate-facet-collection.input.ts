import { Field, InputType } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@InputType()
export class GenerateFacetCollectionItem {
  @Field(() => GraphQLJSON, { description: 'Schema Markup' })
  data: any
}
