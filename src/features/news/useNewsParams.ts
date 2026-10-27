import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { parseNewsParams, serializeNewsParams, type NewsParams } from './news-params'

export function useNewsParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => parseNewsParams(searchParams), [searchParams])

  // Stable string of the effective filters: the feed restarts only when this changes.
  const queryKey = serializeNewsParams(params).toString()

  // Rewrite invalid or redundant values in place (replace: does not add a history entry).
  useEffect(() => {
    if (queryKey !== searchParams.toString()) {
      setSearchParams(new URLSearchParams(queryKey), { replace: true, preventScrollReset: true })
    }
  }, [queryKey, searchParams, setSearchParams])

  const update = useCallback(
    (patch: Partial<NewsParams>) => {
      // Functional update: always starts from the latest URL, never from a stale closure.
      setSearchParams((current) => serializeNewsParams({ ...parseNewsParams(current), ...patch }), {
        preventScrollReset: true,
      })
    },
    [setSearchParams],
  )

  return { params, queryKey, update }
}
