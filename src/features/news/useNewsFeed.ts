import { useCallback, useEffect, useReducer, useRef } from 'react'
import { apiRequest, isAbortError, toApiError, type ApiError } from '../../lib/api'
import type { NewsFeed, NewsItem } from '../../types/api'
import { createFeedState, feedReducer } from './news-feed-reducer'
import { DEFAULT_NEWS_PARAMS, parseNewsParams, toNewsQuery, type NewsParams } from './news-params'

const PAGE_SIZE = 20

/**
 * Mutable bookkeeping that must be readable synchronously from event handlers and async callbacks.
 * React state alone is not enough: two observer callbacks in the same tick would both see "idle".
 */
interface Engine {
  /** Bumped whenever the feed restarts or unmounts; a response from an older generation is ignored. */
  generation: number
  controller: AbortController | null
  inFlight: boolean
  /** Cursor of the next page; null before the first page arrives. */
  cursor: string | null
  hasMore: boolean
  /** After an error nothing loads automatically; only an explicit retry clears this. */
  failed: boolean
  key: string
  filters: NewsParams
}

function isCursorError(error: ApiError): boolean {
  return error.code === 'INVALID_CURSOR' || error.code === 'CURSOR_FILTER_MISMATCH'
}

/**
 * Cursor-paginated feed for GET /news/feed.
 *
 * Guarantees:
 * - one request in flight at a time (`engine.inFlight`, set synchronously);
 * - a filter change aborts the running request, bumps the generation and resets the items, so a late
 *   response from old filters can never be appended;
 * - ids already shown are never appended again;
 * - after an error nothing is retried automatically, and the loaded items are kept.
 */
export function useNewsFeed(queryKey: string) {
  const [state, dispatch] = useReducer(feedReducer, queryKey, createFeedState)
  const engine = useRef<Engine>({
    generation: 0,
    controller: null,
    inFlight: false,
    cursor: null,
    hasMore: false,
    failed: false,
    key: queryKey,
    filters: DEFAULT_NEWS_PARAMS,
  })

  // `cursor === null` (re)starts the feed from the first page; otherwise it loads that page.
  const start = useCallback(function run(cursor: string | null): void {
    const current = engine.current

    if (cursor === null) {
      current.generation += 1
      current.controller?.abort()
      current.cursor = null
      current.hasMore = false
      dispatch({ type: 'reset', key: current.key })
    } else {
      dispatch({ type: 'moreStarted', key: current.key })
    }

    const { generation, key } = current
    const controller = new AbortController()
    current.controller = controller
    current.inFlight = true
    current.failed = false

    const isStale = () => generation !== engine.current.generation || controller.signal.aborted

    const load = async () => {
      try {
        const page = await apiRequest<NewsFeed>('/news/feed', {
          // The same filters travel with every cursor: the API binds a cursor to the filters it was issued for.
          query: { ...toNewsQuery(current.filters), cursor, limit: PAGE_SIZE },
          signal: controller.signal,
        })
        if (isStale()) return
        current.inFlight = false
        current.cursor = page.nextCursor
        // A cursor that does not advance would loop forever on a visible sentinel: treat it as the end.
        current.hasMore = page.hasMore && page.nextCursor !== null && page.nextCursor !== cursor
        dispatch({ type: 'loaded', key, page, hasMore: current.hasMore })
      } catch (error) {
        if (isStale() || isAbortError(error)) return
        current.inFlight = false
        const apiError = toApiError(error)
        // The cursor is no longer valid: start over from the first page (a request without cursor can not loop).
        if (cursor !== null && isCursorError(apiError)) {
          run(null)
          return
        }
        current.failed = true
        dispatch({ type: 'failed', key, error: apiError })
      }
    }
    void load()
  }, [])

  // Restart whenever the filters change. StrictMode runs this twice in dev: the cleanup aborts the
  // first request and bumps the generation, so only the second one can ever reach the state.
  useEffect(() => {
    const current = engine.current
    current.key = queryKey
    current.filters = parseNewsParams(new URLSearchParams(queryKey))
    start(null)

    return () => {
      current.generation += 1
      current.controller?.abort()
      current.inFlight = false
    }
  }, [queryKey, start])

  const loadMore = useCallback(() => {
    const current = engine.current
    if (current.inFlight || current.failed || !current.hasMore || current.cursor === null) return
    start(current.cursor)
  }, [start])

  // Explicit user retry. Without a cursor the first page failed, so the whole feed restarts.
  const retry = useCallback(() => {
    if (engine.current.inFlight) return
    start(engine.current.cursor)
  }, [start])

  const replaceItem = useCallback((item: NewsItem) => dispatch({ type: 'replaced', item }), [])

  // State made for other filters (URL just changed, effect not yet run) is never exposed.
  const view = state.key === queryKey ? state : createFeedState(queryKey)

  return { ...view, loadMore, retry, replaceItem }
}
