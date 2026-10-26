import { Outlet } from 'react-router'

// CP2 · Owner: Sebastián. Route: /wanted (detail /wanted/:id renders in <Outlet />, so the list never unmounts).
export function WantedListPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Carteles de "Se Busca"</h1>
      <p className="text-slate-400">TODO CP2</p>
      <Outlet />
    </section>
  )
}
