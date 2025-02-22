import { z } from 'zod'

export const seoMetadataSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),

    name: z.string().nullish(),
    path: z.string().nullish(),
    canonicalUrl: z.string().nullish(),
    ogTitle: z.string().nullish(),
    ogDescription: z.string().nullish(),
    ogImage: z.string().nullish(),
    robots: z.string().nullish(),
    hreflang: z.string().nullish(),
    pageType: z.string().nullish(),
    autoGenerated: z.boolean().nullish(),
    priority: z.coerce.number().nullish(),
    changefreq: z.string().nullish(),
  })
  .refine(
    (data) => {
      const { title, description, keywords } = data
      const anyFilled =
        Boolean(title) || Boolean(description) || Boolean(keywords)

      if (anyFilled) {
        return title && description && keywords
      }

      return true
    },
    {
      message:
        'SEO bilgisi girildiğinde başlık, açıklama ve anahtar kelimeler zorunludur',
    }
  )
