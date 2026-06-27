'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Reveals its children when scrolled into view (once). Honors reduced-motion via CSS.
 * - variant "rise" (default): subtle fade + lift, for text blocks.
 * - variant "mask": the frame wipes open top-to-bottom, for imagery.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'rise',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: 'rise' | 'mask'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Mask variant clips an INNER wrapper, never the observed element itself:
  // a clip-path of inset(... 100% ...) zeroes the element's IntersectionObserver
  // rect, so observing the clipped node would deadlock (it never reports
  // intersecting → .is-visible is never added → it stays clipped forever).
  if (variant === 'mask') {
    return (
      <div
        ref={ref}
        className={`reveal-mask ${visible ? 'is-visible' : ''} ${className}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="reveal-mask__inner">{children}</div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
