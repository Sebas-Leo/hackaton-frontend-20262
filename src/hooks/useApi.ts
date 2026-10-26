import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { ApiError, isAbortError, toApiError } from '../lib/api'

export type ApiState<T> =
  | { status: 'loading'; data: T | undefined; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | undefined; error: ApiError }

export type ApiResult<T> = ApiState<T> & { reload: () => void }

/**
 * Runs `fetcher` whenever `deps` change.
 *
 * Stale-response protection: every run gets its own AbortController. When deps change
 * (or the component unmounts) the previous request is aborted AND its result is ignored,
 * so a slow old response can never overwrite what the user asked for last.
 *
 * While reloading, the previous `data` is kept so the layout does not jump.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList): ApiResult<T> {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading', data: undefined, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ status: 'loading', data: prev.data, error: null }))

    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data, error: null })
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setState((prev) => ({ status: 'error', data: prev.data, error: toApiError(error) }))
      },
    )

    return () => controller.abort()
    // `fetcher` is recreated every render; `deps` is the explicit contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, reload }
}
