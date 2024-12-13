import { getFetcherFunction } from '@avc/lib/functions/fetcher-function'
import { UseQueryResult, useQuery as reactQuery } from '@tanstack/react-query'

export const useQuery = <T = any>(keys: string[]) => {
  const queryResult = reactQuery<T>({
    queryKey: keys,
    queryFn: getFetcherFunction<T>(keys[0]),
  })

  return queryResult as UseQueryResult<T>
}
