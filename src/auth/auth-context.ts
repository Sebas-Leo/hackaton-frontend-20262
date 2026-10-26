import { createContext, useContext } from 'react'
import type { ApiError } from '../lib/api'
import type { LoginRequest, RegisterRequest, Team, User } from '../types/api'

/**
 * checking      -> a token exists and is being verified with /auth/me (never show the login here)
 * authenticated -> session verified
 * anonymous     -> no valid session
 */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

/** Why the last session ended: `manual` = the user clicked logout. */
export type LogoutReason = 'manual' | 'expired'

export interface Session {
  user: User
  team: Team
  expiresAt: string
}

export interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  /** Set when /auth/me failed for a reason other than 401 (network, 5xx, 429). */
  restoreError: ApiError | null
  logoutReason: LogoutReason | null
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: (reason?: LogoutReason) => void
  retryRestore: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
