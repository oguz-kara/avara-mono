import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class Logo {
  @Field(() => String)
  'type': string

  @Field(() => String)
  url: string
}

@ObjectType()
export class Publisher {
  @Field(() => String)
  'type': string

  @Field(() => String)
  name: string

  @Field(() => Logo)
  logo: Logo
}

@ObjectType()
export class MainEntity {
  @Field(() => String)
  'type': string

  @Field(() => String)
  name: string

  @Field(() => String)
  description: string

  @Field(() => String)
  url: string

  @Field(() => String)
  image: string

  @Field(() => Publisher)
  publisher: Publisher
}

@ObjectType()
export class SEOMetadata {
  @Field(() => String)
  title: string

  @Field(() => String)
  description: string

  @Field(() => String)
  keywords: string

  @Field(() => String)
  ogTitle: string

  @Field(() => String)
  ogDescription: string
}

@ObjectType()
export class GeneratedCollection {
  @Field(() => String)
  name: string

  @Field(() => String)
  slug: string

  @Field(() => String)
  description: string

  @Field(() => SEOMetadata)
  seoMetadata: SEOMetadata
}
