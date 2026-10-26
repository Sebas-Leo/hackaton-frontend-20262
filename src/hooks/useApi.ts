import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { ApiError, isAbortError, toApiError } from '../lib/api'

export type ApiState<T> =
  | { status: 'loading'; data: T | undefined; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | undefined; error: ApiError }

export type ApiResult<T> = ApiState<T> & { reload: () => void }

/** Result of a finished request, tagged with the deps it was made for. */
interface Settled<T> {
  deps: DependencyList
  value: ApiState<T>
}

function sameDeps(a: DependencyList, b: DependencyList): boolean {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]))
}

/**
 * Runs `fetcher` whenever `deps` change.
 *
 * Stale-response protection, in two layers:
 * 1. Every run gets its own AbortController. When deps change (or the component unmounts)
 *    the previous request is aborted and its result is ignored, so a slow old response
 *    can never overwrite what the user asked for last.
 * 2. Each result is tagged with the deps it belongs to. If the current deps differ, the state
 *    is reported as `loading`: the UI never treats old data as the answer to the new request.
 *
 * While loading, the previous `data` is still exposed (e.g. to keep the same layout height).
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList): ApiResult<T> {
  const [reloadKey, setReloadKey] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const currentDeps = [...deps, reloadKey]

  useEffect(() => {
    const controller = new AbortController()
    const requestDeps = currentDeps

    fetcher(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        setSettled({ deps: requestDeps, value: { status: 'success', data, error: null } })
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setSettled((prev) => ({
          deps: requestDeps,
          value: { status: 'error', data: prev?.value.data, error: toApiError(error) },
        }))
      },
    )

    return () => controller.abort()
    // `fetcher` is recreated every render; `deps` is the explicit contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, currentDeps)

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const state: ApiState<T> =
    settled && sameDeps(settled.deps, currentDeps)
      ? settled.value
      : { status: 'loading', data: settled?.value.data, error: null }

  return { ...state, reload }
}
