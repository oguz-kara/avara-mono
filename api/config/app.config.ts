import { ConfigFactory, ConfigObject } from '@nestjs/config'
import { supportedTypes } from './file-types.config'

export const appConfig: ConfigFactory<ConfigObject> = (): ConfigObject => ({
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
    language: {
      default: 'en',
      available: ['en', 'fr'],
    },
    currency: {
      default: 'USD',
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
})
