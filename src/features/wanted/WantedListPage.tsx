import { useEffect, useMemo, useRef } from 'react'
import { Outlet } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import { formatNumber } from '../../lib/format'
import type { Crew, WantedPage } from '../../types/api'
import { Pagination } from './Pagination'
import { useWantedParams } from './useWantedParams'
import { WantedFilters } from './WantedFilters'
import { WantedTable, WantedTableSkeleton } from './WantedTable'
import { toWantedQuery } from './wanted-params'

// CP2 · Owner: Sebastián. Route: /wanted (detail /wanted/:id renders in <Outlet />, so the list never unmounts).
export function WantedListPage() {
  const crews = useApi((signal) => apiRequest<Crew[]>('/crews', { signal }), [])
  const knownCrewIds = useMemo(() => (crews.data ? new Set(crews.data.map((crew) => crew.id)) : undefined), [crews.data])

  const { params, queryKey, update } = useWantedParams(knownCrewIds)

  // Refetches only when the effective params change. useApi aborts the previous request,
  // so a late response for old filters can never overwrite the current one.
  const list = useApi(
    (signal) => apiRequest<WantedPage>('/wanted', { query: toWantedQuery(params), signal }),
    [queryKey],
  )

  // Never leave the user on a page that does not exist (e.g. ?page=99 or fewer results after a change).
  useEffect(() => {
    if (list.status !== 'success') return
    const lastPage = Math.max(1, list.data.totalPages)
    if (params.page > lastPage) update({ page: lastPage }, { resetPage: false, replace: true })
  }, [list.status, list.data, params.page, update])

  const resultsRef = useRef<HTMLDivElement>(null)

  function goToPage(page: number) {
    update({ page }, { resetPage: false })
    const top = resultsRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) resultsRef.current?.scrollIntoView({ block: 'start' })
  }

  const loading = list.status === 'loading'
  // While loading, show a skeleton the size of what was there, so nothing jumps and stale rows are never shown.
  const skeletonRows = Math.max(1, Math.min(list.data?.content.length || params.size, 10))

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Carteles de "Se Busca"</h1>

      <WantedFilters
        params={params}
        crews={crews.data}
        onChange={(patch) => update(patch)}
        onClear={() => update({ q: '', status: null, crewId: null, fruit: null })}
      />

      <div className="flex h-6 items-center text-sm text-slate-400" aria-live="polite">
        {loading ? (
          <Spinner label="Buscando carteles…" />
        ) : list.status === 'success' ? (
          `${formatNumber(list.data.totalElements)} carteles encontrados`
        ) : null}
      </div>

      <div ref={resultsRef} className="min-h-96 scroll-mt-24">
        {list.status === 'error' ? (
          <ErrorState title="No se pudieron cargar los carteles" error={list.error} onRetry={list.reload} />
        ) : loading ? (
          <WantedTableSkeleton rows={skeletonRows} />
        ) : list.data.content.length === 0 ? (
          <EmptyState title="Sin resultados">Ningún cartel coincide con estos filtros.</EmptyState>
        ) : (
          <WantedTable posters={list.data.content} />
        )}
      </div>

      <Pagination
        page={params.page}
        totalPages={list.data?.totalPages ?? 1}
        disabled={loading}
        onPageChange={goToPage}
      />

      <Outlet />
    </section>
  )
}
