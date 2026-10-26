import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, isAbortError, onUnauthorized, tokenStorage, toApiError, type ApiError } from '../lib/api'
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest } from '../types/api'
import { AuthContext, type AuthContextValue, type AuthStatus, type LogoutReason, type Session } from './auth-context'

// setTimeout overflows above ~24.8 days.
const MAX_TIMEOUT_MS = 2_147_483_647

export function AuthProvider({ children }: { children: ReactNode }) {
  // With a stored token we start in `checking`, so private routes wait instead of flashing the login.
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'checking' : 'anonymous'))
  const [session, setSession] = useState<Session | null>(null)
  const [restoreError, setRestoreError] = useState<ApiError | null>(null)
  const [logoutReason, setLogoutReason] = useState<LogoutReason | null>(null)
  const [restoreAttempt, setRestoreAttempt] = useState(0)

  const logout = useCallback((reason: LogoutReason = 'manual') => {
    tokenStorage.clear()
    setSession(null)
    setRestoreError(null)
    setLogoutReason(reason)
    setStatus('anonymous')
  }, [])

  const startSession = useCallback((response: LoginResponse) => {
    tokenStorage.set(response.token)
    setSession({ user: response.user, team: response.team, expiresAt: response.expiresAt })
    setRestoreError(null)
    setLogoutReason(null)
    setStatus('authenticated')
  }, [])

  // Restore the session on reload: verify the stored token before rendering private routes.
  useEffect(() => {
    if (!tokenStorage.get()) return
    const controller = new AbortController()

    apiRequest<MeResponse>('/auth/me', { signal: controller.signal })
      .then((me) => {
        setSession(me)
        setRestoreError(null)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        const apiError = toApiError(error)
        if (apiError.status === 401) return // handled by onUnauthorized below
        // Server unreachable or failing: keep the token and let the user retry.
        setRestoreError(apiError)
      })

    return () => controller.abort()
  }, [restoreAttempt])

  // Any 401 from an authenticated request ends the session (token expired or revoked).
  useEffect(() => onUnauthorized(() => logout('expired')), [logout])

  // Also end the session exactly when the token expires, without waiting for a failing request.
  useEffect(() => {
    if (!session) return
    const msLeft = new Date(session.expiresAt).getTime() - Date.now()
    const timer = window.setTimeout(() => logout('expired'), Math.max(0, Math.min(msLeft, MAX_TIMEOUT_MS)))
    return () => window.clearTimeout(timer)
  }, [session, logout])

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: request, auth: false })
      startSession(response)
    },
    [startSession],
  )

  const register = useCallback(
    async (request: RegisterRequest) => {
      // Register returns the same payload as login, so the crew enters the app already signed in.
      const response = await apiRequest<LoginResponse>('/auth/register', {
        method: 'POST',
        body: request,
        auth: false,
      })
      startSession(response)
    },
    [startSession],
  )

  const retryRestore = useCallback(() => {
    setRestoreError(null)
    setRestoreAttempt((attempt) => attempt + 1)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, restoreError, logoutReason, login, register, logout, retryRestore }),
    [status, session, restoreError, logoutReason, login, register, logout, retryRestore],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
