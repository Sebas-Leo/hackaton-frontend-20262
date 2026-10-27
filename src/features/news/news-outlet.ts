import { useOutletContext } from 'react-router'
import type { NewsItem } from '../../types/api'

/** What the feed (which stays mounted) hands to the detail drawer rendered in its <Outlet />. */
export interface NewsOutletContext {
  /** Replaces the item with the same id in the loaded feed, without re-requesting anything. */
  onItemUpdated: (item: NewsItem) => void
}

export function useNewsOutletContext(): NewsOutletContext {
  return useOutletContext<NewsOutletContext>()
}
