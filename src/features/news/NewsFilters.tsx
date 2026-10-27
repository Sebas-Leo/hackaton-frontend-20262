import type { ReactNode } from 'react'
import { NEWS_PRIORITIES, NEWS_STATUSES, NEWS_TYPES } from '../../types/api'
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from './news-labels'
import { oneOf, type NewsParams } from './news-params'

interface NewsFiltersProps {
  params: NewsParams
  onChange: (patch: Partial<NewsParams>) => void
  onClear: () => void
}

export function NewsFilters({ params, onChange, onClear }: NewsFiltersProps) {
  const hasFilters = Boolean(params.type || params.priority || params.status)

  return (
    <div className="grid gap-3 rounded-lg border border-slate-800 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Select label="Tipo" value={params.type ?? ''} onChange={(value) => onChange({ type: oneOf(NEWS_TYPES, value) })}>
        <option value="">Todos</option>
        {NEWS_TYPES.map((type) => (
          <option key={type} value={type}>
            {TYPE_LABELS[type]}
          </option>
        ))}
      </Select>

      <Select
        label="Prioridad"
        value={params.priority ?? ''}
        onChange={(value) => onChange({ priority: oneOf(NEWS_PRIORITIES, value) })}
      >
        <option value="">Todas</option>
        {NEWS_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </Select>

      <Select
        label="Estado"
        value={params.status ?? ''}
        onChange={(value) => onChange({ status: oneOf(NEWS_STATUSES, value) })}
      >
        <option value="">Todos</option>
        {NEWS_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

function Select({ label, value, onChange, children }: SelectProps) {
  return (
    <label className="space-y-1 text-xs font-medium text-slate-400">
      <span className="block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-400/40"
      >
        {children}
      </select>
    </label>
  )
}
