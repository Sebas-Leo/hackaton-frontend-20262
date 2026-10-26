import type { ApiError } from './api'

export interface FormErrors<F extends string> {
  fieldErrors: Partial<Record<F, string>>
  formError: string | null
}

/** Codes that always belong to a specific field, regardless of `details`. */
const CODE_TO_FIELD: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: 'email',
  TEAM_NAME_TAKEN: 'teamName',
}

/**
 * Maps a server error to the form fields it belongs to, so each message is shown
 * next to the right input. Anything that is not about a known field goes to `formError`.
 */
export function mapApiErrorToForm<F extends string>(error: ApiError, fields: readonly F[]): FormErrors<F> {
  const isField = (name: string): name is F => (fields as readonly string[]).includes(name)
  const fieldErrors: Partial<Record<F, string>> = {}

  const codeField = CODE_TO_FIELD[error.code]
  if (codeField && isField(codeField)) {
    fieldErrors[codeField] = error.message
  }

  for (const detail of error.details) {
    if (isField(detail.field) && !fieldErrors[detail.field]) {
      fieldErrors[detail.field] = detail.message
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  let formError: string | null = hasFieldErrors ? null : error.message
  if (error.code === 'RATE_LIMITED' && error.retryAfterSeconds) {
    formError = `${error.message} Intenta de nuevo en ${error.retryAfterSeconds} s.`
  }

  return { fieldErrors, formError }
}
