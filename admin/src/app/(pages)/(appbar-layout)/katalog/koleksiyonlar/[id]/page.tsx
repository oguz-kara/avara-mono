import UpdateCollectionForm from '@avc/features/catalog/components/forms/update-collection-form'
import { initializeSDK } from '@avc/lib/sdk'
import { redirect } from 'next/navigation'

export default async function UpdateCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!id) redirect('/katalog/koleksiyonlar')

  const sdk = await initializeSDK()
  const collection = await sdk.collections.getCollectionById(id)

  if (!collection) {
    return redirect('/sayfa-bulunamadi')
  }

  return <UpdateCollectionForm collection={collection} />
}
