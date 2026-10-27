import { useEffect, useRef } from 'react'

const ROOT_MARGIN = '400px'

/**
 * Calls `onVisible` while the returned element is within ROOT_MARGIN of the viewport.
 *
 * A fresh IntersectionObserver reports the current intersection as soon as it starts observing.
 * `enabled` goes false while a page loads and true again afterwards, which recreates the observer:
 * if the new items still do not push the sentinel out of view (short page, tall screen),
 * the next page is requested without waiting for a scroll.
 */
export function useInfiniteSentinel(onVisible: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sentinelRef.current
    if (!enabled || !element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onVisible()
      },
      { rootMargin: ROOT_MARGIN },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, onVisible])

  return sentinelRef
}
