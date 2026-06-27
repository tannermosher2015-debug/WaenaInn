import Image from 'next/image'
import Link from 'next/link'
import type { Suite } from '@/lib/suites.schema'
import { RatingPill } from './RatingPill'

export function SuiteCard({ suite }: { suite: Suite }) {
  return (
    <Link
      href={`/suites/${suite.slug}`}
      className="group block overflow-hidden rounded-card bg-paper ring-1 ring-line transition-all duration-500 hover:ring-espresso/35 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="film-warm relative aspect-[4/3] overflow-hidden">
        <Image
          src={suite.photos[0]}
          alt={suite.name}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="film object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <RatingPill rating={suite.rating} reviews={suite.reviewCount} />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-medium leading-snug">{suite.name}</h3>
          <p className="shrink-0 text-right">
            <span className="font-display text-xl text-clay">${suite.pricePerNight}</span>
            <span className="block text-[0.7rem] uppercase tracking-widest text-muted">/ night</span>
          </p>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          Up to {suite.maxGuests} guests · {suite.bedrooms} BR
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Self check-in · Parking · Wi-Fi
          </span>
          <span aria-hidden className="text-clay transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
