import {
  NEWS_PRIORITIES,
  NEWS_STATUSES,
  NEWS_TYPES,
  type NewsPriority,
  type NewsStatus,
  type NewsType,
} from '../../types/api'

/** The URL is the single source of truth for the feed filters. */
export interface NewsParams {
  type: NewsType | null
  priority: NewsPriority | null
  status: NewsStatus | null
}

export const DEFAULT_NEWS_PARAMS: NewsParams = { type: null, priority: null, status: null }

export function oneOf<T extends string>(allowed: readonly T[], raw: string | null): T | null {
  return allowed.find((value) => value === raw) ?? null
}

/** Never throws: any invalid or unknown value falls back to "no filter". */
export function parseNewsParams(search: URLSearchParams): NewsParams {
  return {
    type: oneOf(NEWS_TYPES, search.get('type')),
    priority: oneOf(NEWS_PRIORITIES, search.get('priority')),
    status: oneOf(NEWS_STATUSES, search.get('status')),
  }
}

/** Inverse of parse. Empty filters are omitted and the key order is fixed, so equal filters give equal URLs. */
export function serializeNewsParams(params: NewsParams): URLSearchParams {
  const search = new URLSearchParams()
  if (params.type) search.set('type', params.type)
  if (params.priority) search.set('priority', params.priority)
  if (params.status) search.set('status', params.status)
  return search
}

/** Filters sent to GET /news/feed (the cursor and limit are added by the feed hook). */
export function toNewsQuery(params: NewsParams) {
  return { type: params.type, priority: params.priority, status: params.status }
}
