import { registerEnumType } from '@nestjs/graphql'

export enum EntityType {
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  FACET = 'FACET',
  FACET_VALUE = 'FACET_VALUE',
  SEO_METADATA = 'SEO_METADATA',
}

registerEnumType(EntityType, {
  name: 'EntityType',
})
