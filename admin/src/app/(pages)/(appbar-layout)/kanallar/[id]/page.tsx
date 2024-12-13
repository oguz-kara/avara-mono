import { use } from 'react'
import CreateUpdateChannelForm from '@avc/features/channel/components/create-update-channel-form'
import { initializeSDK } from '@avc/lib/sdk'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function UpdateChannelPage({ params }: Props) {
  const { id } = use(params)
  if (!id) redirect('/kanallar')

  const sdk = await initializeSDK()
  const channel = await sdk.channels.getChannelById(Number(id))

  return <CreateUpdateChannelForm channel={channel} />
}
