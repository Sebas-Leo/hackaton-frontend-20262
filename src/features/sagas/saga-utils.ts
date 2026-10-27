import { formatBerries, formatNumber } from '../../lib/format'
import type { Palette, SagaStage, StageMetric } from '../../types/api'

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/** Colors come from the API: only accept hex values before putting them in CSS. */
export function safeColor(value: string, fallback: string): string {
  return HEX_COLOR.test(value) ? value : fallback
}

const FALLBACK_PALETTE: Palette = {
  background: '#0f172a',
  surface: '#1e293b',
  primary: '#fbbf24',
  accent: '#38bdf8',
  text: '#f8fafc',
}

/** Palette as CSS custom properties, consumed by saga-story.css and Tailwind arbitrary values. */
export function paletteVars(palette: Palette): Record<string, string> {
  return {
    '--saga-bg': safeColor(palette.background, FALLBACK_PALETTE.background),
    '--saga-surface': safeColor(palette.surface, FALLBACK_PALETTE.surface),
    '--saga-primary': safeColor(palette.primary, FALLBACK_PALETTE.primary),
    '--saga-accent': safeColor(palette.accent, FALLBACK_PALETTE.accent),
    '--saga-text': safeColor(palette.text, FALLBACK_PALETTE.text),
  }
}

/** Shared `view-transition-name` between the saga card and the story header. */
export function sagaTransitionName(sagaId: string): string {
  return `saga-${sagaId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

export function formatMetric(metric: StageMetric): string {
  switch (metric.unit) {
    case 'berries':
      return formatBerries(metric.value)
    case '%':
      return `${formatNumber(metric.value)} %`
    case '/10':
      return `${formatNumber(metric.value)} / 10`
    default:
      return `${formatNumber(metric.value)} ${metric.unit}`
  }
}

/** 0..1 fill for the metric meter. */
export function metricRatio(metric: StageMetric, stages: SagaStage[], totalDistanceNm: number): number {
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  switch (metric.key) {
    case 'distanceNm':
      return clamp(totalDistanceNm > 0 ? metric.value / totalDistanceNm : 0)
    case 'crewMorale':
      return clamp(metric.value / 100)
    case 'marineThreat':
      return clamp(metric.value / 10)
    case 'bountyPool': {
      const max = Math.max(...stages.map((stage) => stage.metrics.find((m) => m.key === 'bountyPool')?.value ?? 0))
      return clamp(max > 0 ? metric.value / max : 0)
    }
  }
}

/** SVG path through the islands, in travel order. */
export function routePath(stages: SagaStage[]): string {
  return stages.map((stage, index) => `${index === 0 ? 'M' : 'L'} ${stage.island.x} ${stage.island.y}`).join(' ')
}

/** Fraction (0..1) of the whole route already sailed when `activeIndex` is the current stage. */
export function routeFraction(stages: SagaStage[], activeIndex: number): number {
  let total = 0
  let sailed = 0
  for (let index = 1; index < stages.length; index++) {
    const from = stages[index - 1].island
    const to = stages[index].island
    const length = Math.hypot(to.x - from.x, to.y - from.y)
    total += length
    if (index <= activeIndex) sailed += length
  }
  return total > 0 ? sailed / total : 0
}
