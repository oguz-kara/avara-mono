import { ApolloClient, from, InMemoryCache, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { cookies } from 'next/headers'

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_REMOTE_URL}/admin-api`,
  credentials: 'include',
})

// Middleware to attach the channel token using setContext with async function
const authLink = setContext(async (operation, { headers }) => {
  // Retrieve cookies synchronously
  const cookieStore = await cookies()
  const channelToken = cookieStore.get('channel_token')?.value || ''
  const accessToken = cookieStore.get('access_token')?.value || ''

  const cookieHeader = accessToken ? `access_token=${accessToken}` : ''

  return {
    headers: {
      ...headers,
      Cookie: cookieHeader,
      'x-access-token': accessToken,
      'x-channel-token': channelToken,
    },
  }
})

const link = from([authLink, httpLink])

export const serverClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  ssrMode: true,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
})
