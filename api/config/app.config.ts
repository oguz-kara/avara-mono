import { ConfigFactory, ConfigObject } from '@nestjs/config'
import { supportedTypes } from './file-types.config'
import { additionalInstructionsTranslationAi } from './instructions-translation-ai'

export const appConfig: ConfigFactory<ConfigObject> = (): ConfigObject => ({
  brand: {
    name: 'Restoreplus',
  },
  client: {
    baseUrl: process.env.CLIENT_BASE_URL,
  },
  server: {
    hostname: 'localhost',
    port: 3000,
    apiPaths: {
      protected: '/admin-api',
      public: '/shop-api',
    },
  },
  pagination: {
    limits: {
      max: 100,
      default: 25,
    },
    defaultPosition: 0,
  },
  authentication: {
    strategy: process.env.AUTH_STRATEGY,
    jwt: {
      expiresIn: '30d',
    },
    authorizationEnabled:
      process.env.AUTHORIZATION_ENABLED === 'true' ? true : false,
  },
  localization: {
    ai: {
      version: process.env.AI_TRANSLATE_VERSION || 'gpt-3.5-turbo',
    },
    language: {
      default: 'tr',
      available: ['en', 'es', 'tr'],
    },
    currency: {
      default: 'USD',
    },
    defaultSettings: {
      translationProvider: 'GPT_3_5_TURBO',
      enabled: true,
      autoTranslate: true,
      dynamicSegmentsEnabled: true,
    },
    segmentPaths: {
      products: '/products',
      collections: '/collections',
      categories: '/categories',
    },
    autoTranslate: {
      slugify: true,
      additionalInstructions: additionalInstructionsTranslationAi,
    },
  },
  asset: {
    fileLimit: 10,
    imageExtension: 'webp',
    supportedTypes: supportedTypes,
    storage: {
      localPath: '/uploads/preview',
      maxFileSize: 1024 * 1024 * 10,
      strategy: process.env.ASSET_STORAGE_STRATEGY || 'LOCAL',
      host: process.env.STORAGE_HOST,
      url: process.env.STORAGE_URL,
      aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
    variation: {
      variationsEnabled: true,
      sizes: {},
    },
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME,
    publicUrl: process.env.MINIO_PUBLIC_URL,
  },
  ai: {
    defaultAIModel: process.env.AI_TRANSLATE_VERSION || 'GPT_3_5_TURBO',
    version: process.env.AI_TRANSLATE_VERSION || 'gpt-3.5-turbo',
  },
<<<<<<< HEAD
  segment: {
    default: {
      name: 'urunler',
    },
  },
=======
  channel: {
    defaultChannel: {
      name: 'Default',
      token: process.env.DEFAULT_CHANNEL_TOKEN,
      code: process.env.DEFAULT_CHANNEL_CODE,
      defaultLanguageCode: process.env.DEFAULT_CHANNEL_LANGUAGE_CODE,
      currencyCode: process.env.DEFAULT_CHANNEL_CURRENCY_CODE,
      isDefault: true,
      status: 'ACTIVE',
      type: 'OTHER',
    },
  },
  googleCloud: {
    projectId: process.env.GOOGLE_TRANSLATE_PROJECT_ID,
    apiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
  },
>>>>>>> integrate-keycloak
})
