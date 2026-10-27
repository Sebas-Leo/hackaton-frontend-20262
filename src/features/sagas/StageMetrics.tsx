import type { SagaStage, SagaStory } from '../../types/api'
import { formatMetric, metricRatio } from './saga-utils'

/** Metrics of the ACTIVE stage only: they are derived from the same index that moves the ship. */
export function StageMetrics({ story, stage }: { story: SagaStory; stage: SagaStage }) {
  return (
    <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-2 lg:gap-3 lg:text-sm">
      {stage.metrics.map((metric) => (
        <div key={metric.key} className="rounded-lg bg-[var(--saga-surface)] p-2 lg:p-3">
          <dt className="opacity-75">{metric.label}</dt>
          <dd className="font-mono font-semibold">{formatMetric(metric)}</dd>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/20 max-sm:hidden" aria-hidden="true">
            <div
              className="saga-meter-fill h-full rounded-full bg-[var(--saga-primary)]"
              style={{ width: `${metricRatio(metric, story.stages, story.saga.totalDistanceNm) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </dl>
  )
}
