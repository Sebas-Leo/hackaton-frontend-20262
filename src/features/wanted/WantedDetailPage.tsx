import { useParams } from 'react-router'

// CP2 · Owner: Sebastián. Route: /wanted/:id (child of /wanted).
export function WantedDetailPage() {
  const { id } = useParams()
  return <p className="text-slate-400">TODO CP2 · detalle {id}</p>
}
