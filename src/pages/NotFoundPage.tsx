import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="space-y-3">
        <p className="font-mono text-6xl font-bold text-amber-300">404</p>
        <h1 className="text-xl font-semibold">Rumbo desconocido</h1>
        <p className="text-slate-400">Esta ruta no aparece en ningún Log Pose.</p>
        <Link to="/dashboard" className="inline-block rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950">
          Volver al dashboard
        </Link>
      </div>
    </main>
  )
}
