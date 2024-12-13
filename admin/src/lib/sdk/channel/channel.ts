import { ApolloClient } from '@apollo/client'
import { Channel } from '@avc/generated/graphql'
import { GET_CHANNEL, GET_CHANNELS } from '@avc/graphql/queries'

export class ChannelSDK {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getChannels() {
    const response = await this.client.query<{
      channels: Channel[]
    }>({
      query: GET_CHANNELS,
    })
    return response.data.channels
  }

  async getChannelById(id: number) {
    const response = await this.client.query<{
      channel: Channel
    }>({
      query: GET_CHANNEL,
      variables: { id },
    })
    return response.data.channel
  }
}
