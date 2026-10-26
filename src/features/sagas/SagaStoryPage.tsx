import { useParams } from 'react-router'

// CP5 · Owner: Ariana. Route: /sagas/:id.
export function SagaStoryPage() {
  const { id } = useParams()
  return <p className="text-slate-400">TODO CP5 · saga {id}</p>
}
