'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

/**
 * Immersive hero background. The poster image renders instantly (the LCP), and
 * the looping Maui video layers on top once it's safe to play. On phones and
 * for reduced-motion / data-saver users we skip the video entirely and keep the
 * poster — no 15MB download, no autoplay where it isn't wanted.
 */
export function HeroVideo({
  src,
  poster,
  className = '',
}: {
  src: string
  poster: string
  className?: string
}) {
  const [play, setPlay] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Defer the decision out of the synchronous effect body (avoids a
    // cascading re-render and keeps SSR output — poster only — stable).
    const raf = requestAnimationFrame(() => {
      const desktop = window.matchMedia('(min-width: 768px)').matches
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData
      if (desktop && !reduced && !saveData) setPlay(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (play) ref.current?.play().catch(() => {})
  }, [play])

  return (
    <div className={className}>
      <Image src={poster} alt="" fill priority sizes="100vw" className="film object-cover" />
      {play && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover transform-gpu [backface-visibility:hidden]"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
