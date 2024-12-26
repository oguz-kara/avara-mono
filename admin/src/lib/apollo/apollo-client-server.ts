import 'server-only'
import { ApolloClient, from, InMemoryCache, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { cookies } from 'next/headers'

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_REMOTE_URL}/admin-api`,
  fetchOptions: {
    credentials: 'include', // Include cookies
  },
})

const authLink = setContext(async (_, { headers }) => {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const cookieHeader = allCookies
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const channelToken = cookieStore.get('channel_token')?.value || ''

  return {
    headers: {
      ...headers,
      Cookie: cookieHeader, // Attach cookies
      'x-channel-token': channelToken, // Attach channel token
    },
  }
})

// Combine links
const link = from([authLink, httpLink])

export const serverClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  ssrMode: true, // Enable server-side rendering
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache', // Don't cache queries
    },
  },
})
