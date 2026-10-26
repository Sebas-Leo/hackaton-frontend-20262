import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../auth/auth-context'
import { Field } from '../components/ui/Field'
import { toApiError } from '../lib/api'
import { mapApiErrorToForm, type FormErrors } from '../lib/form-errors'

const FIELDS = ['email', 'password'] as const
type LoginField = (typeof FIELDS)[number]

const NO_ERRORS: FormErrors<LoginField> = { fieldErrors: {}, formError: null }

export function LoginPage() {
  const { login, logoutReason } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState(NO_ERRORS)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors(NO_ERRORS)
    try {
      await login({ email: email.trim(), password })
      // Redirect is handled by <PublicOnly> once the status becomes `authenticated`.
    } catch (error) {
      setErrors(mapApiErrorToForm(toApiError(error), FIELDS))
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-xl bg-slate-900/60 p-6">
        <header>
          <h1 className="text-2xl font-bold text-amber-300">Iniciar sesión</h1>
          <p className="text-sm text-slate-400">Entra con la cuenta de tu tripulación.</p>
        </header>

        {logoutReason === 'expired' && (
          <p className="rounded-md bg-amber-950/60 p-3 text-sm text-amber-200">
            Tu sesión expiró. Vuelve a iniciar sesión.
          </p>
        )}

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.fieldErrors.email}
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.fieldErrors.password}
        />

        {errors.formError && (
          <p role="alert" className="text-sm text-red-400">
            {errors.formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-amber-400 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿Sin tripulación?{' '}
          {/* Keep the redirect state so registering also returns to the original page. */}
          <Link to="/register" state={location.state} className="text-amber-300 underline">
            Regístrala
          </Link>
        </p>
      </form>
    </main>
  )
}
