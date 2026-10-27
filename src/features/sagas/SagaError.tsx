import { Link } from 'react-router'
import { ErrorState } from '../../components/ui/ErrorState'
import type { ApiError } from '../../lib/api'

export function SagaError({ error, retry }: { error: ApiError; retry: () => void }) {
  if (error.status === 423 || error.code === 'LOG_POSE_REQUIRED') {
    return <section className="saga-message" role="status">
      <p className="saga-kicker">REVERSE MOUNTAIN</p>
      <h2>El Grand Line sigue bloqueado</h2>
      <p>{error.message}</p>
      <div className="saga-actions"><button onClick={retry}>Comprobar acceso</button><Link to="/dashboard">Volver al dashboard</Link></div>
    </section>
  }
  if (error.status === 404) {
    return <section className="saga-message"><h2>Saga no encontrada</h2><p>Esta saga no existe en el workspace de tu tripulación.</p><Link to="/sagas">Ver sagas disponibles</Link></section>
  }
  return <ErrorState title="No se pudo cargar la saga" error={error} onRetry={retry} />
}
