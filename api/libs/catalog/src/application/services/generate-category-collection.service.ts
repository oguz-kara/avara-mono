import { Injectable, Logger } from '@nestjs/common'
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
  private readonly logger = new Logger(GenerateCategoryCollectionService.name)

  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  async generateCategoryCollection(
    ctx: RequestContext,
    categoryCollectionInput: CategoryCollectionInput[] | string[],
    parentId: string | null = null,
  ): Promise<string | null> {
    if (!categoryCollectionInput || categoryCollectionInput.length === 0) {
      this.logger.warn('Empty category collection input.')
      return null
    }

    try {
      const facet = await this.getOrCreateFacet(ctx, 'kategori')

      // Process each category input
      for (const input of categoryCollectionInput) {
        await this.processCategoryInput(ctx, input, facet.id, parentId)
      }

      return 'ok'
    } catch (error) {
      this.logger.error('Error generating category collection', error)
      throw error
    }
  }

  async generateSingleCollection(title: string): Promise<object> {
    const prompt = this.buildAiPrompt(title)
    const collectionData: GeneratedCollection = JSON.parse(
      await this.aiService.generateResponse(prompt),
    )

    this.logger.debug(`Generated collection data: ${collectionData}`)
    return collectionData as object
  }

  private async processCategoryInput(
    ctx: RequestContext,
    input: CategoryCollectionInput | string,
    facetId: string,
    parentId: string | null,
  ): Promise<void> {
    if (typeof input === 'string') {
      await this.handleStringCategory(ctx, input, facetId, parentId)
    } else {
      await this.handleObjectCategory(ctx, input, facetId, parentId)
    }
  }

  private async handleStringCategory(
    ctx: RequestContext,
    categoryName: string,
    facetId: string,
    parentId: string | null,
  ): Promise<void> {
    this.logger.log(`Processing category: ${categoryName}`)

    const facetValue = await this.getOrCreateFacetValue(
      ctx,
      facetId,
      categoryName,
    )
    const existingCollection = await this.findCollectionByName(
      ctx,
      categoryName,
    )

    let collection = existingCollection
    if (!existingCollection) {
      const prompt = this.buildAiPrompt(categoryName)
      const collectionData = JSON.parse(
        await this.aiService.generateResponse(prompt),
      )
      this.logger.debug(
        `Generated collection data for "${categoryName}": ${collectionData?.name}`,
      )

      collection = await this.createCollection(
        ctx,
        categoryName,
        collectionData,
        facetValue.id,
        parentId,
      )
      this.logger.log(`Created collection: ${collection?.name}`)
    } else {
      this.logger.log(`Collection already exists: ${existingCollection.name}`)
    }

    this.logger.log('No subcategories to process for this collection.')
  }

  private async handleObjectCategory(
    ctx: RequestContext,
    categoryInput: CategoryCollectionInput,
    facetId: string,
    parentId: string | null,
  ): Promise<void> {
    this.logger.log(`Processing category with children: ${categoryInput.title}`)

    const facetValue = await this.getOrCreateFacetValue(
      ctx,
      facetId,
      categoryInput.title,
    )
    const existingCollection = await this.findCollectionByName(
      ctx,
      categoryInput.title,
    )

    let collection = existingCollection
    if (!existingCollection) {
      const prompt = this.buildAiPrompt(
        categoryInput.title,
        parentId ? await this.getParentName(ctx, parentId) : null,
      )
      const collectionData = JSON.parse(
        await this.aiService.generateResponse(prompt),
      )
      this.logger.debug(
        `Generated collection data for "${categoryInput.title}": ${collectionData?.name}`,
      )

      collection = await this.createCollection(
        ctx,
        categoryInput.title,
        collectionData,
        facetValue.id,
        parentId,
      )
      this.logger.log(`Created collection: ${collection?.name}`)
    } else {
      this.logger.log(`Collection already exists: ${existingCollection.name}`)
    }

    if (categoryInput.children && categoryInput.children.length > 0) {
      this.logger.log(`Processing subcategories for: ${categoryInput.title}`)
      await this.generateCategoryCollection(
        ctx,
        categoryInput.children,
        collection.id,
      )
    }
  }

  private async getOrCreateFacet(ctx: RequestContext, facetName: string) {
    let facet = await this.prisma.facet.findFirst({
      where: {
        name: facetName,
        channelToken: ctx.channel.token,
      },
    })

    if (!facet) {
      this.logger.log(`Facet "${facetName}" not found. Creating a new one.`)
      facet = await this.prisma.facet.create({
        data: {
          name: facetName,
          code: facetName.toLowerCase(),
          channelToken: ctx.channel.token,
        },
      })
      this.logger.log(`Created facet: ${facet.name}`)
    } else {
      this.logger.log(`Found existing facet: ${facet.name}`)
    }

    return facet
  }

  private async getOrCreateFacetValue(
    ctx: RequestContext,
    facetId: string,
    facetValueName: string,
  ) {
    let facetValue = await this.prisma.facetValue.findFirst({
      where: {
        name: facetValueName,
        channelToken: ctx.channel.token,
      },
    })

    if (!facetValue) {
      this.logger.log(
        `Facet value "${facetValueName}" not found. Creating a new one.`,
      )
      facetValue = await this.prisma.facetValue.create({
        data: {
          name: facetValueName,
          code: facetValueName.toLowerCase(),
          channelToken: ctx.channel.token,
          facet: {
            connect: { id: facetId },
          },
        },
      })
      this.logger.log(`Created facet value: ${facetValue.name}`)
    } else {
      this.logger.log(`Found existing facet value: ${facetValue.name}`)
    }

    return facetValue
  }

  private async findCollectionByName(ctx: RequestContext, name: string) {
    return this.prisma.collection.findFirst({
      where: {
        name,
        channelToken: ctx.channel.token,
      },
    })
  }

  private async createCollection(
    ctx: RequestContext,
    title: string,
    generatedCollection: GeneratedCollection,
    facetValueId: string,
    parentId: string | null,
  ) {
    const staticSeoMetadata = this.buildStaticSeoMetadata(
      generatedCollection.slug,
    )
    const rules = this.buildRules(facetValueId)

    const collectionData: any = {
      ...(parentId && {
        parent: {
          connect: { id: parentId },
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
          channelToken: ctx.channel.token,
        },
      },
    }

    const newCollection = await this.prisma.collection.create({
      data: collectionData,
    })

    return newCollection
  }

  private buildRules(facetValueId: string) {
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

  private buildStaticSeoMetadata(slug: string) {
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

  private buildAiPrompt(
    categoryName: string,
    parentName: string | null = null,
  ): string {
    return `
You are a seasoned content creator with expertise in industrial lubricants for B2B catalogs. Your task is to generate detailed and engaging content for a specific product category based on the provided category name.

Brand Name: Restoreplus
Category Name: "${categoryName}"
${parentName ? `Parent Category Name: "${parentName}"` : ''}

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

Output Format:

Language: All output must be in Turkish.
Format: Provide the output strictly as a JSON object without any additional text, code block syntax, or formatting. Ensure it is directly parseable using JSON.parse() and it throws bad control character in string literal error, make sure to remove all the bad characters (not Turkish characters).
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
  }
}
    `
  }

  private async getParentName(
    ctx: RequestContext,
    parentId: string,
  ): Promise<string | null> {
    const parent = await this.prisma.collection.findUnique({
      where: {
        id: parentId,
        channelToken: ctx.channel.token,
      },
    })

    if (parent) {
      return parent.name
    }

    return null
  }
}
