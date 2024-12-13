import { Channel } from '@avc/generated/graphql'
import { useApolloClient } from '@apollo/client'
import { useChannelContext } from '@avc/features/channel/context/channel-contex'

const useChannel = () => {
  const { currentChannel, setCurrentChannel, channels } = useChannelContext()
  const apolloClient = useApolloClient()

  const changeChannel = async (channel: Channel) => {
    setCurrentChannel(channel)
    await apolloClient.resetStore()
  }

  return { currentChannel, changeChannel, channels }
}

export default useChannel
