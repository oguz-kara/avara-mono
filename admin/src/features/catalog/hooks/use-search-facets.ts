import { SEARCH_FACET_VALUES } from '@avc/graphql/queries'
import { useQuery } from '@avc/lib/hooks/use-query'
import { useState } from 'react'

interface SearchFacetsParams {
  initialPage?: number
  initialPageSize?: number
  initialTerm?: string
}

export const useSearchFacets = ({
  initialPage: initialSkip = 0,
  initialPageSize: initialTake = 25,
  initialTerm = '',
}: SearchFacetsParams = {}) => {
  const [skip, setSkip] = useState(initialSkip)
  const [take, setTake] = useState(initialTake)
  const [term, setTerm] = useState(initialTerm)

  const { data, loading } = useQuery(SEARCH_FACET_VALUES, {
    variables: {
      skip,
      take,
      term,
    },
  })

  const facets = data?.searchFacetValues?.items || []
  const pagination = {
    totalItems: data?.searchFacetValues?.totalItems || 0,
    ...data?.searchFacetValues?.pagination,
  }

  const nextPage = () => {
    setSkip(skip + take)
  }

  const previousPage = () => {
    setSkip(skip - take)
  }

  const setPage = (page: number) => {
    setSkip(page * take)
  }

  return { facets, pagination, loading, nextPage, previousPage, setPage }
}
