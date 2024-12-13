import { useState, useCallback, useMemo } from 'react'

interface PaginationParams {
  initialPage?: number
  initialPageSize?: number
  total?: number
  pageSizeOptions?: number[]
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  from: number
  to: number
  hasNext: boolean
  hasPrev: boolean
}

interface PaginationActions {
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  reset: () => void
}

export const usePagination = ({
  initialPage = 0,
  initialPageSize = 25,
  total = 0,
  pageSizeOptions = [25, 50, 100]
}: PaginationParams = {}): [PaginationInfo, PaginationActions] => {
  const [page, setPageInternal] = useState(initialPage)
  const [pageSize, setPageSizeInternal] = useState(initialPageSize)

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  )

  // Ensure page is within bounds
  const normalizedPage = useMemo(() => 
    Math.min(Math.max(0, page), Math.max(0, totalPages - 1)),
    [page, totalPages]
  )

  // Calculate current range
  const from = useMemo(() => 
    total === 0 ? 0 : normalizedPage * pageSize + 1,
    [normalizedPage, pageSize, total]
  )

  const to = useMemo(() => 
    Math.min(from + pageSize - 1, total),
    [from, pageSize, total]
  )

  // Navigation methods
  const nextPage = useCallback(() => {
    if (normalizedPage < totalPages - 1) {
      setPageInternal(normalizedPage + 1)
    }
  }, [normalizedPage, totalPages])

  const prevPage = useCallback(() => {
    if (normalizedPage > 0) {
      setPageInternal(normalizedPage - 1)
    }
  }, [normalizedPage])

  const setPage = useCallback((newPage: number) => {
    const page = Math.min(Math.max(0, newPage), totalPages - 1)
    setPageInternal(page)
  }, [totalPages])

  const setPageSize = useCallback((newSize: number) => {
    if (pageSizeOptions.includes(newSize)) {
      const currentFirst = normalizedPage * pageSize
      const newPage = Math.floor(currentFirst / newSize)
      setPageSizeInternal(newSize)
      setPageInternal(newPage)
    }
  }, [normalizedPage, pageSize, pageSizeOptions])

  const reset = useCallback(() => {
    setPageInternal(initialPage)
    setPageSizeInternal(initialPageSize)
  }, [initialPage, initialPageSize])

  const paginationInfo: PaginationInfo = {
    page: normalizedPage,
    pageSize,
    total,
    totalPages,
    from,
    to,
    hasNext: normalizedPage < totalPages - 1,
    hasPrev: normalizedPage > 0
  }

  const paginationActions: PaginationActions = {
    nextPage,
    prevPage,
    setPage,
    setPageSize,
    reset
  }

  return [paginationInfo, paginationActions]
}
