// Types mirrored from the public Swagger contract (/openapi.json).
// Shared by every feature: extend here instead of redefining per feature.

// ---------- Auth ----------

export interface User {
  id: string
  name: string
  email: string
}

export interface Team {
  code: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  teamName: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: 'Bearer'
  expiresAt: string
  user: User
  team: Team
}

export interface MeResponse {
  user: User
  team: Team
  expiresAt: string
}

// ---------- Errors ----------

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'TEAM_NAME_TAKEN'
  | 'REGISTRATION_CLOSED'
  | 'INVALID_CURSOR'
  | 'CURSOR_FILTER_MISMATCH'
  | 'NOT_FOUND'
  | 'NEWS_ALREADY_VERIFIED'
  | 'LOG_POSE_REQUIRED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  status: number
  code: string
  message: string
  traceId: string
  details?: ApiErrorDetail[]
  retryAfterSeconds?: number
  current?: NewsDetail
}

// ---------- Crews & Wanted ----------

export const WANTED_STATUSES = ['AT_LARGE', 'CAPTURED', 'MISSING'] as const
export type WantedStatus = (typeof WANTED_STATUSES)[number]

export const FRUIT_TYPES = ['PARAMECIA', 'ZOAN', 'LOGIA'] as const
export type FruitType = (typeof FRUIT_TYPES)[number]

/** Values accepted by the `fruit` filter of GET /wanted (NONE = no fruit). */
export const FRUIT_FILTERS = [...FRUIT_TYPES, 'NONE'] as const
export type FruitFilter = (typeof FRUIT_FILTERS)[number]

export const WANTED_SORTS = ['bounty,desc', 'name,asc', 'updatedAt,desc'] as const
export type WantedSort = (typeof WANTED_SORTS)[number]

export const WANTED_PAGE_SIZES = [10, 20, 50] as const
export type WantedPageSize = (typeof WANTED_PAGE_SIZES)[number]

export type CrewRole =
  | 'CAPTAIN'
  | 'FIRST_MATE'
  | 'NAVIGATOR'
  | 'SNIPER'
  | 'COOK'
  | 'DOCTOR'
  | 'SHIPWRIGHT'
  | 'MUSICIAN'
  | 'ARCHAEOLOGIST'
  | 'HELMSMAN'
  | 'FIGHTER'

export interface CrewRef {
  id: string
  name: string
}

export interface Crew {
  id: string
  name: string
  shipName: string
  jollyRogerColor: string
  memberCount: number
  totalBounty: number
}

export interface DevilFruit {
  name: string
  type: FruitType
}

export interface WantedSummary {
  id: string
  name: string
  epithet: string
  bounty: number
  status: WantedStatus
  crew: CrewRef
  role: CrewRole
  devilFruit: DevilFruit | null
  threatLevel: number
  lastSeenIsland: string
  updatedAt: string
}

export interface WantedDetail extends WantedSummary {
  age: number
  heightCm: number
  bio: string
  lastSeen: { island: string; seenAt: string }
  bountyHistory: { amount: number; issuedAt: string }[]
}

export interface WantedPage {
  content: WantedSummary[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

// ---------- Dashboard & Log Pose ----------

export interface DashboardSummary {
  team: Team
  wanted: {
    total: number
    totalBounty: number
    averageBounty: number
    byStatus: Record<WantedStatus, number>
    byFruit: Record<FruitFilter, number>
  }
  crews: {
    total: number
    mostWanted: Crew | null
  }
  topBounties: WantedSummary[]
  generatedAt: string
}

export type LogPoseStatus = 'LOCKED' | 'UNLOCKED'

export interface LogPose {
  status: LogPoseStatus
  grandLineUnlocked: boolean
  unlockedAt: string | null
  message: string
}

// ---------- News (Grand Line) ----------

export const NEWS_TYPES = [
  'BOUNTY_UPDATE',
  'BATTLE',
  'MARINE_OPERATION',
  'WORLD_GOVERNMENT',
  'DISCOVERY',
] as const
export type NewsType = (typeof NEWS_TYPES)[number]

export const NEWS_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type NewsPriority = (typeof NEWS_PRIORITIES)[number]

export const NEWS_STATUSES = ['RUMOR', 'CONFIRMED', 'DEBUNKED'] as const
export type NewsStatus = (typeof NEWS_STATUSES)[number]

export interface NewsItem {
  id: string
  type: NewsType
  priority: NewsPriority
  status: NewsStatus
  title: string
  summary: string
  source: string
  island: string
  relatedWanted: CrewRef | null
  publishedAt: string
  updatedAt: string
  verifiedAt: string | null
}

export interface NewsDetail extends NewsItem {
  body: string[]
}

export interface NewsFeed {
  items: NewsItem[]
  nextCursor: string | null
  hasMore: boolean
}

export interface NewsStatusUpdate {
  status: Exclude<NewsStatus, 'RUMOR'>
}

// ---------- Sagas (Grand Line) ----------

export interface Palette {
  background: string
  surface: string
  primary: string
  accent: string
  text: string
}

export interface SagaSummary {
  id: string
  order: number
  title: string
  subtitle: string
  synopsis: string
  stageCount: number
  totalDistanceNm: number
  firstIsland: string
  lastIsland: string
  palette: Palette
}

export type StageMetricKey = 'distanceNm' | 'crewMorale' | 'bountyPool' | 'marineThreat'

export interface StageMetric {
  key: StageMetricKey
  label: string
  value: number
  unit: string
}

export interface SagaStage {
  id: string
  order: number
  slug: string
  title: string
  narrative: string[]
  island: { id: string; name: string; x: number; y: number }
  palette: Palette
  metrics: StageMetric[]
}

export interface SagaStory {
  saga: SagaSummary & { intro: string }
  map: { width: number; height: number }
  stages: SagaStage[]
}
