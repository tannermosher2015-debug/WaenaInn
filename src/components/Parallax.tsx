'use client'
import { useEffect, useRef } from 'react'

/**
 * Subtle scroll parallax. Translates its child a few px against the scroll as
 * it passes through the viewport — enough to feel hand-crafted, never showy.
 * Fully disabled under prefers-reduced-motion (handled here and in CSS).
 */
export function Parallax({
  speed = 0.1,
  className = '',
  children,
}: {
  speed?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      if (!vh || vh < 200) {
        el.style.transform = ''
        return
      }
      const r = el.getBoundingClientRect()
      // -1 (entering bottom) → 1 (leaving top), 0 at viewport center.
      // Clamp so a degenerate viewport can never produce a wild transform.
      const progress = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh))
      el.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={ref} data-parallax className={className}>
      {children}
    </div>
  )
}
