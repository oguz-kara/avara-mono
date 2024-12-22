import { registerEnumType } from '@nestjs/graphql'

export enum GqlEntityType {
  PRODUCT = 'PRODUCT',
  COLLECTION = 'COLLECTION',
  FACET = 'FACET',
  FACET_VALUE = 'FACET_VALUE',
  SEO_METADATA = 'SEO_METADATA',
}

registerEnumType(GqlEntityType, {
  name: 'EntityType',
})
