import { Injectable, Logger } from '@nestjs/common'
import { AIService } from '@av/ai'
import { PrismaService } from '@av/database'
import { RequestContext } from '@av/common'
import { GeneratedCollection } from '../types/generated-collection.type'

type ProductWithCategory = {
  categoryName: string
  productName: string
  parentCategoryName: string
}

@Injectable()
export class GenerateProductsWithCategoriesService {
  private readonly logger = new Logger(
    GenerateProductsWithCategoriesService.name,
  )

  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  async generateProductsWithCategories(
    ctx: RequestContext,
    products: ProductWithCategory[],
  ): Promise<{ success: string }> {
    if (!products || products.length === 0) {
      this.logger.warn('Boş ürün girişi.')
      return { success: 'İşlenecek ürün yok.' }
    }

    try {
      const facet = await this.getOrCreateFacet(ctx, 'kategori')

      for (const item of products) {
        if (item.productName.toLowerCase() === 'category') {
          await this.handleCategoryItem(ctx, item, facet.id)
        } else {
          await this.handleProductItem(ctx, item, facet.id)
        }
      }

      return { success: 'Products and categories processed successfully.' }
    } catch (error) {
      this.logger.error('Error generating products with categories', error)
      throw error
    }
  }

  private async handleCategoryItem(
    ctx: RequestContext,
    item: ProductWithCategory,
    facetId: string,
  ): Promise<void> {
    this.logger.log(`Kategori işleniyor: ${item.categoryName}`)

    let parentId: string | null = null

    if (item.parentCategoryName) {
      // Ensure parent category exists
      const parentCategory = await this.getOrCreateCategory(
        ctx,
        item.parentCategoryName,
        facetId,
      )
      parentId = parentCategory.id
    }

    // Create or get the category
    await this.getOrCreateCategory(ctx, item.categoryName, facetId, parentId)
  }

  private async handleProductItem(
    ctx: RequestContext,
    item: ProductWithCategory,
    facetId: string,
  ): Promise<void> {
    this.logger.log(
      `Ürün işleniyor: ${item.productName}, kategori: ${item.categoryName}`,
    )

    // Ensure category exists
    let categoryId: string | null = null

    if (item.parentCategoryName) {
      // Ensure parent category exists
      const parentCategory = await this.getOrCreateCategory(
        ctx,
        item.parentCategoryName,
        facetId,
      )
      categoryId = parentCategory.id
    }

    const category = await this.getOrCreateCategory(
      ctx,
      item.categoryName,
      facetId,
      categoryId,
    )

    // Check if product already exists
    const existingProduct = await this.findProductByName(ctx, item.productName)

    if (existingProduct) {
      this.logger.log(`Ürün zaten mevcut: ${existingProduct.name}`)
      return
    }

    // Generate product data via AI
    const productData = await this.generateProductData(
      item.productName,
      item.categoryName,
    )

    // Create product
    const newProduct = await this.createProduct(
      ctx,
      item.productName,
      productData,
      (category as any)?.facetValueId,
    )

    this.logger.log(`Ürün oluşturuldu: ${newProduct.name}`)
  }

  private async getOrCreateCategory(
    ctx: RequestContext,
    categoryName: string,
    facetId: string,
    parentId: string | null = null,
  ) {
    let category = await this.findCategoryByName(ctx, categoryName)
    // Create facet value if not exists
    const facetValue = await this.getOrCreateFacetValue(
      ctx,
      facetId,
      categoryName,
    )

    if (category && facetValue) {
      this.logger.log(`Kategori zaten mevcut: ${category.name}`)
      return { ...category, facetValueId: facetValue.id }
    }

    // Generate category data via AI
    const parentName = parentId
      ? await this.getCategoryNameById(ctx, parentId)
      : null
    const prompt = this.buildCategoryAiPrompt(categoryName, parentName)
    const generatedCollection: GeneratedCollection = JSON.parse(
      await this.aiService.generateResponse(prompt),
    )
    this.logger.debug(
      `"${categoryName}" için oluşturulan koleksiyon verisi: ${generatedCollection.name}`,
    )

    // Create category
    category = await this.createCategory(
      ctx,
      categoryName,
      generatedCollection,
      facetValue.id,
      parentId,
    )

    this.logger.log(`Kategori oluşturuldu: ${category.name}`)

    return { ...category, facetValueId: facetValue.id }
  }

  private async findCategoryByName(ctx: RequestContext, name: string) {
    return this.prisma.collection.findFirst({
      where: {
        name,
        channelToken: ctx.channel.token,
      },
    })
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
        `"${facetValueName}" facet değeri bulunamadı. Yeni bir tane oluşturuluyor.`,
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
      this.logger.log(`Facet değeri oluşturuldu: ${facetValue.name}`)
    } else {
      this.logger.log(`Mevcut facet değeri bulundu: ${facetValue.name}`)
    }

