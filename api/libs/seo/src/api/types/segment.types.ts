import { Field, InputType, ObjectType } from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@ObjectType()
export class SegmentsResponseType {
  @Field(() => GraphQLJSON)
  segments: any
}

@InputType()
export class CreateSegmentInput {
  @Field()
  name: string

  @Field()
  path: string
}
