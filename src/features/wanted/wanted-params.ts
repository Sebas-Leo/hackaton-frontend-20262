import {
  FRUIT_FILTERS,
  WANTED_PAGE_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
  type FruitFilter,
  type WantedPageSize,
  type WantedSort,
  type WantedStatus,
} from '../../types/api'

/**
 * The URL is the single source of truth for the list.
 * `page` is 1-based in the URL (human friendly) and converted to 0-based for the API.
 */
export interface WantedParams {
  page: number
  size: WantedPageSize
  sort: WantedSort
  status: WantedStatus | null
  crewId: string | null
  fruit: FruitFilter | null
  q: string
}

export const DEFAULT_WANTED_PARAMS: WantedParams = {
  page: 1,
  size: 20,
  sort: 'bounty,desc',
  status: null,
  crewId: null,
  fruit: null,
  q: '',
}

const MAX_QUERY_LENGTH = 80

function oneOf<T extends string | number>(allowed: readonly T[], raw: string | null): T | null {
  if (raw === null) return null
  return allowed.find((value) => String(value) === raw) ?? null
}

function parsePage(raw: string | null): number {
  if (raw === null || !/^\d+$/.test(raw)) return DEFAULT_WANTED_PARAMS.page
  const page = Number(raw)
  return Number.isSafeInteger(page) && page >= 1 ? page : DEFAULT_WANTED_PARAMS.page
}

/**
 * Never throws: any invalid or unknown value falls back to its default,
 * so a hand-edited URL can not break the view.
 * `knownCrewIds` (once /crews loaded) drops a crewId that does not exist.
 */
export function parseWantedParams(search: URLSearchParams, knownCrewIds?: ReadonlySet<string>): WantedParams {
  const crewId = search.get('crewId')?.trim() || null

  return {
    page: parsePage(search.get('page')),
    size: oneOf(WANTED_PAGE_SIZES, search.get('size')) ?? DEFAULT_WANTED_PARAMS.size,
    sort: oneOf(WANTED_SORTS, search.get('sort')) ?? DEFAULT_WANTED_PARAMS.sort,
    status: oneOf(WANTED_STATUSES, search.get('status')),
    crewId: crewId && knownCrewIds && !knownCrewIds.has(crewId) ? null : crewId,
    fruit: oneOf(FRUIT_FILTERS, search.get('fruit')),
    q: (search.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH),
  }
}

/** Inverse of parse. Default values are omitted to keep shareable URLs short. Key order is fixed. */
export function serializeWantedParams(params: WantedParams): URLSearchParams {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.status) search.set('status', params.status)
  if (params.crewId) search.set('crewId', params.crewId)
  if (params.fruit) search.set('fruit', params.fruit)
  if (params.sort !== DEFAULT_WANTED_PARAMS.sort) search.set('sort', params.sort)
  if (params.size !== DEFAULT_WANTED_PARAMS.size) search.set('size', String(params.size))
  if (params.page !== DEFAULT_WANTED_PARAMS.page) search.set('page', String(params.page))
  return search
}

/** Query sent to GET /wanted. */
export function toWantedQuery(params: WantedParams) {
  return {
    page: params.page - 1,
    size: params.size,
    sort: params.sort,
    status: params.status,
    crewId: params.crewId,
    fruit: params.fruit,
    q: params.q,
  }
}
