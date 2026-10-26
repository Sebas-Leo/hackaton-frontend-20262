import type { ReactNode } from 'react'

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
      <p className="font-semibold text-slate-200">{title}</p>
      {children && <div className="mt-1">{children}</div>}
    </div>
  )
}
