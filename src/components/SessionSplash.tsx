import { useAuth } from '../auth/auth-context'
import { ErrorState } from './ui/ErrorState'
import { Spinner } from './ui/Spinner'

/** Shown while a stored token is verified, so a reload never flashes the login screen. */
export function SessionSplash() {
  const { restoreError, retryRestore, logout } = useAuth()

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm space-y-4 text-center">
        <p className="text-lg font-semibold text-amber-300">Log Pose Console</p>
        {restoreError ? (
          <>
            <ErrorState title="No pudimos verificar tu sesión" error={restoreError} onRetry={retryRestore} />
            <button type="button" onClick={() => logout('manual')} className="text-sm text-slate-400 underline">
              Ir al login
            </button>
          </>
        ) : (
          <Spinner label="Verificando sesión…" />
        )}
      </div>
    </main>
  )
}
