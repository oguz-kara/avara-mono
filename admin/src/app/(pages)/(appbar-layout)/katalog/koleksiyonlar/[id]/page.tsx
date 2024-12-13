import { use } from 'react'
import UpdateCollectionForm from '@avc/features/catalog/components/forms/update-collection-form'
import { initializeSDK } from '@avc/lib/sdk'
import { redirect } from 'next/navigation'

export default async function UpdateCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  if (!id) redirect('/katalog/koleksiyonlar')

  const sdk = await initializeSDK()
  const collection = await sdk.collections.getCollectionById(id)

  return <UpdateCollectionForm collection={collection} />
}
