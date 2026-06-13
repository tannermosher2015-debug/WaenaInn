import Image from 'next/image'
import Link from 'next/link'
import type { Suite } from '@/lib/suites.schema'
import { RatingPill } from './RatingPill'

export function SuiteCard({ suite }: { suite: Suite }) {
  return (
    <Link href={`/suites/${suite.slug}`} className="group block overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-taupe/50">
      <div className="relative aspect-[4/3]">
        <Image src={suite.photos[0]} alt={suite.name} fill sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><RatingPill rating={suite.rating} reviews={suite.reviewCount} /></div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{suite.name}</h3>
        <p className="mt-1 text-sm text-espresso/60">Up to {suite.maxGuests} guests · {suite.bedrooms} BR</p>
        <p className="mt-3"><span className="text-xl font-semibold text-clay">${suite.pricePerNight}</span>
          <span className="text-sm text-espresso/60"> / night</span></p>
      </div>
    </Link>
  )
}
