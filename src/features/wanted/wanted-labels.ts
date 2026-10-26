import type { FruitFilter, WantedPageSize, WantedSort, WantedStatus } from '../../types/api'

export const STATUS_LABELS: Record<WantedStatus, string> = {
  AT_LARGE: 'Prófugo',
  CAPTURED: 'Capturado',
  MISSING: 'Desaparecido',
}

export const STATUS_STYLES: Record<WantedStatus, string> = {
  AT_LARGE: 'bg-red-950 text-red-300 border-red-800',
  CAPTURED: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  MISSING: 'bg-slate-800 text-slate-300 border-slate-600',
}

export const FRUIT_LABELS: Record<FruitFilter, string> = {
  PARAMECIA: 'Paramecia',
  ZOAN: 'Zoan',
  LOGIA: 'Logia',
  NONE: 'Sin fruta',
}

export const SORT_LABELS: Record<WantedSort, string> = {
  'bounty,desc': 'Mayor recompensa',
  'name,asc': 'Nombre (A-Z)',
  'updatedAt,desc': 'Actualizados recientemente',
}

export const SIZE_LABELS: Record<WantedPageSize, string> = {
  10: '10 por página',
  20: '20 por página',
  50: '50 por página',
}
