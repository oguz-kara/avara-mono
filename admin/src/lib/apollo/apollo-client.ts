import {
  ApolloClient,
  ApolloLink,
  from,
  InMemoryCache,
  HttpLink,
} from '@apollo/client'
import cookies from 'js-cookie'

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_REMOTE_URL}/admin-api`,
  credentials: 'include',
})

const channelMiddleware = new ApolloLink((operation, forward) => {
  const channelToken = cookies.get('channel_token')
  operation.setContext({
    headers: {
      'x-channel-token': channelToken || '',
    },
  })
  return forward(operation)
})

const link = from([channelMiddleware, httpLink])

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
})
