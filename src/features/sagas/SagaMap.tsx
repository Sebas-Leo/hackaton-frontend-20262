import type { SagaStory } from '../../types/api'
import { routeFraction, routePath } from './saga-utils'

interface SagaMapProps {
  story: SagaStory
  activeIndex: number
}

/** Grand Line map drawn from the story data: islands, full route, sailed route and the ship. */
export function SagaMap({ story, activeIndex }: SagaMapProps) {
  const { stages, map } = story
  const active = stages[activeIndex]
  const path = routePath(stages)
  const sailed = routeFraction(stages, activeIndex)

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      role="img"
      aria-label={`Mapa del Grand Line: el barco está en ${active.island.name}, etapa ${activeIndex + 1} de ${stages.length}.`}
      className="h-auto max-h-[22vh] w-full rounded-lg lg:max-h-none"
    >
      <rect width={map.width} height={map.height} rx={16} fill="var(--saga-surface)" />

      {/* Full route (dashed) and the part already sailed, drawn with pathLength=1 so the offset is a fraction. */}
      <path
        d={path}
        fill="none"
        stroke="var(--saga-text)"
        strokeOpacity={0.3}
        strokeWidth={4}
        strokeDasharray="10 12"
      />
      <path
        className="saga-route-sailed"
        d={path}
        fill="none"
        stroke="var(--saga-primary)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - sailed}
      />

      {stages.map((stage, index) => {
        const { x, y, name } = stage.island
        const visited = index <= activeIndex
        const labelY = y < 60 ? y + 44 : y - 26
        return (
          <g key={stage.id}>
            {index === activeIndex && (
              <circle className="saga-island-active" cx={x} cy={y} r={16} fill="var(--saga-accent)" opacity={0.6} />
            )}
            <circle
              cx={x}
              cy={y}
              r={index === activeIndex ? 16 : 12}
              fill={visited ? 'var(--saga-primary)' : 'var(--saga-surface)'}
              stroke="var(--saga-text)"
              strokeWidth={3}
            />
            {/* Small screens: only the active island is labeled so the text stays readable. */}
            <text
              className={index === activeIndex ? undefined : 'max-lg:hidden'}
              x={x}
              y={labelY}
              textAnchor="middle"
              fontSize={index === activeIndex ? 30 : 24}
              fontWeight={index === activeIndex ? 700 : 400}
              fill="var(--saga-text)"
              opacity={index === activeIndex ? 1 : 0.7}
            >
              {name}
            </text>
          </g>
        )
      })}

      {/* CSS transform (not the SVG attribute) so the move can transition. */}
      <g className="saga-ship" style={{ transform: `translate(${active.island.x}px, ${active.island.y}px)` }}>
        <g transform="translate(-20 -52)">
          <path d="M20 4 V30" stroke="var(--saga-text)" strokeWidth={3} />
          <path d="M22 6 L38 26 H22 Z" fill="var(--saga-accent)" />
          <path d="M0 30 H40 L33 42 H7 Z" fill="var(--saga-text)" />
        </g>
      </g>
    </svg>
  )
}
