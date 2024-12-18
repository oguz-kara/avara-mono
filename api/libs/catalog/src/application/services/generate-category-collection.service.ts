import { Injectable } from '@nestjs/common'
import { AIService } from '@av/ai'
import { PrismaService } from '@av/database'
import { RequestContext } from '@av/common'
import { GeneratedCollection } from '../types/generated-collection.type'

type CategoryCollectionInput = {
  title: string
  children: CategoryCollectionInput[] | string[]
}

@Injectable()
export class GenerateCategoryCollectionService {
  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  async generateCategoryCollection(
    ctx: RequestContext,
    categoryCollectionInput: CategoryCollectionInput[] | string[],
    parentId: string | null = null,
    parentName: string | null = null,
  ) {
    if (categoryCollectionInput.length === 0) {
      return null
    }

    // create facet if not exists
    const facet = await this.createCategoryFacetIfNotExistsAndReturn(ctx)

    for (const categoryCollection of categoryCollectionInput) {
      if (typeof categoryCollection === 'object') {
        const facetValue = await this.createFacetValueIfNotExistsAndReturn(
          ctx,
          facet.id,
          categoryCollection.title,
        )

        const createdCollection = await this.getCollectionByName(
          ctx,
          categoryCollection.title,
        )

        const prompt = !createdCollection
          ? this.getAiPrompt(categoryCollection.title, parentName)
          : null

        const collectionData: GeneratedCollection = !createdCollection
          ? await this.aiService.generateResponse(prompt)
          : null

        console.log('generated collection data -> ', collectionData?.name)

        const collection = !createdCollection
          ? await this.createCollectionIfNotExists(
              ctx,
              categoryCollection.title,
              collectionData,
              facetValue.id,
              parentId,
            )
          : createdCollection

        console.log('created collection -> ', collection.name)

        if (
          categoryCollection.children &&
          categoryCollection.children.length > 0
        ) {
          console.log('generating children for -> ', categoryCollection.title)
          await this.generateCategoryCollection(
            ctx,
            categoryCollection.children,
            collection.id,
          )
        }
      } else if (typeof categoryCollection === 'string') {
        const facetValue = await this.createFacetValueIfNotExistsAndReturn(
          ctx,
          facet.id,
          categoryCollection,
        )

        const createdCollection = await this.getCollectionByName(
          ctx,
          categoryCollection,
        )

        const prompt = !createdCollection
          ? this.getAiPrompt(categoryCollection)
          : null

        const collectionData: GeneratedCollection = !createdCollection
          ? await this.aiService.generateResponse(prompt)
          : null

        console.log('generated collection data -> ', collectionData.name)

        const collection = !createdCollection
          ? await this.createCollectionIfNotExists(
              ctx,
              categoryCollection,
              collectionData,
              facetValue.id,
              parentId,
            )
          : createdCollection

        console.log('created collection -> ', collection.name)
        console.log('collection no more has children!')
      }
    }

    return 'ok'
  }

  async generateSingleCollection(title: string) {
    const prompt = this.getAiPrompt(title)
    const collectionData: GeneratedCollection =
      await this.aiService.generateResponse(prompt)

    console.log(JSON.stringify(collectionData, null, 2))

    return collectionData as object
  }

