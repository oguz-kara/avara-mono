import { registerEnumType } from '@nestjs/graphql'

export enum GqlEntityType {
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  FACET = 'FACET',
  FACET_VALUE = 'FACET_VALUE',
  SEO_METADATA = 'SEO_METADATA',
}

<<<<<<< HEAD
registerEnumType(GqlEntityType, {
=======
export enum TranslationProvider {
  GOOGLE_TRANSLATE = 'GOOGLE_TRANSLATE',
  GPT_3_5_TURBO = 'GPT_3_5_TURBO',
  GPT_4 = 'GPT_4',
  GPT_4_O = 'GPT_4_O',
  GPT_4_O_MINI = 'GPT_4_O_MINI',
  GPT_O1 = 'GPT_O1',
  GPT_O1_MINI = 'GPT_O1_MINI',
}

registerEnumType(EntityType, {
>>>>>>> integrate-keycloak
  name: 'EntityType',
})

registerEnumType(TranslationProvider, {
  name: 'TranslationProvider',
})
