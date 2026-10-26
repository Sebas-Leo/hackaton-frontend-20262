import type { ApiErrorBody, ApiErrorDetail } from '../types/api'

const BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL
const TOKEN_KEY = 'logpose.token'

/** Normalized error for every failed request (HTTP error or network failure). */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[]
  readonly retryAfterSeconds: number | undefined
  readonly body: ApiErrorBody | undefined

  constructor(status: number, code: string, message: string, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = body?.details ?? []
    this.retryAfterSeconds = body?.retryAfterSeconds
    this.body = body
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/** Turns anything thrown into an ApiError so the UI only deals with one error shape. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  const message = error instanceof Error ? error.message : 'Error inesperado.'
  return new ApiError(0, 'UNKNOWN_ERROR', message)
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  )
}

// ---------- Token storage ----------
// localStorage so the session survives a reload (CP1: restore session).

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}

// ---------- Global 401 handling ----------
// Any authenticated request that comes back 401 means the session is no longer valid.
// The AuthProvider subscribes here and sends the user back to /login.

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

// ---------- Request ----------

export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Empty, null or undefined values are skipped. */
  query?: Record<string, QueryValue>
  signal?: AbortSignal
  /** Send the bearer token (default true). */
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, auth = true } = options

  if (!BASE_URL) {
    throw new ApiError(0, 'CONFIG_ERROR', 'Falta la variable VITE_API_BASE_URL en el archivo .env.')
  }

  const url = new URL(BASE_URL.replace(/\/$/, '') + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')

  const sentToken = auth ? tokenStorage.get() : null
  if (sentToken) headers.set('Authorization', `Bearer ${sentToken}`)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = isErrorBody(data)
      ? new ApiError(response.status, data.code, data.message, data)
      : new ApiError(response.status, 'HTTP_ERROR', `Error ${response.status} del servidor.`)

    // Only invalidate the session if the rejected token is still the current one
    // (a late 401 from an old token must not log out a fresh session).
    if (response.status === 401 && sentToken && tokenStorage.get() === sentToken) {
      tokenStorage.clear()
      unauthorizedListeners.forEach((listener) => listener())
    }
    throw error
  }

  return data as T
}
