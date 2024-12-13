import { ApolloClient } from '@apollo/client'
import { ProductSDK } from './catalog/products'
import { AssetSDK } from './assets/assets'
import { FacetSDK } from './catalog/facets'
import { CollectionSDK } from './collection/collections'
import { ChannelSDK } from './channel/channel'
import { UISDK } from './ui/ui'
import { UserSDK } from './user/user'

export class AVSDK {
  private graphQLClient: ApolloClient<any>
  private restClient: any
  public products: ProductSDK
  public assets: AssetSDK
  public facets: FacetSDK
  public collections: CollectionSDK
  public channels: ChannelSDK
  public users: UserSDK
  public ui: UISDK

  constructor(graphQLClient: ApolloClient<any>, restClient: any) {
    this.graphQLClient = graphQLClient
    this.restClient = restClient
    this.products = new ProductSDK(graphQLClient)
    this.assets = new AssetSDK(restClient)
    this.facets = new FacetSDK(graphQLClient)
    this.collections = new CollectionSDK(graphQLClient)
    this.channels = new ChannelSDK(graphQLClient)
    this.ui = new UISDK(graphQLClient)
    this.users = new UserSDK(graphQLClient)
  }
}

export * from './catalog/products'
export * from './assets/assets'
