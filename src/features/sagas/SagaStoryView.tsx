import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { formatNumber } from '../../lib/format'
import type { SagaStory } from '../../types/api'
import { SagaMap } from './SagaMap'
import { StageMetrics } from './StageMetrics'
import { paletteVars, sagaTransitionName } from './saga-utils'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const STAGE_PARAM = 'stage'
// How long a programmatic jump may take before scroll-driven detection takes over again.
const JUMP_LOCK_MS = 1500

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

export function SagaStoryView({ story }: { story: SagaStory }) {
  const { saga, stages } = story
  const [searchParams, setSearchParams] = useSearchParams()
  const reducedMotion = usePrefersReducedMotion()

  const indexOfSlug = (slug: string | null) => Math.max(0, stages.findIndex((stage) => stage.slug === slug))

  // Opening /sagas/:id?stage=<slug> starts directly on that stage (unknown slug -> first stage).
  const [activeIndex, setActiveIndex] = useState(() => indexOfSlug(searchParams.get(STAGE_PARAM)))
  const [visible, setVisible] = useState<ReadonlySet<number>>(() => new Set())

  const stageRefs = useRef<(HTMLElement | null)[]>([])
  const jumpTarget = useRef<number | null>(null)
  const jumpTimer = useRef<number | undefined>(undefined)
  const progressRef = useRef<HTMLDivElement>(null)

  const active = stages[activeIndex]

  // Scroll-driven stage detection: the active stage is the one crossing the detection line.
  useEffect(() => {
    const sections = stageRefs.current.filter((section): section is HTMLElement => section !== null)

    // Deep link: jump to the stage from the URL BEFORE observing, so stage 1 never overwrites it.
    const initial = indexOfSlug(new URLSearchParams(window.location.search).get(STAGE_PARAM))
    if (initial > 0) {
      jumpTarget.current = initial
      jumpTimer.current = window.setTimeout(() => {
        jumpTarget.current = null
      }, JUMP_LOCK_MS)
      sections[initial]?.scrollIntoView({ block: 'start' })
    }

    const activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number(entry.target.getAttribute('data-index'))
          // During a keyboard/button jump, ignore the stages we pass through on the way.
          if (jumpTarget.current !== null && index !== jumpTarget.current) continue
          jumpTarget.current = null
          setActiveIndex(index)
        }
      },
      // Detection line at ~60% of the viewport: below the sticky panel on mobile, mid-stage on desktop.
      { rootMargin: '-58% 0px -40% 0px' },
    )

    // Feeds the reveal fallback for browsers without `animation-timeline: view()`.
    const visibleObserver = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((entry) => entry.isIntersecting).map((entry) => Number(entry.target.getAttribute('data-index')))
        if (shown.length > 0) setVisible((prev) => new Set([...prev, ...shown]))
      },
      { threshold: 0.15 },
    )

    sections.forEach((section) => {
      activeObserver.observe(section)
      visibleObserver.observe(section)
    })
    return () => {
      activeObserver.disconnect()
      visibleObserver.disconnect()
      window.clearTimeout(jumpTimer.current)
    }
    // Only the story defines the sections; the slug helper is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages])

  // The URL always names the active stage (replace: scrolling must not flood the history).
  const activeSlug = active.slug
  useEffect(() => {
    if (searchParams.get(STAGE_PARAM) === activeSlug) return
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set(STAGE_PARAM, activeSlug)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [activeSlug, searchParams, setSearchParams])

  // Fallback for the reading progress bar when CSS scroll timelines are not supported.
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current?.style.setProperty('--saga-scroll', String(max > 0 ? window.scrollY / max : 0))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const goToStage = useCallback(
    (index: number) => {
      const target = Math.min(stages.length - 1, Math.max(0, index))
      const section = stageRefs.current[target]
      if (!section) return
      jumpTarget.current = target
      window.clearTimeout(jumpTimer.current)
      jumpTimer.current = window.setTimeout(() => {
        jumpTarget.current = null
      }, JUMP_LOCK_MS)
      setActiveIndex(target)
      section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
      // Move focus with the reader so keyboard and screen-reader users continue from that stage.
      section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
    },
    [stages.length, reducedMotion],
  )

  // Arrow keys move between stages (vertical keys keep scrolling normally).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToStage(activeIndex + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToStage(activeIndex - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, goToStage])

  const distance = active.metrics.find((metric) => metric.key === 'distanceNm')?.value ?? 0

  return (
    <article
      className="saga-root -mx-4 bg-[var(--saga-bg)] px-4 pb-24 text-[var(--saga-text)] sm:mx-0 sm:rounded-2xl sm:px-8"
      style={paletteVars(active.palette)}
    >
      <header className="py-10">
        <Link to="/sagas" viewTransition className="text-sm underline opacity-80 hover:opacity-100">
          ← Todas las sagas
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[var(--saga-accent)]">
          Saga {saga.order} · {saga.stageCount} etapas · {formatNumber(saga.totalDistanceNm)} mn
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl" style={{ viewTransitionName: sagaTransitionName(saga.id) }}>
          {saga.title}
        </h1>
        <p className="mt-1 text-lg opacity-80">{saga.subtitle}</p>
        <p className="mt-4 max-w-2xl leading-relaxed">{saga.intro}</p>
        <p className="mt-4 text-sm opacity-70">Desplázate para zarpar, o usa ← → para saltar entre etapas.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
        {/* Persistent panel: first in the DOM so it stays on top on mobile, right column on desktop. */}
        <aside
          aria-label="Bitácora de navegación"
          className="sticky top-0 z-10 -mx-4 space-y-3 bg-[var(--saga-bg)] px-4 py-3 lg:top-16 lg:order-2 lg:mx-0 lg:h-[calc(100dvh-4rem)] lg:px-0 lg:py-6"
        >
          <div>
            <p className="flex justify-between text-sm" aria-live="polite">
              <span>
                Etapa <strong>{activeIndex + 1}</strong> de {stages.length} · {active.island.name}
              </span>
              <span className="font-mono">
                {formatNumber(distance)} / {formatNumber(saga.totalDistanceNm)} mn
              </span>
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/25" aria-hidden="true">
              <div ref={progressRef} className="saga-progress-bar h-full bg-[var(--saga-primary)]" />
            </div>
          </div>

          <SagaMap story={story} activeIndex={activeIndex} />
          <StageMetrics story={story} stage={active} />

          <nav aria-label="Etapas de la saga" className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToStage(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="rounded-md border border-current/30 px-3 py-1 text-sm disabled:opacity-40"
            >
              ← Anterior
            </button>
            <ol className="flex flex-1 justify-center gap-1.5">
              {stages.map((stage, index) => (
                <li key={stage.id}>
                  <button
                    type="button"
                    onClick={() => goToStage(index)}
                    aria-label={`Etapa ${stage.order}: ${stage.title}`}
                    aria-current={index === activeIndex ? 'step' : undefined}
                    className={`size-3 rounded-full border border-current ${
                      index <= activeIndex ? 'bg-[var(--saga-primary)]' : 'bg-transparent'
                    }`}
                  />
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => goToStage(activeIndex + 1)}
              disabled={activeIndex === stages.length - 1}
              className="rounded-md border border-current/30 px-3 py-1 text-sm disabled:opacity-40"
            >
              Siguiente →
            </button>
          </nav>
        </aside>

        <div className="lg:order-1">
          {stages.map((stage, index) => (
            <section
              key={stage.id}
              ref={(node) => {
                stageRefs.current[index] = node
              }}
              id={`stage-${stage.slug}`}
              data-index={index}
              data-visible={visible.has(index)}
              aria-labelledby={`stage-title-${stage.id}`}
              className="saga-stage flex min-h-[85vh] scroll-mt-[52vh] items-center py-10 lg:scroll-mt-20"
            >
              <div
                className="saga-stage-content w-full rounded-xl bg-[var(--saga-surface)] p-6 text-[var(--saga-text)] shadow-lg"
                style={paletteVars(stage.palette)}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--saga-accent)]">
                  Etapa {stage.order} · {stage.island.name}
                </p>
                <h2 id={`stage-title-${stage.id}`} tabIndex={-1} className="mt-1 text-2xl font-bold outline-none">
                  {stage.title}
                </h2>
                <div className="mt-3 space-y-3 leading-relaxed">
                  {stage.narrative.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
          ))}
          <p className="py-16 text-center text-sm opacity-70">Fin de la travesía · {saga.lastIsland}</p>
        </div>
      </div>
    </article>
  )
}
