import { RequestContext } from '@av/common'
import { SeoMetadata } from '@av/database'

export class SeoMetadataCreatedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly seoMetadata: SeoMetadata,
  ) {}
}

export class SeoMetadataUpdatedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly seoMetadata: SeoMetadata,
  ) {}
}

export class SeoMetadataDeletedEvent {
  constructor(
    public readonly ctx: RequestContext,
    public readonly seoMetadata: SeoMetadata,
  ) {}
}
