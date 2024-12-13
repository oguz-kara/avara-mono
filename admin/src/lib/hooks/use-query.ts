import {
  useQuery as useApolloQuery,
  QueryHookOptions,
  QueryResult,
  OperationVariables,
} from '@apollo/client'
import { DocumentNode } from 'graphql'
import cookies from 'js-cookie'

export function useQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>
): QueryResult<TData, TVariables> {
  const channelToken = cookies.get('channel_token')

  return useApolloQuery<TData, TVariables>(query, {
    ...options,
    context: {
      ...options?.context,
      headers: {
        ...options?.context?.headers,
        'x-channel-token': channelToken || '',
      },
    },
  })
}
