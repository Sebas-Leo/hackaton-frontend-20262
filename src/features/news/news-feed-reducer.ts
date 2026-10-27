import type { ApiError } from '../../lib/api'
import type { NewsFeed, NewsItem } from '../../types/api'

export type FeedPhase = 'loading' | 'ready' | 'loadingMore' | 'error'

export interface FeedState {
  /** Serialized filters this state belongs to. A state made for other filters is never shown. */
  key: string
  phase: FeedPhase
  items: NewsItem[]
  hasMore: boolean
  /** Tells an initial-load error apart from a "load more" error (which keeps the items). */
  loadedFirstPage: boolean
  error: ApiError | null
}

export type FeedAction =
  | { type: 'reset'; key: string }
  | { type: 'moreStarted'; key: string }
  | { type: 'loaded'; key: string; page: NewsFeed; hasMore: boolean }
  | { type: 'failed'; key: string; error: ApiError }
  | { type: 'replaced'; item: NewsItem }

export function createFeedState(key: string): FeedState {
  return { key, phase: 'loading', items: [], hasMore: false, loadedFirstPage: false, error: null }
}

/** Appends only the items whose id is not already in the feed ("nothing is counted twice"). */
function appendUnique(current: NewsItem[], incoming: NewsItem[]): NewsItem[] {
  const seen = new Set(current.map((item) => item.id))
  const fresh: NewsItem[] = []
  for (const item of incoming) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    fresh.push(item)
  }
  return fresh.length > 0 ? [...current, ...fresh] : current
}

export function feedReducer(state: FeedState, action: FeedAction): FeedState {
  if (action.type === 'reset') return createFeedState(action.key)

  if (action.type === 'replaced') {
    const index = state.items.findIndex((item) => item.id === action.item.id)
    if (index === -1) return state
    return { ...state, items: state.items.with(index, action.item) }
  }

  // Late actions from another set of filters are dropped (second layer after the generation check).
  if (action.key !== state.key) return state

  switch (action.type) {
    case 'moreStarted':
      return { ...state, phase: 'loadingMore', error: null }
    case 'loaded':
      return {
        ...state,
        phase: 'ready',
        items: appendUnique(state.items, action.page.items),
        hasMore: action.hasMore,
        loadedFirstPage: true,
        error: null,
      }
    case 'failed':
      return { ...state, phase: 'error', error: action.error }
  }
}
