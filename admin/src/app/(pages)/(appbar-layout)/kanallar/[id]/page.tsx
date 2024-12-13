import CreateUpdateChannelForm from '@avc/features/channel/components/create-update-channel-form'
import { initializeSDK } from '@avc/lib/sdk'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function UpdateChannelPage({ params }: Props) {
  const { id } = await params
  if (!id) redirect('/kanallar')

  const sdk = await initializeSDK()
  const channel = await sdk.channels.getChannelById(Number(id))

  return <CreateUpdateChannelForm channel={channel} />
}
