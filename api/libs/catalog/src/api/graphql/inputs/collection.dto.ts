import { InputType, Field, ID } from '@nestjs/graphql'
import { RuleType } from '../enums/rule.enum'
import {
  CreateSeoMetadataInput,
  UpdateSeoMetadataInput,
} from '@av/seo/api/types/seo-metadata.types'

@InputType()
export class FilterArgumentInput {
  @Field()
  name: string

  @Field()
  value: string
}

@InputType()
export class CollectionFilterInput {
  @Field(() => RuleType)
  code: RuleType

  @Field(() => [FilterArgumentInput])
  args: FilterArgumentInput[]
}

@InputType()
export class CreateCollectionInput {
  @Field()
  name: string

  @Field(() => ID, { nullable: true })
  parentId?: string

  @Field(() => ID, { nullable: true })
  featuredAssetId?: string

  @Field(() => [ID], { nullable: true })
  documentIds?: string[]

  @Field({ nullable: true })
  slug?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  isDynamic?: boolean

  @Field({ nullable: true })
  isPrivate?: boolean

  @Field(() => [CollectionFilterInput], { nullable: true })
  rules?: CollectionFilterInput[]

  @Field(() => [String], { nullable: true })
  productIds?: string[]

  @Field(() => CreateSeoMetadataInput, { nullable: true })
  seoMetadata?: CreateSeoMetadataInput
}

@InputType()
export class UpdateCollectionInput {
  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  slug?: string

  @Field(() => ID, { nullable: true })
  featuredAssetId?: string

  @Field(() => [ID], { nullable: true })
  documentIds?: string[]

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  isDynamic?: boolean

  @Field({ nullable: true })
  isPrivate?: boolean

  @Field(() => [CollectionFilterInput], { nullable: true })
  rules?: CollectionFilterInput[]

  @Field(() => [String], { nullable: true })
  productIds?: string[]

  @Field(() => UpdateSeoMetadataInput, { nullable: true })
  seoMetadata?: UpdateSeoMetadataInput
}
