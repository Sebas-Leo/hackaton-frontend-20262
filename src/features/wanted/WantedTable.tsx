import { Link, useLocation } from 'react-router'
import { formatBerries } from '../../lib/format'
import type { WantedSummary } from '../../types/api'
import { FRUIT_LABELS, STATUS_LABELS, STATUS_STYLES } from './wanted-labels'

export function WantedTable({ posters }: { posters: WantedSummary[] }) {
  const location = useLocation()

  return (
    <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800">
      {posters.map((poster) => (
        <li key={poster.id}>
          <Link
            to={{ pathname: `/wanted/${poster.id}`, search: location.search }}
            state={{ fromList: true }}
            // The list stays mounted behind the detail: do not scroll it to the top.
            preventScrollReset
            className="grid h-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-slate-900 md:grid-cols-[2fr_1.5fr_1fr_1fr_auto]"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{poster.name}</span>
              <span className="block truncate text-sm text-slate-400">"{poster.epithet}"</span>
            </span>
            <span className="hidden truncate text-sm text-slate-300 md:block">{poster.crew.name}</span>
            <span className="hidden md:block">
              <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[poster.status]}`}>
                {STATUS_LABELS[poster.status]}
              </span>
            </span>
            <span className="hidden text-sm text-slate-400 md:block">
              {poster.devilFruit ? FRUIT_LABELS[poster.devilFruit.type] : FRUIT_LABELS.NONE}
            </span>
            <span className="text-right font-mono text-sm text-amber-200">{formatBerries(poster.bounty)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function WantedTableSkeleton({ rows }: { rows: number }) {
  return (
    <ul aria-busy="true" className="divide-y divide-slate-800 rounded-lg border border-slate-800">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="px-4 py-3">
          <div className="h-10 rounded bg-slate-800/60 motion-safe:animate-pulse" />
        </li>
      ))}
    </ul>
  )
}
