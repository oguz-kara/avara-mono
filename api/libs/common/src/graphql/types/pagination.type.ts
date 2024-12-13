import { Type } from '@nestjs/common'
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsInt, IsOptional } from 'class-validator'

export function Paginated<T>(classRef: Type<T>): any {
  @ObjectType({ isAbstract: true })
  class PaginatedType {
    @Field(() => [classRef])
    items: T[]

    @Field(() => PaginatedResponseMeta)
    pagination: PaginatedResponseMeta
  }
  return PaginatedType
}

@ObjectType()
export class PaginatedResponseMeta {
  @Field(() => Int)
  take: number
  @Field(() => Int)
  skip: number
  @Field(() => Int, { nullable: true })
  total?: number
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  take?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  skip?: number
}
