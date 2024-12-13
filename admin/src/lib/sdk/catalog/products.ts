import { ApolloClient } from '@apollo/client'
import {
  GET_PRODUCT_BY_ID,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS,
} from '../../../graphql/queries'
import { CREATE_PRODUCT } from '../../../graphql/mutations'
import type {
  CreateProductInput,
  FindProductsResponse,
  MutationCreateProductArgs,
  Product,
} from '../../../generated/graphql'

export class ProductSDK {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getProducts() {
    const response = await this.client.query<{
      products: FindProductsResponse
    }>({
      query: GET_PRODUCTS,
    })
    return response.data.products
  }

  async getBySlug(slug: string) {
    const response = await this.client.query<{
      productBySlug: Product
    }>({
      query: GET_PRODUCT_BY_SLUG,
      variables: { slug },
    })
    return response.data.productBySlug
  }

  async getById(id: string) {
    const response = await this.client.query<{
      product: Product
    }>({
      query: GET_PRODUCT_BY_ID,
      variables: { id },
    })
    return response.data.product
  }

  async createProduct(input: CreateProductInput) {
    const response = await this.client.mutate<
      { createProduct: Product },
      MutationCreateProductArgs
    >({
      mutation: CREATE_PRODUCT,
      variables: { input },
    })
    return response.data?.createProduct
  }
}
