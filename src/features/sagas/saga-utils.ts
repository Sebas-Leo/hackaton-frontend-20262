import { useEffect, useState, type CSSProperties } from 'react'
import type { Palette } from '../../types/api'

export function paletteStyle(palette: Palette): CSSProperties {
  return {
    '--saga-background': palette.background,
    '--saga-surface': palette.surface,
    '--saga-primary': palette.primary,
    '--saga-accent': palette.accent,
    '--saga-text': palette.text,
  } as CSSProperties
}

export function titleTransitionName(id: string): string {
  return `saga-title-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const changed = () => setReduced(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  return reduced
}

export function canTransition(reduced: boolean): boolean {
  return !reduced && typeof document.startViewTransition === 'function'
}