  private getAiPrompt(categoryName: string, parentName: string | null = null) {
    const prompt = `
  You are a seasoned content creator with expertise in industrial lubricants for B2B catalogs. Your task is to generate detailed and engaging content for a specific product category based on the provided category name.

  Category Name: "${categoryName}"
  Parent Category Name: "${parentName}"

  Instructions:
  
  1. name:
     - Confirm and use the exact provided category name without alterations.
  
  2. slug:
     - Create a URL-friendly slug derived from the category name.
     - Use lowercase letters, replace spaces with hyphens, and remove any special characters.
     - Example: "Isı Transfer Yağları" → "isi-transfer-yaglari"
  
  3. description:
     - Craft a comprehensive and informative description in rich HTML format.
     - Content should include:
       - Overview: Provide a clear and concise summary of the category, explaining what it encompasses.
       - Key Benefits: Highlight the main advantages of using products from this category.
       - Applications: Describe the typical use cases and industries where these products are essential.
       - Unique Selling Points: Emphasize what sets these products apart from competitors.
       - Technical Specifications: Include any relevant technical details or considerations that are important for users to know.
     - Style: Ensure the description is professional, engaging, and tailored to a B2B audience.
  
  4. SEO Fields:
  
     - title (meta title):
       - Develop a concise and SEO-optimized title.
       - Incorporate the category name and your company’s branding.
       - Example: "Isı Transfer Yağları | Restoreplus"
  
     - description (meta description):
       - Write a persuasive meta description that effectively summarizes the category.
       - Include relevant keywords naturally.
       - Encourage users to explore the category further.
       - Keep it within 150-160 characters for optimal SEO performance.
  
     - keywords (meta keywords):
       - Generate a list of relevant keywords separated by commas.
       - Focus on terms that accurately describe the category and are likely to be used in search queries.
       - Example: "ısı transfer yağları, endüstriyel yağlar, termal yönetim, yüksek performanslı yağlayıcılar"
  
     - ogTitle (open graph title):
       - Create a compelling and SEO-friendly title for social media sharing.
       - Include the category name and your company’s branding.
       - Example: "Isı Transfer Yağları | Restoreplus"
  
     - ogDescription (open graph description):
       - Develop a captivating description for social media platforms.
       - Summarize the category, incorporate relevant keywords, and entice users to learn more.
       - Ensure it aligns with the meta description in tone and content.
  
     - schemaMarkup:
       - Provide a well-structured JSON-LD object adhering to Schema.org standards.
       - Ensure all relevant properties are included to enhance SEO and rich search results.
       - Example structure:
         {
           "@context": "https://schema.org",
           "@type": "CollectionPage",
           "name": "Isı Transfer Yağları",
           "description": "Endüstriyel uygulamalar için tasarlanmış premium Isı Transfer Yağlarımızı keşfedin. Yüksek kaliteli yağlayıcılarımızla verimliliği artırın ve makinelerinizi koruyun.",
           "url": "https://www.restoreplus.store/kategoriler/isi-transfer-yaglari",
           "mainEntity": {
             "@type": "WebPage",
             "name": "Isı Transfer Yağları",
             "description": "Isı Transfer Yağlarımız, çeşitli endüstriyel uygulamalar için verimli termal yönetim ve yağlama sağlayarak makinelerinizin optimal performans ve uzun ömürlü olmasını temin eder.",
             "url": "https://www.restoreplus.store/kategoriler/isi-transfer-yaglari",
             "image": "https://api.restoreplus.store/uploads/preview/isi-transfer-yaglari.jpg",
             "publisher": {
               "@type": "Organization",
               "name": "Restoreplus",
               "logo": {
                 "@type": "ImageObject",
                 "url": "https://www.restoreplus.store/images/restoreplus-logo.png"
               }
             }
           }
         }
  
  Output Format:

  Language: All output must be in Turkish.
  Format: Provide the output strictly as a JSON object without any additional text, code block syntax, or formatting. Ensure it is directly parseable using JSON.parse().
  Keys: The JSON object must contain the following keys:
        name: The exact category name provided without changes.
        slug: A URL-friendly slug derived from the category name.
        description: A detailed description in rich HTML format.
        seoMetadata: An object with the following keys:
            title: The SEO title.
            description: The SEO meta description.
            keywords: A comma-separated list of keywords.
            ogTitle: The Open Graph title.
            ogDescription: The Open Graph description.
            schemaMarkup: A structured JSON-LD object adhering to Schema.org standards.
  
  Example Output:
  
  {
    "name": "${categoryName}",
    "slug": "isi-transfer-yaglari",
    "description": "<p>Endüstriyel yağlayıcıların kritik bir bileşeni olan Isı Transfer Yağları, makinalarınızın verimli ve uzun ömürlü çalışmasını sağlar. Bu kategoride yer alan yağlar, yüksek termal yönetim kapasiteleri ve üstün aşınma önleme özellikleri ile öne çıkar. Geniş uygulama yelpazesi sayesinde çeşitli endüstriyel sektörlerde güvenle kullanılabilirler.</p>",
    "seoMetadata": {
      "title": "Isı Transfer Yağları | Restoreplus",
      "description": "Endüstriyel uygulamalar için yüksek performanslı ısı transfer yağları. Restoreplus ile makinelerinizin verimliliğini ve ömrünü artırın.",
      "keywords": "ısı transfer yağları, endüstriyel yağlar, termal yönetim, yüksek performanslı yağlayıcılar",
      "ogTitle": "Isı Transfer Yağları | Restoreplus",
      "ogDescription": "Endüstriyel uygulamalar için yüksek performanslı ısı transfer yağları. Restoreplus ile makinelerinizin verimliliğini ve ömrünü artırın.",
      "schemaMarkup": {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Isı Transfer Yağları",
        "description": "Endüstriyel uygulamalar için tasarlanmış premium Isı Transfer Yağlarımızı keşfedin. Yüksek kaliteli yağlayıcılarımızla verimliliği artırın ve makinelerinizi koruyun.",
        "url": "https://www.restoreplus.store/kategoriler/isi-transfer-yaglari",
        "mainEntity": {
          "@type": "WebPage",
          "name": "Isı Transfer Yağları",
          "description": "Isı Transfer Yağlarımız, çeşitli endüstriyel uygulamalar için verimli termal yönetim ve yağlama sağlayarak makinelerinizin optimal performans ve uzun ömürlü olmasını temin eder.",
          "url": "https://www.restoreplus.store/kategoriler/isi-transfer-yaglari",
          "image": "https://api.restoreplus.store/uploads/preview/isi-transfer-yaglari.jpg",
          "publisher": {
            "@type": "Organization",
            "name": "Restoreplus",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.restoreplus.store/images/restoreplus-logo.png"
            }
          }
        }
      }
    }
  }
  `

    return prompt
  }

