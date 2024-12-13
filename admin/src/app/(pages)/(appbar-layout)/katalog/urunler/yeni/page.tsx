import CreateProductForm from '@avc/features/catalog/components/forms/create-product-form'
import { initializeSDK } from '@avc/lib/sdk'

export default async function Page() {
  const sdk = await initializeSDK()
  const facets = await sdk.facets.getFacets()

  return <CreateProductForm facets={facets.items} />
}
