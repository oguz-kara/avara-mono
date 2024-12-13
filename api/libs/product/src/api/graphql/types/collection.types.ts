import { Field, ObjectType, ID } from '@nestjs/graphql'
import { Asset, Product } from './product.types'
import { PaginatedResponseMeta } from '@av/common'
import { RuleType } from '../enums/rule.enum'
import { SeoMetadata } from '@av/seo/api/types/seo-metadata.types'

@ObjectType()
export class Collection {
  @Field(() => ID)
  id: string

  @Field(() => ID, { nullable: true })
  parentId?: string

  @Field(() => ID, { nullable: true })
  featuredAssetId?: string

  @Field()
  name: string

  @Field({ nullable: true })
  slug?: string

  @Field({ nullable: true })
  description?: string

  @Field()
  channelToken: string

  @Field()
  autoGenerated: boolean

  @Field()
  isDynamic: boolean

  @Field()
  isPrivate: boolean

  @Field(() => [CollectionFilter], { nullable: true })
  rules?: any

  @Field(() => [Product], { nullable: true })
  products?: Product[]

  @Field(() => Asset, { nullable: true })
  featuredAsset?: Asset

  @Field(() => [Asset], { nullable: true })
  documents?: Asset[]

  @Field(() => SeoMetadata, { nullable: true })
  seoMetadata?: SeoMetadata

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field({ nullable: true })
  createdBy?: string

  @Field({ nullable: true })
  updatedBy?: string

  @Field({ nullable: true })
  deletedAt?: Date

  @Field({ nullable: true })
  deletedBy?: string
}

@ObjectType()
export class FindCollectionsResponse {
  @Field(() => [Collection])
  items: Collection[]

  @Field(() => PaginatedResponseMeta)
  pagination: PaginatedResponseMeta
}

@ObjectType()
export class FilterArgument {
  @Field()
  name: string

  @Field()
  value: string
}

@ObjectType()
export class CollectionFilter {
  @Field(() => RuleType)
  code: RuleType

  @Field(() => [FilterArgument])
  args: FilterArgument[]
}
