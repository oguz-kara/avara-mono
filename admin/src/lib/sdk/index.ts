import { serverClient } from '../apollo/apollo-client-server'
import { AVSDK } from './av-sdk'
import { getRestClient } from './rest-client'

export async function initializeSDK() {
  const restClient = await getRestClient()
  return new AVSDK(serverClient, restClient)
}
