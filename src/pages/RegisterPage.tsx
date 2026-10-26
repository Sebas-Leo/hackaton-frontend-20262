import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../auth/auth-context'
import { Field } from '../components/ui/Field'
import { toApiError } from '../lib/api'
import { mapApiErrorToForm, type FormErrors } from '../lib/form-errors'

const FIELDS = ['teamName', 'email', 'password'] as const
type RegisterField = (typeof FIELDS)[number]

const NO_ERRORS: FormErrors<RegisterField> = { fieldErrors: {}, formError: null }

export function RegisterPage() {
  const { register } = useAuth()
  const location = useLocation()
  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState(NO_ERRORS)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors(NO_ERRORS)
    try {
      // The server is the source of truth for validation; its errors are mapped to each field.
      await register({ teamName: teamName.trim(), email: email.trim(), password })
    } catch (error) {
      setErrors(mapApiErrorToForm(toApiError(error), FIELDS))
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-xl bg-slate-900/60 p-6">
        <header>
          <h1 className="text-2xl font-bold text-amber-300">Registrar tripulación</h1>
          <p className="text-sm text-slate-400">Crea la cuenta compartida de tu equipo.</p>
        </header>

        <Field
          label="Nombre de la tripulación"
          autoComplete="organization"
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          error={errors.fieldErrors.teamName}
          hint="De 3 a 40 caracteres, único."
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.fieldErrors.password}
          hint="De 8 a 72 caracteres."
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
          {submitting ? 'Registrando…' : 'Registrar y zarpar'}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tienen cuenta?{' '}
          <Link to="/login" state={location.state} className="text-amber-300 underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  )
}
