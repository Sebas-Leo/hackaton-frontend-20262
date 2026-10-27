import { memo } from 'react'
import { Link } from 'react-router'
import { formatDateTime } from '../../lib/format'
import type { NewsItem } from '../../types/api'
import { NewsBadges } from './NewsBadges'

interface NewsCardProps {
  item: NewsItem
  /** Current feed filters (location.search): kept so closing the detail returns to the same feed. */
  search: string
}

// memo: appending a page must not re-render the cards that were already on screen.
export const NewsCard = memo(function NewsCard({ item, search }: NewsCardProps) {
  return (
    <li>
      <Link
        to={{ pathname: `/news/${encodeURIComponent(item.id)}`, search }}
        state={{ fromList: true }}
        // The feed stays mounted behind the detail: do not scroll it to the top.
        preventScrollReset
        className="block space-y-2 rounded-lg border border-slate-800 p-4 outline-none hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-amber-400/60"
      >
        <NewsBadges item={item} />
        <h2 className="font-semibold">{item.title}</h2>
        <p className="text-sm text-slate-300">{item.summary}</p>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>{item.island}</span>
          <span>Fuente: {item.source}</span>
          <time dateTime={item.publishedAt}>{formatDateTime(item.publishedAt)}</time>
        </p>
      </Link>
    </li>
  )
})

export function NewsFeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul aria-busy="true" className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="h-32 rounded-lg bg-slate-800/60 motion-safe:animate-pulse" />
      ))}
    </ul>
  )
}
