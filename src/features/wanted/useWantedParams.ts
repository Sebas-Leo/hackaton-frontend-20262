import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { parseWantedParams, serializeWantedParams, type WantedParams } from './wanted-params'

interface UpdateOptions {
  /** Any filter/search/sort/size change goes back to page 1 (default true). */
  resetPage?: boolean
  replace?: boolean
}

export function useWantedParams(knownCrewIds?: ReadonlySet<string>) {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => parseWantedParams(searchParams, knownCrewIds), [searchParams, knownCrewIds])

  // Stable string of the effective params: used as the fetch key and to canonicalize the URL.
  const queryKey = serializeWantedParams(params).toString()

  // Rewrite invalid or redundant values in place (replace: does not add a history entry).
  useEffect(() => {
    if (queryKey !== searchParams.toString()) {
      setSearchParams(new URLSearchParams(queryKey), { replace: true, preventScrollReset: true })
    }
  }, [queryKey, searchParams, setSearchParams])

  const update = useCallback(
    (patch: Partial<WantedParams>, { resetPage = true, replace = false }: UpdateOptions = {}) => {
      // Functional update: always starts from the latest URL, never from a stale closure.
      setSearchParams(
        (current) => {
          const next: WantedParams = { ...parseWantedParams(current), ...patch }
          if (resetPage) next.page = 1
          return serializeWantedParams(next)
        },
        { replace, preventScrollReset: true },
      )
    },
    [setSearchParams],
  )

  return { params, queryKey, update }
}
