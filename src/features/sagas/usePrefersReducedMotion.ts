import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Live value of the user's reduced-motion preference (used for JS-driven scrolling). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches)
}
