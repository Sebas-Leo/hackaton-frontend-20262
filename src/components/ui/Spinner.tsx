export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-400">
      <span
        aria-hidden="true"
        className="size-4 rounded-full border-2 border-slate-600 border-t-amber-400 motion-safe:animate-spin"
      />
      {label}
    </span>
  )
}
