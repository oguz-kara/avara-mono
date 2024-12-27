import { ApolloClient } from '@apollo/client'
import { GET_COLLECTION, GET_COLLECTIONS } from '../../../graphql/queries'
import type {
  Collection,
  FindCollectionsResponse,
} from '../../../generated/graphql'

export class CollectionSDK {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getCollections() {
    const response = await this.client.query<{
      collections: FindCollectionsResponse
    }>({
      query: GET_COLLECTIONS,
    })
    return response.data.collections
  }

  async getCollectionById(id: string) {
    const response = await this.client.query<{
      collection: Collection
    }>({
      query: GET_COLLECTION,
      variables: { id },
    })
    console.log({ responseCollection: response.data })
    return response.data.collection
  }
}
