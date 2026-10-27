import { Link } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import { formatNumber } from '../../lib/format'
import type { SagaSummary } from '../../types/api'
import { SagaError } from './SagaError'
import { canTransition, paletteStyle, titleTransitionName, useReducedMotion } from './saga-utils'
import './sagas.css'

export function SagasPage() {
  const reduced = useReducedMotion()
  const sagas = useApi((signal) => apiRequest<SagaSummary[]>('/sagas', { signal }), [])
  return <section className="sagas-index">
    <header className="sagas-heading"><p className="saga-kicker">GRAND LINE · PONEGLYPH</p><h1>Las rutas de la historia</h1><p>Elige una saga y recorre sus islas, etapa por etapa.</p></header>
    {sagas.status === 'loading' && <div className="saga-message"><Spinner label="Descifrando las sagas…" /></div>}
    {sagas.status === 'error' && <SagaError error={sagas.error} retry={sagas.reload} />}
    {sagas.status === 'success' && (sagas.data.length === 0 ? <EmptyState title="No hay sagas disponibles">Este workspace todavía no tiene historias para recorrer.</EmptyState> :
      <div className="saga-index-list">{[...sagas.data].sort((a, b) => a.order - b.order).map((saga) =>
        <article className="saga-index-item" key={saga.id} style={paletteStyle(saga.palette)}>
          <div className="saga-index-order" aria-hidden="true">{String(saga.order).padStart(2, '0')}</div>
          <div className="saga-index-content"><p className="saga-kicker">SAGA {saga.order} · {saga.stageCount} ETAPAS</p>
            <h2 style={{ viewTransitionName: titleTransitionName(saga.id) }}>{saga.title}</h2><p className="saga-subtitle">{saga.subtitle}</p><p className="saga-synopsis">{saga.synopsis}</p>
            <dl className="saga-route-summary"><div><dt>Partida</dt><dd>{saga.firstIsland}</dd></div><div><dt>Destino</dt><dd>{saga.lastIsland}</dd></div><div><dt>Distancia</dt><dd>{formatNumber(saga.totalDistanceNm)} mn</dd></div></dl>
            <Link className="saga-start" to={`/sagas/${encodeURIComponent(saga.id)}`} viewTransition={canTransition(reduced)}>Recorrer la saga <span aria-hidden="true">↗</span></Link>
          </div>
        </article>)}</div>)}
  </section>
}
