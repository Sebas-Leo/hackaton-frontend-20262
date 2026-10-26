import { useParams } from 'react-router'

// CP4 · Owner: Camila. Route: /news/:id (child of /news).
export function NewsDetailPage() {
  const { id } = useParams()
  return <p className="text-slate-400">TODO CP4 · detalle {id}</p>
}
