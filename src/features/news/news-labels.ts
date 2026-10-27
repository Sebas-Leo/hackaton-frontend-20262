import type { NewsPriority, NewsStatus, NewsType } from '../../types/api'

export const TYPE_LABELS: Record<NewsType, string> = {
  BOUNTY_UPDATE: 'Recompensa',
  BATTLE: 'Batalla',
  MARINE_OPERATION: 'Operación de la Marina',
  WORLD_GOVERNMENT: 'Gobierno Mundial',
  DISCOVERY: 'Descubrimiento',
}

export const PRIORITY_LABELS: Record<NewsPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const STATUS_LABELS: Record<NewsStatus, string> = {
  RUMOR: 'Rumor',
  CONFIRMED: 'Confirmada',
  DEBUNKED: 'Desmentida',
}

export const TYPE_STYLE = 'bg-indigo-950 text-indigo-300 border-indigo-800'

export const PRIORITY_STYLES: Record<NewsPriority, string> = {
  LOW: 'bg-slate-800 text-slate-300 border-slate-600',
  MEDIUM: 'bg-sky-950 text-sky-300 border-sky-800',
  HIGH: 'bg-orange-950 text-orange-300 border-orange-800',
  CRITICAL: 'bg-red-950 text-red-300 border-red-800',
}

export const STATUS_STYLES: Record<NewsStatus, string> = {
  RUMOR: 'bg-amber-950 text-amber-300 border-amber-800',
  CONFIRMED: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  DEBUNKED: 'bg-slate-800 text-slate-400 border-slate-600',
}
