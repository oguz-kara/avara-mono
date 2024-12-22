import { RequestContext } from '@av/common'
import { Product } from '@av/database'

export class ProductCreatedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly Product: Product,
  ) {}
}

export class ProductUpdatedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly Product: Product,
  ) {}
}

export class ProductDeletedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly Product: Product,
  ) {}
}

export class ProductDeletedMultipleEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly products: Product[],
  ) {}
}
