import { Field, ObjectType, Float } from '@nestjs/graphql'

@ObjectType()
export class SitemapAlternate {
  @Field()
  hreflang: string

  @Field()
  href: string
}

@ObjectType()
export class SitemapUrl {
  @Field()
  loc: string

  @Field({ nullable: true })
  lastmod?: string

  @Field(() => Float, { nullable: true })
  priority?: number

  @Field({ nullable: true })
  changefreq?: string
}

@ObjectType()
export class Sitemap {
  @Field(() => [SitemapUrl])
  urls: SitemapUrl[]
}
