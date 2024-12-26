import { PaginatedResponseMeta } from '@av/common'
import { Field, ObjectType, InputType, ID, PartialType } from '@nestjs/graphql'

@ObjectType()
export class SeoMetadata {
  @Field(() => ID)
  id: string

  @Field()
  title: string

  @Field()
  description: string

  @Field()
  keywords: string

  @Field()
  version: number

  @Field({ nullable: true })
  name: string

  @Field({ nullable: true })
  path: string

  @Field({ nullable: true })
  canonicalUrl?: string

  @Field({ nullable: true })
  ogTitle?: string

  @Field({ nullable: true })
  ogDescription?: string

  @Field({ nullable: true })
  ogImage?: string

  @Field({ nullable: true })
  robots?: string

  @Field({ nullable: true })
  hreflang?: string

  @Field({ nullable: true })
  pageType?: string

  @Field({ nullable: true })
  priority?: number

  @Field({ nullable: true })
  changefreq?: string

  @Field({ nullable: true })
  createdAt?: Date

  @Field({ nullable: true })
  updatedAt?: Date

  @Field({ nullable: true })
  createdBy?: string

  @Field({ nullable: true })
  updatedBy?: string

  @Field({ nullable: true })
  deletedAt?: Date

  @Field({ nullable: true })
  deletedBy?: string
}

@InputType()
export class CreateSeoMetadataInput {
  @Field()
  title: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  path?: string

  @Field()
  description: string

  @Field()
  keywords: string

  @Field({ nullable: true })
  canonicalUrl?: string

  @Field({ nullable: true })
  ogTitle?: string

  @Field({ nullable: true })
  ogDescription?: string

  @Field({ nullable: true })
  ogImage?: string

  @Field({ nullable: true })
  robots?: string

  @Field({ nullable: true })
  hreflang?: string

  @Field({ nullable: true })
  pageType?: string

  @Field({ nullable: true })
  priority?: number

  @Field({ nullable: true })
  changefreq?: string
}

@InputType()
export class UpdateSeoMetadataInput {
  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  path?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  keywords?: string

  @Field({ nullable: true })
  canonicalUrl?: string

  @Field({ nullable: true })
  ogTitle?: string

  @Field({ nullable: true })
  ogDescription?: string

  @Field({ nullable: true })
  ogImage?: string

  @Field({ nullable: true })
  robots?: string

  @Field({ nullable: true })
  hreflang?: string

  @Field({ nullable: true })
  pageType?: string

  @Field({ nullable: true })
  priority?: number

  @Field({ nullable: true })
  changefreq?: string
}

@ObjectType()
export class FindSeoMetadataResponse {
  @Field(() => [SeoMetadata])
  items: [SeoMetadata]

  @Field(() => PaginatedResponseMeta)
  pagination: PaginatedResponseMeta
}

@ObjectType()
export class SeoMetadataPartial extends PartialType(SeoMetadata) {}
