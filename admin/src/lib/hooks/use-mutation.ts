import {
  useMutation as useApolloMutation,
  MutationHookOptions,
} from '@apollo/client'
import { DocumentNode } from 'graphql'
import cookies from 'js-cookie'

export function useMutation<TData = any, TVariables = any>(
  mutation: DocumentNode,
  options?: MutationHookOptions<TData, TVariables>
) {
  const channelToken = cookies.get('channel_token')

  const mutationResult = useApolloMutation<TData, TVariables>(mutation, {
    ...options,
    context: {
      ...options?.context,
      headers: {
        ...options?.context?.headers,
        'x-channel-token': channelToken || '',
      },
    },
  })

  return mutationResult
}
