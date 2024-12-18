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
  schemaMarkup: SchemaMarkup
}

// Schema Markup türü
interface SchemaMarkup {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  mainEntity: MainEntity
}

// Main Entity türü
interface MainEntity {
  '@type': string
  name: string
  description: string
  url: string
  image: string
  publisher: Publisher
}

// Publisher türü
interface Publisher {
  '@type': string
  name: string
  logo: Logo
}

// Logo türü
interface Logo {
  '@type': string
  url: string
}
