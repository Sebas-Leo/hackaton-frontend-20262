import type { ApiError } from '../../lib/api'

interface ErrorStateProps {
  error: ApiError
  onRetry?: () => void
  title?: string
}

export function ErrorState({ error, onRetry, title = 'Algo salió mal' }: ErrorStateProps) {
  const retryHint =
    error.code === 'RATE_LIMITED' && error.retryAfterSeconds ? ` Espera ${error.retryAfterSeconds} s.` : ''

  return (
    <div role="alert" className="rounded-lg border border-red-900/60 bg-red-950/40 p-4 text-sm">
      <p className="font-semibold text-red-300">{title}</p>
      <p className="mt-1 text-red-200/80">
        {error.message}
        {retryHint}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-800 px-3 py-1.5 font-medium text-red-50 hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
