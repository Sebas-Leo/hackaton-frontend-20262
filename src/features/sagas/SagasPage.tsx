import { Link } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import { formatNumber } from '../../lib/format'
import type { SagaSummary } from '../../types/api'
import { GrandLineLocked } from './GrandLineLocked'
import { paletteVars, sagaTransitionName } from './saga-utils'
import './saga-story.css'

// CP5 · Route: /sagas.
export function SagasPage() {
  const sagas = useApi((signal) => apiRequest<SagaSummary[]>('/sagas', { signal }), [])

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Poneglyph</h1>
        <p className="text-slate-400">Las grandes sagas del Grand Line.</p>
      </header>

      {sagas.status === 'loading' && (
        <div aria-busy="true" className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-48 rounded-xl bg-slate-800/60 motion-safe:animate-pulse" />
          ))}
        </div>
      )}

      {sagas.status === 'error' &&
        (sagas.error.code === 'LOG_POSE_REQUIRED' ? (
          <GrandLineLocked />
        ) : (
          <ErrorState title="No se pudieron cargar las sagas" error={sagas.error} onRetry={sagas.reload} />
        ))}

      {sagas.status === 'success' && sagas.data.length === 0 && (
        <EmptyState title="Sin sagas">Todavía no hay sagas en el Grand Line.</EmptyState>
      )}

      {sagas.status === 'success' && sagas.data.length > 0 && (
        <ol className="grid gap-4 md:grid-cols-2">
          {sagas.data.map((saga) => (
            <li key={saga.id}>
              <SagaCard saga={saga} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function SagaCard({ saga }: { saga: SagaSummary }) {
  return (
    <Link
      to={`/sagas/${encodeURIComponent(saga.id)}`}
      // React Router uses document.startViewTransition when available, a normal navigation otherwise.
      viewTransition
      style={paletteVars(saga.palette)}
      className="group block h-full rounded-xl border border-white/10 bg-[var(--saga-bg)] p-5 text-[var(--saga-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--saga-primary)]"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--saga-accent)]">Saga {saga.order}</p>
      <h2 className="mt-1 text-xl font-bold" style={{ viewTransitionName: sagaTransitionName(saga.id) }}>
        {saga.title}
      </h2>
      <p className="text-sm opacity-80">{saga.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed opacity-90">{saga.synopsis}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="opacity-70">Etapas</dt>
          <dd className="font-semibold">{saga.stageCount}</dd>
        </div>
        <div>
          <dt className="opacity-70">Distancia</dt>
          <dd className="font-semibold">{formatNumber(saga.totalDistanceNm)} mn</dd>
        </div>
        <div>
          <dt className="opacity-70">Ruta</dt>
          <dd className="font-semibold">
            {saga.firstIsland} → {saga.lastIsland}
          </dd>
        </div>
      </dl>
      <span className="mt-4 inline-block text-sm font-semibold text-[var(--saga-primary)] group-hover:underline">
        Leer la historia →
      </span>
    </Link>
  )
}
