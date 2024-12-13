import { ApolloClient } from '@apollo/client'
import {
  GET_FACETS,
  GET_FACET,
  GET_FACET_VALUES,
  GET_FACET_VALUE,
} from '@avc/graphql/queries'
import {
  CREATE_FACET,
  UPDATE_FACET,
  DELETE_FACET,
  UPDATE_FACET_VALUE,
  DELETE_FACET_VALUE,
} from '@avc/graphql/mutations'
import {
  Facet,
  FacetValue,
  MutationCreateFacetArgs,
  MutationUpdateFacetArgs,
  MutationDeleteFacetArgs,
  MutationUpdateFacetValueArgs,
  MutationDeleteFacetValueArgs,
  CreateFacetInput,
  UpdateFacetInput,
  UpdateFacetValueInput,
} from '@avc/generated/graphql'

export class FacetSDK {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getFacets() {
    //@ts-ignore
    const response = await this.client.query<any>({
      query: GET_FACETS,
    })
    return response.data.facets
  }

  async getFacetById(id: string) {
    //@ts-ignore
    const response = await this.client.query<{ facet: Facet }>({
      query: GET_FACET,
      variables: { input: id },
    })
    return response.data.facet
  }

  async createFacet(input: CreateFacetInput) {
    const response = await this.client.mutate<
      { createFacet: Facet },
      MutationCreateFacetArgs
    >({
      mutation: CREATE_FACET,
      variables: { input },
    })
    return response.data?.createFacet
  }

  async updateFacet(input: UpdateFacetInput) {
    const response = await this.client.mutate<
      { updateFacet: Facet },
      MutationUpdateFacetArgs
    >({
      mutation: UPDATE_FACET,
      variables: { input },
    })
    return response.data?.updateFacet
  }

  async deleteFacet(id: string) {
    const response = await this.client.mutate<
      { deleteFacet: boolean },
      MutationDeleteFacetArgs
    >({
      mutation: DELETE_FACET,
      variables: { id },
    })
    return response.data?.deleteFacet
  }

  async getFacetValues(facetId: string) {
    const response = await this.client.query<{ facetValues: FacetValue[] }>({
      query: GET_FACET_VALUES,
      variables: { facetId },
    })
    return response.data.facetValues
  }

  async getFacetValueById(id: string) {
    const response = await this.client.query<{ facetValue: FacetValue }>({
      query: GET_FACET_VALUE,
      variables: { id },
    })
    return response.data.facetValue
  }

  async updateFacetValue(input: UpdateFacetValueInput) {
    const response = await this.client.mutate<
      { updateFacetValue: FacetValue },
      MutationUpdateFacetValueArgs
    >({
      mutation: UPDATE_FACET_VALUE,
      variables: { input },
    })
    return response.data?.updateFacetValue
  }

  async deleteFacetValue(id: string) {
    const response = await this.client.mutate<
      { deleteFacetValue: boolean },
      MutationDeleteFacetValueArgs
    >({
      mutation: DELETE_FACET_VALUE,
      variables: { id },
    })
    return response.data?.deleteFacetValue
  }
}
