import { registerEnumType } from '@nestjs/graphql'

export enum RuleType {
  FACET_VALUE_FILTER = 'facet-value-filter',
  PRODUCT_NAME_FILTER = 'product-name-filter',
}

registerEnumType(RuleType, {
  name: 'RuleType',
  description: 'The rules a user can have',
})
