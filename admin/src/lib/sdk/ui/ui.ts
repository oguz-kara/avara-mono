import { ApolloClient } from '@apollo/client'
import type { NavbarResponse } from '../../../generated/graphql'
import { GET_NAVBAR } from '@avc/graphql/queries'

export class UISDK {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getNavbarItems() {
    const response = await this.client.query<{
      getUserAccessUI: NavbarResponse
    }>({
      query: GET_NAVBAR,
    })
    return response.data.getUserAccessUI?.navbarItems
  }
}
