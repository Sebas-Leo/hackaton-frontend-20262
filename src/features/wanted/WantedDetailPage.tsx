import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import { formatBerries, formatDateTime } from '../../lib/format'
import type { WantedDetail } from '../../types/api'
import { FRUIT_LABELS, STATUS_LABELS, STATUS_STYLES } from './wanted-labels'

function cameFromList(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'fromList' in state && state.fromList === true
}

// CP2 · Owner: Sebastián. Route: /wanted/:id, rendered as a drawer over the (still mounted) list.
export function WantedDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const fromList = cameFromList(location.state)

  const detail = useApi(
    (signal) => apiRequest<WantedDetail>(`/wanted/${encodeURIComponent(id)}`, { signal }),
    [id],
  )

  const close = useCallback(() => {
    // Opened from the list: going back restores that exact history entry (filters, page, scroll).
    if (fromList) navigate(-1)
    else navigate({ pathname: '/wanted', search: location.search }, { preventScrollReset: true })
  }, [fromList, navigate, location.search])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={close}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="wanted-detail-title"
        onClick={(event) => event.stopPropagation()}
        className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-800 bg-slate-950 p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="wanted-detail-title" className="text-xl font-bold">
            {detail.data?.name ?? 'Cartel'}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>

        {detail.status === 'loading' && <Spinner label="Cargando cartel…" />}

        {detail.status === 'error' &&
          (detail.error.status === 404 ? (
            <p className="text-slate-400">Este cartel no existe en tu workspace.</p>
          ) : (
            <ErrorState title="No se pudo cargar el cartel" error={detail.error} onRetry={detail.reload} />
          ))}

        {detail.status === 'success' && <PosterDetail poster={detail.data} />}
      </article>
    </div>
  )
}

function PosterDetail({ poster }: { poster: WantedDetail }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-400">"{poster.epithet}"</p>
        <p className="mt-2 font-mono text-2xl text-amber-200">{formatBerries(poster.bounty)}</p>
        <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[poster.status]}`}>
          {STATUS_LABELS[poster.status]}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Item label="Tripulación" value={poster.crew.name} />
        <Item label="Rol" value={poster.role} />
        <Item
          label="Fruta del diablo"
          value={poster.devilFruit ? `${poster.devilFruit.name} (${FRUIT_LABELS[poster.devilFruit.type]})` : 'Ninguna'}
        />
        <Item label="Amenaza" value={`${poster.threatLevel} / 5`} />
        <Item label="Edad" value={`${poster.age} años`} />
        <Item label="Altura" value={`${poster.heightCm} cm`} />
        <Item label="Visto por última vez" value={`${poster.lastSeen.island} · ${formatDateTime(poster.lastSeen.seenAt)}`} />
        <Item label="Actualizado" value={formatDateTime(poster.updatedAt)} />
      </dl>

      <p className="text-sm leading-relaxed text-slate-300">{poster.bio}</p>

      <section>
        <h3 className="text-sm font-semibold text-slate-400">Historial de recompensas</h3>
        <ol className="mt-2 space-y-1 text-sm">
          {poster.bountyHistory.map((entry) => (
            <li key={entry.issuedAt} className="flex justify-between">
              <span className="text-slate-400">{formatDateTime(entry.issuedAt)}</span>
              <span className="font-mono">{formatBerries(entry.amount)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