    return facetValue
  }

  private async generateProductData(
    productName: string,
    categoryName: string,
  ): Promise<any> {
    const prompt = this.buildProductAiPrompt(productName, categoryName)
    const productData = JSON.parse(
      await this.aiService.generateResponse(prompt),
    )
    this.logger.debug(
      `Generated product data for "${productName}": ${JSON.stringify(productData, null, 2)}`,
    )
    return productData
  }

  private async createProduct(
    ctx: RequestContext,
    productName: string,
    productData: any,
    facetValueId: string,
  ) {
    const seoMetadata = this.buildStaticSeoMetadataForProduct(productData.slug)

    const product = await this.prisma.product.create({
      data: {
        name: productName,
        slug: productData.slug,
        description: productData.description,
        autoGenerated: true,
        isPrivate: false,
        seoMetadata: {
          create: {
            title: productData.seoMetadata.title,
            description: productData.seoMetadata.description,
            keywords: productData.seoMetadata.keywords,
            ogTitle: productData.seoMetadata.ogTitle,
            ogDescription: productData.seoMetadata.ogDescription,
            schemaMarkup: JSON.stringify(productData.seoMetadata.schemaMarkup),
            ...seoMetadata,
            channelToken: ctx.channel.token,
          },
        },
        facetValues: {
          connect: {
            id: facetValueId,
          },
        },
        channelToken: ctx.channel.token,
      },
    })

    return product
  }

  private async getCategoryNameById(
    ctx: RequestContext,
    categoryId: string,
  ): Promise<string | null> {
    const category = await this.prisma.collection.findUnique({
      where: {
        id: categoryId,
        channelToken: ctx.channel.token,
      },
      select: {
        name: true,
      },
    })

    return category ? category.name : null
  }

  private buildCategoryAiPrompt(
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
  }

  private buildProductAiPrompt(
    productName: string,
    categoryName: string,
  ): string {
    return `
  You are an expert content creator with a strong focus on industrial lubricants for B2B catalogs. Your objective is to generate detailed, comprehensive, and SEO-optimized content for a specific product based on the provided product name and category name.
  
  **Brand Name:** Restoreplus  
  **Product Name:** "${productName}"  
  **Category Name:** "${categoryName}"  
  
  ### Instructions:
  
  1. **Name:**
     - Use the exact provided product name without any alterations.
     - Correct any grammatical errors present in the product name.
  
  2. **Slug:**
     - Create a URL-friendly slug derived from the product name.
     - Use lowercase letters, replace spaces with hyphens, and remove any special characters.
     - **Example:** "SHOCKPLUS OİL-5W" → "shockplus-oil-5w"
  
  3. **Description:**
     - Craft a **comprehensive and informative** description in rich HTML format.
     - **Content Structure:**
       - **Overview:**
         - Provide a detailed summary of the product.
         - Explain its purpose, core functionalities, and the problems it solves.
       - **Key Benefits:**
         - Highlight at least five main advantages of using this product.
         - Include specific outcomes or improvements users can expect.
       - **Applications:**
         - Describe various use cases and industries where this product is essential.
         - Provide real-world scenarios or examples of the product in action.
       - **Technical Specifications:**
         - Include detailed technical information such as viscosity grades, temperature ranges, compatibility notes, etc.
         - Use bullet points or tables for clarity.
       - **Unique Selling Points (USPs):**
         - Emphasize what sets this product apart from competitors.
         - Mention any patented technologies, certifications, or exclusive features.
       - **Usage Instructions:**
         - Provide clear guidelines on how to use the product effectively.
         - Include any safety precautions or best practices.
     - **Style:**
       - Ensure the description is professional, engaging, and tailored to a B2B audience.
       - Use persuasive language to highlight the product's value.
  
  4. **SEO Fields:** 
  
     - **Title (Meta Title):**
       - Develop a concise and SEO-optimized title.
       - Incorporate the product name and your company’s branding.
       - **Example:** "SHOCKPLUS OİL-5W | Restoreplus"
     
     - **Description (Meta Description):**
       - Write a persuasive meta description that effectively summarizes the product.
       - Include relevant keywords naturally.
       - Encourage users to explore the product further.
       - **Character Limit:** 150-160 characters for optimal SEO performance.
     
     - **Keywords (Meta Keywords):**
       - Generate a list of relevant keywords separated by commas.
       - Focus on terms that accurately describe the product and are likely to be used in search queries.
       - **Example:** "shockplus oil, 5w oil, endüstriyel yağlar, yüksek performanslı yağlayıcılar"
  
  5. **Keyword Integration:**
     - Ensure that the primary keywords are seamlessly integrated into the product description, meta title, and meta description.
     - Avoid keyword stuffing; maintain natural readability.
  
  6. **Formatting:**
     - Use appropriate HTML tags to structure the content (e.g., '<p>', '<ul>', '<li>', '<strong>', '<table>', etc.).
     - Ensure the HTML is clean and free from syntax errors.
  
  ### Output Format:
  
  - **Language:** All output must be in Turkish.
  - **Format:** Provide the output strictly as a JSON object without any additional text, code block syntax, or formatting. Ensure it is directly parseable using 'JSON.parse()' and does not throw any errors related to bad control characters. Remove all bad characters (retain only valid Turkish characters).
  - **Keys:** The JSON object must contain the following keys:
    - 'name': The exact product name provided without changes.
    - 'slug': A URL-friendly slug derived from the product name.
    - 'description': A detailed description in rich HTML format.
    - 'seoMetadata': An object with the following keys:
      - 'title': The SEO title.
      - 'description': The SEO meta description.
      - 'keywords': A comma-separated list of keywords.
  
  ### Example Output:
  
  {
    "name": "${productName}",
    "slug": "shockplus-oil-5w",
    "description": "<p>SHOCKPLUS OİL-5W, endüstriyel makinelerinizin verimli çalışmasını sağlayan yüksek performanslı bir yağlayıcıdır. Bu ürün, zorlu çalışma koşullarında üstün aşınma koruması sunar ve uzun ömürlü makineler sağlar.</p><ul><li><strong>Key Benefits:</strong><ul><li>Yüksek termal stabilite</li><li>Gelişmiş aşınma koruması</li><li>Çevre dostu formül</li><li>Uzun ömürlü kullanım</li><li>Geniş uygulama alanları</li></ul></li><li><strong>Applications:</strong><ul><li>Otomotiv endüstrisi</li><li>Hafriyat makineleri</li><li>Tarım ekipmanları</li><li>İnşaat makineleri</li></ul></li><li><strong>Technical Specifications:</strong><ul><li>Viscosity Grade: 5W</li><li>Temperature Range: -20°C to 150°C</li><li>Compatibility: Metal to Metal Contact</li><li>Certifications: ISO 9001, API SN</li></ul></li><li><strong>Unique Selling Points:</strong><ul><li>Patented Nano-Technology</li><li>100% Recyclable</li><li>Exclusive Additive Package</li></ul></li><li><strong>Usage Instructions:</strong><ul><li>Makinelerinize uygun miktarda SHOCKPLUS OİL-5W ekleyin.</li><li>Her kullanım öncesi yağ seviyesini kontrol edin.</li><li>Güvenlik önlemlerini alarak ürünü kullanın.</li></ul></li></ul>",
    "seoMetadata": {
      "title": "SHOCKPLUS OİL-5W | Restoreplus",
      "description": "SHOCKPLUS OİL-5W, endüstriyel makineleriniz için yüksek performanslı bir yağlayıcıdır. Restoreplus ile verimliliğinizi artırın.",
      "keywords": "shockplus oil, 5w oil, endüstriyel yağlar, yüksek performanslı yağlayıcılar"
    }
  }
    `
  }

  private async createCategory(
    ctx: RequestContext,
    title: string,
    generatedCollection: GeneratedCollection,
    facetValueId: string,
    parentId: string | null,
  ) {
    const staticSeoMetadata = this.buildStaticSeoMetadataForCategory(
      generatedCollection.slug,
    )
    const rules = this.buildRules(facetValueId)

    const categoryData: any = {
      ...(parentId && {
        parent: {
          connect: { id: parentId },
        },
      }),
      ...generatedCollection,
      type: 'category',
      rules,
      isDynamic: true,
      isPrivate: false,
      channelToken: ctx.channel.token,
      seoMetadata: {
        create: {
          ...staticSeoMetadata,
          ...generatedCollection.seoMetadata,
          schemaMarkup: JSON.stringify(
            generatedCollection.seoMetadata.schemaMarkup,
          ),
          channelToken: ctx.channel.token,
        },
      },
    }

    const newCategory = await this.prisma.collection.create({
      data: categoryData,
    })

    return newCategory
  }

  private async getOrCreateFacet(ctx: RequestContext, facetName: string) {
    let facet = await this.prisma.facet.findFirst({
      where: {
        name: facetName,
        channelToken: ctx.channel.token,
      },
    })

    if (!facet) {
      this.logger.log(
        `"${facetName}" facet bulunamadı. Yeni bir tane oluşturuluyor.`,
      )
      facet = await this.prisma.facet.create({
        data: {
          name: facetName,
          code: facetName.toLowerCase(),
          channelToken: ctx.channel.token,
        },
      })
      this.logger.log(`Facet oluşturuldu: ${facet.name}`)
    } else {
      this.logger.log(`Mevcut facet bulundu: ${facet.name}`)
    }

    return facet
  }

  private async findProductByName(ctx: RequestContext, name: string) {
    return this.prisma.product.findFirst({
      where: {
        name,
        channelToken: ctx.channel.token,
      },
    })
  }

  private buildStaticSeoMetadataForCategory(slug: string) {
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

  private buildStaticSeoMetadataForProduct(slug: string) {
    return {
      changefreq: 'daily',
      priority: 1,
      autoGenerated: true,
      hreflang: 'tr-TR',
      pageType: 'product',
      canonicalUrl: `https://www.restoreplus.store/urunler/${slug}`,
      robots: 'index, follow',
      path: `/urunler/${slug}`,
    }
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
}