  private getStaticData(slug: string) {
    return {
      changefreq: 'daily',
      priority: 0.5,
      autoGenerated: true,
      hreflang: 'tr-TR',
      pageType: 'category',
      canonicalUrl: `https://www.restoreplus.store/kategoriler/${slug}`,
      robots: 'index, follow',
      path: `/kategoriler/${slug}`,
    }
  }

  private async createCategoryFacetIfNotExistsAndReturn(ctx: RequestContext) {
    const facetName = 'kategori'

    const facet = await this.prisma.facet.findFirst({
      where: {
        name: facetName,
        channelToken: ctx.channel.token,
      },
    })

    if (facet) return facet

    const newFacet = await this.prisma.facet.create({
      data: {
        name: facetName,
        code: facetName.toLowerCase(),
        channelToken: ctx.channel.token,
      },
    })

    return newFacet
  }

  private async createFacetValueIfNotExistsAndReturn(
    ctx: RequestContext,
    facetId: string,
    facetValueName: string,
  ) {
    const facetValue = await this.prisma.facetValue.findFirst({
      where: {
        name: facetValueName,
        channelToken: ctx.channel.token,
      },
    })

    if (facetValue) return facetValue

    const newFacetValue = await this.prisma.facetValue.create({
      data: {
        name: facetValueName,
        code: facetValueName.toLowerCase(),
        channelToken: ctx.channel.token,
        facet: {
          connect: {
            id: facetId,
          },
        },
      },
    })

    return newFacetValue
  }

  private async getCollectionByName(ctx: RequestContext, name: string) {
    return this.prisma.collection.findFirst({
      where: {
        name,
        channelToken: ctx.channel.token,
      },
    })
  }

  private async createCollectionIfNotExists(
    ctx: RequestContext,
    title: string,
    generatedCollection: GeneratedCollection,
    facetValueId: string,
    parentId: string | null = null,
  ) {
    const collection = await this.getCollectionByName(ctx, title)

    if (collection) return collection

    const staticSeoMetadata = this.getStaticData(generatedCollection.slug)
    const rules = this.getRules(facetValueId)

    const newCollection = await this.prisma.collection.create({
      data: {
        ...(parentId && {
          parent: {
            connect: {
              id: parentId,
            },
          },
        }),
        ...generatedCollection,
        rules,
        isDynamic: true,
        isPrivate: false,
        channelToken: ctx.channel.token,
        seoMetadata: {
          create: {
            ...staticSeoMetadata,
            ...generatedCollection.seoMetadata,
            schemaMarkup: {
              toJSON() {
                return JSON.stringify(
                  generatedCollection.seoMetadata.schemaMarkup,
                )
              },
            },
            channelToken: ctx.channel.token,
          },
        },
      },
    })

    return newCollection
  }

  private getRules(facetValueId: string) {
    return [
      {
        code: 'facet-value-filter',
        args: [
          {
            name: 'facetValueIds',
            value: `["${facetValueId}"]`,
          },
          {
            name: 'containsAny',
            value: false,
          },
          {
            name: 'combineWithAnd',
            value: false,
          },
        ],
      },
    ]
  }
}
