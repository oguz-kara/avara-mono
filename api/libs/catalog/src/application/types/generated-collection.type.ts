export interface GeneratedCollection {
  name: string
  slug: string
  description: string
  seoMetadata: SEOMetadata
}

interface SEOMetadata {
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
}
