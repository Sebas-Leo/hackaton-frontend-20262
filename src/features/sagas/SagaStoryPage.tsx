import { Link, useParams } from 'react-router'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import { formatNumber } from '../../lib/format'
import type { SagaStory } from '../../types/api'
import { SagaError } from './SagaError'
import { SagaMap } from './SagaMap'
import { canTransition, paletteStyle, titleTransitionName, useReducedMotion } from './saga-utils'
import { useStoryNavigation } from './useStoryNavigation'
import './sagas.css'

export function SagaStoryPage() {
  const { id = '' } = useParams()
  const story = useApi((signal) => apiRequest<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, { signal }), [id])
  if (story.status === 'loading') return <section className="saga-message"><Spinner label="Recuperando la historia del Poneglyph…" /></section>
  if (story.status === 'error') return <SagaError error={story.error} retry={story.reload} />
  if (story.data.stages.length === 0) return <section className="space-y-4"><Link to="/sagas">← Volver a las sagas</Link><EmptyState title="Esta saga aún no tiene etapas">Vuelve al resumen para elegir otra historia.</EmptyState></section>
  return <StoryExperience key={id} story={story.data} />
}

function StoryExperience({ story }: { story: SagaStory }) {
  const stages = story.stages
  const reduced = useReducedMotion()
  const { active, root, panel, sections, goTo } = useStoryNavigation(stages)
  const stage = stages[active]
  const progress = Math.round(((active + 1) / stages.length) * 100)
  return <div className="saga-story" ref={root} style={paletteStyle(stage.palette)}>
    <header className="saga-story-heading">
      <Link to="/sagas" viewTransition={canTransition(reduced)} className="saga-back">← Todas las sagas</Link>
      <p className="saga-kicker">PONEGLYPH · SAGA {story.saga.order}</p>
      <h1 style={{ viewTransitionName: titleTransitionName(story.saga.id) }}>{story.saga.title}</h1>
      <p className="saga-subtitle">{story.saga.subtitle}</p>
      <p className="saga-intro">{story.saga.intro}</p>
      <p className="saga-reading-help">Desplázate para avanzar. También puedes elegir una etapa en el mapa o usar Anterior y Siguiente.</p>
      <a className="saga-skip" href="#saga-chapters">Ir a los capítulos</a>
    </header>
    <div className="saga-story-layout">
      <aside className="saga-compass" ref={panel} aria-label="Mapa y métricas de la etapa activa">
        <div className="saga-compass-top"><span className="saga-kicker">LOG POSE · ETAPA {active + 1} / {stages.length}</span><span className="saga-progress-value">{progress}%</span></div>
        <progress value={active + 1} max={stages.length} aria-label="Progreso del recorrido" />
        <SagaMap story={story} active={active} goTo={goTo} />
        <dl className="saga-metrics">{stage.metrics.map((metric) => <div key={metric.key}><dt>{metric.label}</dt><dd>{formatNumber(metric.value)} <span>{metric.unit}</span></dd></div>)}</dl>
        <nav className="saga-chapter-controls" aria-label="Navegación entre etapas">
          <button disabled={active === 0} onClick={() => goTo(active - 1)}>← Anterior</button>
          <label><span className="sr-only">Seleccionar etapa</span><select value={active} onChange={(event) => goTo(Number(event.target.value))}>{stages.map((item, index) => <option key={item.id} value={index}>{index + 1}. {item.title}</option>)}</select></label>
          <button disabled={active === stages.length - 1} onClick={() => goTo(active + 1)}>Siguiente →</button>
        </nav>
        <p className="sr-only" aria-live="polite" aria-atomic="true">Etapa {active + 1}: {stage.title}. Isla: {stage.island.name}.</p>
      </aside>
      <div className="saga-chapters" id="saga-chapters">{stages.map((chapter, index) => <section
        key={chapter.id}
        id={`stage-${chapter.slug}`}
        className={`saga-chapter ${active === index ? 'is-active' : ''}`}
        style={paletteStyle(chapter.palette)}
        ref={(element) => { sections.current[index] = element }}
        tabIndex={-1}
        aria-labelledby={`heading-${chapter.id}`}
        aria-current={active === index ? 'step' : undefined}
        onKeyDown={(event) => {
          // Only chapter focus handles arrows; links, selects and other controls keep their normal keys.
          if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return
          const target = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? stages.length - 1 : null
          if (target !== null) { event.preventDefault(); goTo(target) }
        }}>
        <div className="saga-chapter-body"><p className="saga-kicker">ETAPA {String(index + 1).padStart(2, '0')} · {chapter.island.name}</p>
          <h2 id={`heading-${chapter.id}`}>{chapter.title}</h2>
          <div className="saga-narrative">{chapter.narrative.map((paragraph, paragraphIndex) => <p key={`${chapter.id}-${paragraphIndex}`}>{paragraph}</p>)}</div>
          <a className="saga-permalink" href={`?stage=${encodeURIComponent(chapter.slug)}`} onClick={(event) => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); goTo(index) } }}>Enlace a esta etapa ↗</a>
          <p className="saga-chapter-foot">{index === stages.length - 1 ? 'Fin del recorrido' : `Continúa hacia ${stages[index + 1].island.name}`} <span aria-hidden="true">↓</span></p>
        </div>
      </section>)}
        <div className="saga-end"><p>Has recorrido las {stages.length} etapas de esta saga.</p><Link to="/sagas" viewTransition={canTransition(reduced)}>Elegir otra saga →</Link><button onClick={() => goTo(0)}>Volver a la primera etapa</button></div>
      </div>
    </div>
  </div>
}
