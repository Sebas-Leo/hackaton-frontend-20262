import type { ReactNode } from 'react'
import {
  FRUIT_FILTERS,
  WANTED_PAGE_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
  type Crew,
  type FruitFilter,
  type WantedPageSize,
  type WantedSort,
  type WantedStatus,
} from '../../types/api'
import { SearchBox } from './SearchBox'
import { FRUIT_LABELS, SIZE_LABELS, SORT_LABELS, STATUS_LABELS } from './wanted-labels'
import type { WantedParams } from './wanted-params'

interface WantedFiltersProps {
  params: WantedParams
  crews: Crew[] | undefined
  onChange: (patch: Partial<WantedParams>) => void
  onClear: () => void
}

export function WantedFilters({ params, crews, onChange, onClear }: WantedFiltersProps) {
  const hasFilters = Boolean(params.q || params.status || params.crewId || params.fruit)

  return (
    <div className="grid gap-3 rounded-lg border border-slate-800 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="sm:col-span-2">
        <SearchBox value={params.q} onCommit={(q) => onChange({ q })} />
      </div>

      <Select
        label="Estado"
        value={params.status ?? ''}
        onChange={(value) => onChange({ status: findValue(WANTED_STATUSES, value) })}
      >
        <option value="">Todos</option>
        {WANTED_STATUSES.map((status: WantedStatus) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <Select label="Tripulación" value={params.crewId ?? ''} onChange={(value) => onChange({ crewId: value || null })}>
        <option value="">Todas</option>
        {/* Keep a crewId from the URL selectable while /crews is still loading. */}
        {!crews && params.crewId && <option value={params.crewId}>Cargando…</option>}
        {crews?.map((crew) => (
          <option key={crew.id} value={crew.id}>
            {crew.name}
          </option>
        ))}
      </Select>

      <Select
        label="Fruta del diablo"
        value={params.fruit ?? ''}
        onChange={(value) => onChange({ fruit: findValue(FRUIT_FILTERS, value) })}
      >
        <option value="">Todas</option>
        {FRUIT_FILTERS.map((fruit: FruitFilter) => (
          <option key={fruit} value={fruit}>
            {FRUIT_LABELS[fruit]}
          </option>
        ))}
      </Select>

      <Select
        label="Ordenar"
        value={params.sort}
        onChange={(value) => onChange({ sort: findValue(WANTED_SORTS, value) ?? params.sort })}
      >
        {WANTED_SORTS.map((sort: WantedSort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </Select>

      <Select
        label="Tamaño de página"
        value={String(params.size)}
        onChange={(value) => onChange({ size: findValue(WANTED_PAGE_SIZES, value) ?? params.size })}
      >
        {WANTED_PAGE_SIZES.map((size: WantedPageSize) => (
          <option key={size} value={size}>
            {SIZE_LABELS[size]}
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

function findValue<T extends string | number>(allowed: readonly T[], raw: string): T | null {
  return allowed.find((value) => String(value) === raw) ?? null
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
