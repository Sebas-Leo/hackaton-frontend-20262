/** Router state attached when an anonymous user is bounced from a private route. */
export interface RedirectState {
  from: { pathname: string; search: string; hash: string }
}

function isRedirectState(state: unknown): state is RedirectState {
  if (typeof state !== 'object' || state === null || !('from' in state)) return false
  const { from } = state
  return typeof from === 'object' && from !== null && 'pathname' in from && typeof from.pathname === 'string'
}

/** Full path (with query string and hash) the user wanted before logging in. */
export function getRedirectTarget(state: unknown): string {
  if (!isRedirectState(state)) return '/dashboard'
  const { pathname, search, hash } = state.from
  if (pathname === '/login' || pathname === '/register') return '/dashboard'
  return `${pathname}${search ?? ''}${hash ?? ''}`
}
