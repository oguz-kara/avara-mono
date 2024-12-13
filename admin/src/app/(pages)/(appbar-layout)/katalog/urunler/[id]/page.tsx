import UpdateProductForm from '@avc/features/catalog/components/forms/update-product-form'
import { initializeSDK } from '@avc/lib/sdk'
import { redirect } from 'next/navigation'
import React, { use } from 'react'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  if (!id) redirect('/katalog/urunler')

  const sdk = await initializeSDK()
  const product = await sdk.products.getById(id)
  const facets = await sdk.facets.getFacets()

  return <UpdateProductForm product={product} facets={facets.items} />
}
