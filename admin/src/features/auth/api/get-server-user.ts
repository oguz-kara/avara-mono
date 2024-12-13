import { initializeSDK } from '@avc/lib/sdk'

export const getServersideUser = async () => {
  const sdk = await initializeSDK()
  const user = await sdk.users.getActiveUser()
  return user
}
