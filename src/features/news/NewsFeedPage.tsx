import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { formatNumber } from '../../lib/format'
import { NewsCard, NewsFeedSkeleton } from './NewsCard'
import { NewsFilters } from './NewsFilters'
import { NewsLocked } from './NewsLocked'
import { isLogPoseLocked } from './news-errors'
import type { NewsOutletContext } from './news-outlet'
import { useInfiniteSentinel } from './useInfiniteSentinel'
import { useNewsFeed } from './useNewsFeed'
import { useNewsParams } from './useNewsParams'

function countText(count: number): string {
  return count === 1 ? '1 noticia cargada' : `${formatNumber(count)} noticias cargadas`
}

// CP4 · Owner: Camila. Route: /news (detail /news/:id renders in <Outlet />, so the feed keeps its items and scroll).
export function NewsFeedPage() {
  const { params, queryKey, update } = useNewsParams()
  const feed = useNewsFeed(queryKey)
  const { search } = useLocation()

  // Stable: the detail drawer gets the same function for the whole life of the feed.
  const outletContext = useMemo<NewsOutletContext>(() => ({ onItemUpdated: feed.replaceItem }), [feed.replaceItem])

  // Only an idle feed with more pages asks for the next one: never while loading and never after an error.
  const sentinelRef = useInfiniteSentinel(feed.loadMore, feed.phase === 'ready' && feed.hasMore)

  const locked = feed.error !== null && isLogPoseLocked(feed.error)
  const initialError = feed.phase === 'error' && !feed.loadedFirstPage
  const moreError = feed.phase === 'error' && feed.loadedFirstPage ? feed.error : null
  const isEmpty = feed.phase === 'ready' && feed.items.length === 0 && !feed.hasMore
  const reachedEnd = feed.phase === 'ready' && !feed.hasMore && feed.items.length > 0

  // "Loading more" is announced by its own spinner at the bottom, so it is not repeated here.
  const statusText =
    feed.phase === 'loading' ? 'Cargando noticias…' : feed.items.length > 0 ? countText(feed.items.length) : ''

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">News Coo</h1>

      {locked ? (
        <NewsLocked onRetry={feed.retry} />
      ) : (
        <>
          <NewsFilters
            params={params}
            onChange={update}
            onClear={() => update({ type: null, priority: null, status: null })}
          />

          <p className="h-6 text-sm text-slate-400" aria-live="polite">
            {statusText}
          </p>

          {feed.phase === 'loading' ? (
            <NewsFeedSkeleton />
          ) : initialError && feed.error ? (
            <ErrorState title="No se pudieron cargar las noticias" error={feed.error} onRetry={feed.retry} />
          ) : isEmpty ? (
            <EmptyState title="Sin noticias">Ninguna noticia coincide con estos filtros.</EmptyState>
          ) : (
            <>
              {feed.items.length > 0 && (
                <ul className="space-y-3">
                  {feed.items.map((item) => (
                    <NewsCard key={item.id} item={item} search={search} />
                  ))}
                </ul>
              )}

              {/* Visible 400px before the end of the list (see useInfiniteSentinel): that is what loads the next page. */}
              <div ref={sentinelRef} aria-hidden="true" className="h-px" />

              {feed.phase === 'loadingMore' && (
                <div className="flex justify-center py-2">
                  <Spinner label="Cargando más noticias…" />
                </div>
              )}

              {moreError && (
                <ErrorState title="No se pudieron cargar más noticias" error={moreError} onRetry={feed.retry} />
              )}

              {reachedEnd && (
                <p role="status" className="py-4 text-center text-sm text-slate-500">
                  No hay más noticias
                </p>
              )}
            </>
          )}
        </>
      )}

      <Outlet context={outletContext} />
    </section>
  )
}
