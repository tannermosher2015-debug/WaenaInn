'use client'
import Image from 'next/image'
import { useState } from 'react'

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-card shadow-soft">
        <Image src={photos[active]} alt={alt} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" priority />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button key={p} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-2 ${i === active ? 'ring-clay' : 'ring-transparent'}`}>
              <Image src={p} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
