import { useEffect, useRef, useState } from 'react'

const DEBOUNCE_MS = 400

interface SearchBoxProps {
  /** Committed value (from the URL). */
  value: string
  onCommit: (query: string) => void
}

/**
 * Debounced search: every keystroke restarts the timer, and the URL (and therefore the request)
 * only changes after the user stops typing for DEBOUNCE_MS. Enter commits immediately.
 */
export function SearchBox({ value, onCommit }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)
  const timer = useRef<number | undefined>(undefined)

  // External changes (back/forward, "clear filters") must be reflected in the input.
  // (Keeps what the user is typing, e.g. a trailing space, if it already matches.)
  useEffect(() => {
    setDraft((current) => (current.trim() === value ? current : value))
  }, [value])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function commit(next: string) {
    window.clearTimeout(timer.current)
    const query = next.trim()
    if (query !== value) onCommit(query)
  }

  return (
    <div className="space-y-1">
      <label htmlFor="wanted-search" className="block text-xs font-medium text-slate-400">
        Buscar por nombre o epíteto
      </label>
      <input
        id="wanted-search"
        type="search"
        value={draft}
        placeholder="Ej: Ancla Roja"
        onChange={(event) => {
          const next = event.target.value
          setDraft(next)
          window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => commit(next), DEBOUNCE_MS)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit(draft)
        }}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
      />
    </div>
  )
}
