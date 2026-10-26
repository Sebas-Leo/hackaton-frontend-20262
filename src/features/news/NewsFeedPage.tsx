import { Outlet } from 'react-router'

// CP4 · Owner: Camila. Route: /news (detail /news/:id renders in <Outlet />, so the feed keeps its items and scroll).
export function NewsFeedPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">News Coo</h1>
      <p className="text-slate-400">TODO CP4</p>
      <Outlet />
    </section>
  )
}
