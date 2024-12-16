import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class BatchPayload {
  @Field()
  count: number
}
