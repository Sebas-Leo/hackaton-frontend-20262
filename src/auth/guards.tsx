import { Navigate, Outlet, useLocation } from 'react-router'
import { SessionSplash } from '../components/SessionSplash'
import { useAuth } from './auth-context'
import { getRedirectTarget, type RedirectState } from './redirect'

/** Private routes: wait while the session is verified, bounce to /login remembering where the user was going. */
export function RequireAuth() {
  const { status, logoutReason } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <SessionSplash />

  if (status === 'anonymous') {
    // After a manual logout we do not send the next login back to the old page.
    const state: RedirectState | undefined =
      logoutReason === 'manual'
        ? undefined
        : { from: { pathname: location.pathname, search: location.search, hash: location.hash } }
    return <Navigate to="/login" replace state={state} />
  }

  return <Outlet />
}

/** Login/register: once authenticated, go to the page the user originally wanted. */
export function PublicOnly() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <SessionSplash />
  if (status === 'authenticated') return <Navigate to={getRedirectTarget(location.state)} replace />

  return <Outlet />
}
