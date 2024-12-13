import UpdateFacetForm from '@avc/features/catalog/components/forms/update-facet-form'
import { initializeSDK } from '@avc/lib/sdk'
import { redirect } from 'next/navigation'
import React, { use } from 'react'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  if (!id) redirect('/katalog/nitelikler')

  const sdk = await initializeSDK()
  const facet = await sdk.facets.getFacetById(id)

  console.log({ facet })

  return <UpdateFacetForm initialValues={facet} />
}
