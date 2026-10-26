interface PaginationProps {
  page: number
  totalPages: number
  disabled: boolean
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, disabled, onPageChange }: PaginationProps) {
  const last = Math.max(1, totalPages)
  const button =
    'rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-400">
        Página <span className="font-semibold text-slate-200">{Math.min(page, last)}</span> de {last}
      </p>
      <div className="flex gap-2">
        <button type="button" className={button} disabled={disabled || page <= 1} onClick={() => onPageChange(1)}>
          « Primera
        </button>
        <button
          type="button"
          className={button}
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹ Anterior
        </button>
        <button
          type="button"
          className={button}
          disabled={disabled || page >= last}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente ›
        </button>
        <button
          type="button"
          className={button}
          disabled={disabled || page >= last}
          onClick={() => onPageChange(last)}
        >
          Última »
        </button>
      </div>
    </nav>
  )
}
