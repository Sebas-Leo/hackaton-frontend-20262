import { useId } from 'react'
import type { SagaStory } from '../../types/api'

export function SagaMap({ story, active, goTo }: { story: SagaStory; active: number; goTo: (index: number) => void }) {
  const patternId = useId().replace(/:/g, '')
  const { width, height } = story.map
  const stages = story.stages
  const current = stages[active]
  const points = stages.map((stage) => `${stage.island.x},${stage.island.y}`)
  const scale = Math.max(width, height) / 1000
  const padding = 35 * scale
  return <div className="saga-map">
    <svg viewBox={`${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`} role="group" aria-label={`Mapa de ${story.saga.title}. Isla actual: ${current.island.name}`}>
      <defs><pattern id={patternId} width={width / 12} height={height / 6} patternUnits="userSpaceOnUse"><path d={`M ${width / 12} 0 L 0 0 0 ${height / 6}`} fill="none" stroke="currentColor" strokeWidth={scale} /></pattern></defs>
      <rect width={width} height={height} fill={`url(#${patternId})`} className="saga-map-grid" />
      <polyline points={points.join(' ')} fill="none" className="saga-map-future" strokeWidth={2 * scale} strokeDasharray={`${7 * scale} ${9 * scale}`} />
      {active > 0 && <polyline points={points.slice(0, active + 1).join(' ')} fill="none" className="saga-map-travelled" strokeWidth={4 * scale} strokeLinejoin="round" strokeLinecap="round" />}
      {stages.map((stage, index) => <g key={stage.id} role="button" tabIndex={0} aria-label={`Ir a etapa ${index + 1}: ${stage.island.name}`} aria-current={index === active ? 'step' : undefined} className={`saga-island ${index <= active ? 'is-visited' : ''}`} onClick={() => goTo(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); goTo(index) } }}>
        <title>{stage.island.name} · {stage.title}</title>
        <circle cx={stage.island.x} cy={stage.island.y} r={24 * scale} fill="transparent" />
        <circle cx={stage.island.x} cy={stage.island.y} r={(index === active ? 12 : 7) * scale} className="saga-map-dot" />
        <text x={stage.island.x} y={stage.island.y + 34 * scale} fontSize={20 * scale} textAnchor="middle" className="saga-map-label">{index + 1}</text>
      </g>)}
      <g transform={`translate(${current.island.x} ${current.island.y}) scale(${scale})`} className="saga-ship" aria-hidden="true" pointerEvents="none">
        <circle r="25" className="saga-ship-halo" />
        <path d="M-17 5H17L10 16H-9Z M0-24V4 M-3-21L-3 0H-17Z M4-18L17 0H4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
    <div className="saga-map-caption"><span>ISLA ACTUAL</span><strong>{current.island.name}</strong></div>
  </div>
}
