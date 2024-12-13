import { ApolloClient } from '@apollo/client'
import type { UserType } from '../../../generated/graphql'
import { GET_ACTIVE_USER } from '@avc/graphql/queries'

export class UserSDK {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getActiveUser() {
    const response = await this.client.query<{
      activeUser: UserType
    }>({
      query: GET_ACTIVE_USER,
    })
    return response.data.activeUser
  }
}
