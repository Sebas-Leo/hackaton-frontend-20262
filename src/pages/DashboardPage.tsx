import { Link } from 'react-router'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { useApi, type ApiResult } from '../hooks/useApi'
import { apiRequest } from '../lib/api'
import { formatBerries, formatDateTime, formatNumber } from '../lib/format'
import type { DashboardSummary, LogPose } from '../types/api'

const STATUS_LABELS = { AT_LARGE: 'Prófugos', CAPTURED: 'Capturados', MISSING: 'Desaparecidos' } as const
const FRUIT_LABELS = { PARAMECIA: 'Paramecia', ZOAN: 'Zoan', LOGIA: 'Logia', NONE: 'Sin fruta' } as const

export function DashboardPage() {
  // Two independent requests: if one fails, the other still renders and each one retries on its own.
  const summary = useApi((signal) => apiRequest<DashboardSummary>('/dashboard/summary', { signal }), [])
  const logPose = useApi((signal) => apiRequest<LogPose>('/log-pose', { signal }), [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <LogPoseCard state={logPose} />

      {summary.status === 'loading' && !summary.data && <DashboardSkeleton />}
      {summary.status === 'error' && (
        <ErrorState title="No se pudo cargar el resumen" error={summary.error} onRetry={summary.reload} />
      )}
      {summary.data && <SummaryView summary={summary.data} refreshing={summary.status === 'loading'} />}
    </div>
  )
}

function LogPoseCard({ state }: { state: ApiResult<LogPose> }) {
  if (state.status === 'error') {
    return <ErrorState title="No se pudo leer el Log Pose" error={state.error} onRetry={state.reload} />
  }
  if (!state.data) {
    return (
      <section className="rounded-lg border border-slate-800 p-4">
        <Spinner label="Leyendo el Log Pose…" />
      </section>
    )
  }

  const { grandLineUnlocked, message, unlockedAt } = state.data
  return (
    <section
      className={`rounded-lg border p-4 ${
        grandLineUnlocked ? 'border-emerald-700 bg-emerald-950/40' : 'border-amber-800 bg-amber-950/30'
      }`}
    >
      <p className="text-sm font-semibold">
        Log Pose: {grandLineUnlocked ? 'Grand Line desbloqueado' : 'Bloqueado (pendiente de inspección)'}
      </p>
      <p className="mt-1 text-sm text-slate-300">{message}</p>
      {unlockedAt && <p className="mt-1 text-xs text-slate-400">Desde {formatDateTime(unlockedAt)}</p>}
    </section>
  )
}

function SummaryView({ summary, refreshing }: { summary: DashboardSummary; refreshing: boolean }) {
  const { wanted, crews, topBounties } = summary

  if (wanted.total === 0) {
    return (
      <EmptyState title="Workspace vacío">
        Tu tripulación aún no tiene carteles de "Se Busca" registrados.
      </EmptyState>
    )
  }

  return (
    <div className={`space-y-6 ${refreshing ? 'opacity-60' : ''}`}>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Carteles" value={formatNumber(wanted.total)} />
        <Stat label="Recompensa total" value={formatBerries(wanted.totalBounty)} />
        <Stat label="Recompensa promedio" value={formatBerries(wanted.averageBounty)} />
        <Stat label="Tripulaciones" value={formatNumber(crews.total)} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Breakdown
          title="Por estado"
          rows={Object.entries(STATUS_LABELS).map(([key, label]) => ({
            label,
            value: wanted.byStatus[key as keyof typeof STATUS_LABELS],
          }))}
        />
        <Breakdown
          title="Por fruta del diablo"
          rows={Object.entries(FRUIT_LABELS).map(([key, label]) => ({
            label,
            value: wanted.byFruit[key as keyof typeof FRUIT_LABELS],
          }))}
        />
      </section>

      {crews.mostWanted && (
        <section className="rounded-lg border border-slate-800 p-4">
          <h2 className="text-sm font-semibold text-slate-400">Tripulación más buscada</h2>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{ backgroundColor: crews.mostWanted.jollyRogerColor }}
            />
            {crews.mostWanted.name}
          </p>
          <p className="text-sm text-slate-400">
            {crews.mostWanted.shipName} · {crews.mostWanted.memberCount} carteles ·{' '}
            {formatBerries(crews.mostWanted.totalBounty)}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-slate-800 p-4">
        <h2 className="text-sm font-semibold text-slate-400">Top recompensas</h2>
        <ol className="mt-2 divide-y divide-slate-800">
          {topBounties.map((poster) => (
            <li key={poster.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <Link to={`/wanted/${poster.id}`} className="hover:text-amber-300">
                <span className="font-medium">{poster.name}</span>{' '}
                <span className="text-slate-400">"{poster.epithet}"</span>
              </Link>
              <span className="font-mono text-amber-200">{formatBerries(poster.bounty)}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-xs text-slate-500">Actualizado: {formatDateTime(summary.generatedAt)}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <div className="rounded-lg border border-slate-800 p-4">
      <h2 className="text-sm font-semibold text-slate-400">{title}</h2>
      <dl className="mt-2 space-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt>{row.label}</dt>
            <dd className="font-mono">{formatNumber(row.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-20 rounded-lg bg-slate-800/60 motion-safe:animate-pulse" />
      ))}
    </div>
  )
}
