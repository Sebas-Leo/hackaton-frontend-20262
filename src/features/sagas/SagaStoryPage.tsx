import { Link, useParams } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import type { SagaStory } from '../../types/api'
import { GrandLineLocked } from './GrandLineLocked'
import { SagaStoryView } from './SagaStoryView'
import './saga-story.css'

// CP5 · Route: /sagas/:id (?stage=<slug> is the active stage).
export function SagaStoryPage() {
  const { id = '' } = useParams()
  const story = useApi(
    (signal) => apiRequest<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, { signal }),
    [id],
  )

  if (story.status === 'loading') {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner label="Descifrando el Poneglyph…" />
      </div>
    )
  }

  if (story.status === 'error') {
    if (story.error.code === 'LOG_POSE_REQUIRED') return <GrandLineLocked />
    if (story.error.status === 404) {
      return (
        <EmptyState title="Saga no encontrada">
          <Link to="/sagas" className="text-amber-300 underline">
            Volver a las sagas
          </Link>
        </EmptyState>
      )
    }
    return <ErrorState title="No se pudo cargar la saga" error={story.error} onRetry={story.reload} />
  }

  if (story.data.stages.length === 0) {
    return <EmptyState title="Esta saga todavía no tiene etapas" />
  }

  // key: a different saga starts from a clean state (active stage, observers).
  return <SagaStoryView key={story.data.saga.id} story={story.data} />
}
