import { useQuery } from '@avc/lib/hooks/use-query'
import { useState, useEffect, useCallback } from 'react'
import { SEARCH_PRODUCTS } from '@avc/graphql/queries'
import { Product } from '@avc/generated/graphql'
import { debounce } from 'lodash'

interface UseProductListingProps {
  initialPage?: number
  initialPageSize?: number
}

export const useProductListing = ({
  initialPage = 0,
  initialPageSize = 25,
}: UseProductListingProps = {}) => {
  const [term, setTerm] = useState('')
  const [paginationModel, setPaginationModel] = useState({
    page: initialPage,
    pageSize: initialPageSize,
  })

  const [products, setProducts] = useState<Product[]>([])
  const [totalItems, setTotalItems] = useState(0)

  const [queryVariables, setQueryVariables] = useState({
    query: term,
    skip: paginationModel.page * paginationModel.pageSize,
    take: paginationModel.pageSize,
  })

  const { refetch, loading } = useQuery(SEARCH_PRODUCTS, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    skip: true,
    onCompleted: (data) => {
      setProducts(data?.searchProducts?.items || [])
      setTotalItems(data?.searchProducts?.pagination?.total || 0)
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const debouncedUpdateQueryVariables = useCallback(
    debounce((newVariables) => {
      setQueryVariables(newVariables)
      refetch(newVariables)
    }, 500),
    [refetch]
  )

  useEffect(() => {
    const newVariables = {
      query: term,
      skip: paginationModel.page * paginationModel.pageSize,
      take: paginationModel.pageSize,
    }

    debouncedUpdateQueryVariables(newVariables)

    return () => {
      debouncedUpdateQueryVariables.cancel()
    }
  }, [term, paginationModel, debouncedUpdateQueryVariables])

  return {
    products,
    paginationModel,
    setPaginationModel,
    loading,
    totalItems,
    setTerm,
    term,
  }
}
