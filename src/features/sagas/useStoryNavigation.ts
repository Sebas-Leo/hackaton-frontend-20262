import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { SagaStage } from '../../types/api'

/** The URL selects a chapter; scrolling replaces the current entry instead of filling the history. */
export function useStoryNavigation(stages: SagaStage[]) {
  const [params, setParams] = useSearchParams()
  const requested = params.get('stage')
  const resolve = (slug: string | null) => Math.max(0, stages.findIndex((stage) => stage.slug === slug))
  const [active, setActive] = useState(() => resolve(requested))
  const activeRef = useRef(active)
  const sections = useRef<(HTMLElement | null)[]>([])
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const ready = useRef(false)
  const lastWritten = useRef<string | null>(null)
  const searchRef = useRef(params.toString())
  const search = params.toString()
  useLayoutEffect(() => { searchRef.current = search }, [search])

  const publish = useCallback((index: number) => {
    activeRef.current = index
    setActive(index)
    const next = new URLSearchParams(searchRef.current)
    const slug = stages[index].slug
    if (next.get('stage') === slug) return
    next.set('stage', slug)
    lastWritten.current = slug
    searchRef.current = next.toString()
    setParams(next, { replace: true, preventScrollReset: true })
  }, [stages, setParams])

  // Measure the existing application header rather than assuming its desktop height on mobile.
  useLayoutEffect(() => {
    const appHeader = document.querySelector('body header')
    const measure = () => {
      const headerHeight = appHeader?.getBoundingClientRect().height ?? 0
      const mobile = window.matchMedia('(max-width: 899px)').matches
      root.current?.style.setProperty('--app-header-height', `${headerHeight}px`)
      root.current?.style.setProperty('--mobile-panel-height', `${mobile ? panel.current?.getBoundingClientRect().height ?? 0 : 0}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (appHeader) observer.observe(appHeader)
    if (panel.current) observer.observe(panel.current)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  // Direct links and browser history scroll to the requested chapter. Self-written scroll updates do not.
  useLayoutEffect(() => {
    if (lastWritten.current === requested && requested !== null) {
      lastWritten.current = null
      return
    }
    ready.current = false
    const index = Math.max(0, stages.findIndex((stage) => stage.slug === requested))
    const frame = requestAnimationFrame(() => {
      if (requested) sections.current[index]?.scrollIntoView({ block: 'start', behavior: 'auto' })
      publish(index) // Missing/invalid slugs are canonicalized to the first chapter.
      ready.current = true
    })
    return () => cancelAnimationFrame(frame)
  }, [requested, stages, publish])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (!ready.current || !root.current) return
      const style = getComputedStyle(root.current)
      const obstruction = parseFloat(style.getPropertyValue('--app-header-height')) + parseFloat(style.getPropertyValue('--mobile-panel-height')) + 24
      const readingLine = obstruction + Math.max(0, (window.innerHeight - obstruction) * 0.2)
      let index = 0
      sections.current.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= readingLine) index = i })
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) index = stages.length - 1
      if (index !== activeRef.current) publish(index)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame) }
  }, [stages, publish])

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(stages.length - 1, index))
    sections.current[next]?.scrollIntoView({ block: 'start', behavior: 'auto' })
    sections.current[next]?.focus({ preventScroll: true })
    publish(next)
  }

  return { active, sections, root, panel, goTo }
}
