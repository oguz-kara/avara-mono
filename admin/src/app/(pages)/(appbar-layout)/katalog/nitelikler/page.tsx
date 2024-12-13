import React from 'react'
import FacetListing from '@avc/features/catalog/components/lists/facet-listing'
import { initializeSDK } from '@avc/lib/sdk'

export default async function FacetPage() {
  const sdk = await initializeSDK()
  const facets = await sdk.facets.getFacets()

  return <FacetListing initialFacets={facets.items} />
}
