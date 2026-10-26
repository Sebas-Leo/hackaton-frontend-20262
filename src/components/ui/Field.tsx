import { useId, type InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

/** Labeled input that shows its own error right below it (server errors included). */
export function Field({ label, error, hint, ...inputProps }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500/40' : 'border-slate-700 focus:ring-amber-400/40'
        }`}
        {...inputProps}
      />
      {message && (
        <p id={messageId} className={`text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
