import { Link } from 'react-router'

// Deliberately without any automatic retry: nothing changes until the inspection is approved.
export function NewsLocked({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="status" className="rounded-lg border border-amber-800 bg-amber-950/30 p-4 text-sm">
      <p className="font-semibold text-amber-200">Grand Line bloqueado</p>
      <p className="mt-1 text-slate-300">Aprueben la inspección (CP3) para ver las noticias.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/dashboard"
          className="rounded-md bg-amber-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-amber-400"
        >
          Ir al Dashboard
        </Link>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}
