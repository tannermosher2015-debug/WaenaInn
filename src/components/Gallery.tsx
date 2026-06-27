'use client'
import Image from 'next/image'
import { useState } from 'react'
import { Reveal } from './Reveal'

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <Reveal variant="mask">
        <div className="film-warm relative aspect-[16/10] overflow-hidden rounded-card ring-1 ring-line">
          <Image src={photos[active]} alt={alt} fill sizes="(max-width:1024px) 100vw, 66vw" className="film object-cover" priority />
        </div>
      </Reveal>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button key={p} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
              className={`film-warm relative h-20 w-28 shrink-0 overflow-hidden rounded-card ring-1 transition ${i === active ? 'ring-2 ring-clay' : 'ring-line hover:ring-espresso/40'}`}>
              <Image src={p} alt="" fill sizes="112px" className="film object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
