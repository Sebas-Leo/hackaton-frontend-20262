import type { NewsItem } from '../../types/api'
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES, TYPE_LABELS, TYPE_STYLE } from './news-labels'

const BADGE = 'rounded-full border px-2 py-0.5 text-xs'

export function NewsBadges({ item }: { item: Pick<NewsItem, 'type' | 'priority' | 'status'> }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`${BADGE} ${TYPE_STYLE}`}>{TYPE_LABELS[item.type]}</span>
      <span className={`${BADGE} ${PRIORITY_STYLES[item.priority]}`}>Prioridad {PRIORITY_LABELS[item.priority]}</span>
      <span className={`${BADGE} ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</span>
    </div>
  )
}
