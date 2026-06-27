import Image from 'next/image'
import { Stars } from './Stars'

export interface Review {
  name: string
  rating: number
  date: string
  badge?: string
  text: string
  response?: string
  photos?: string[]
}

const AVATAR_COLORS = ['bg-clay', 'bg-palm', 'bg-espresso']

function avatarColor(name: string): string {
  let sum = 0
  for (const ch of name) sum += ch.charCodeAt(0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="mb-6 break-inside-avoid rounded-card bg-paper p-7 ring-1 ring-line">
      <Stars rating={r.rating} />
      <blockquote className="mt-4 font-display text-lg font-normal leading-relaxed text-espresso/90">
        “{r.text}”
      </blockquote>
      {r.photos && r.photos.length > 0 && (
        <div className="mt-5 flex gap-2">
          {r.photos.slice(0, 3).map((p) => (
            <div key={p} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card ring-1 ring-line">
              <Image src={p} alt="" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <span
          aria-hidden
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-sand ${avatarColor(r.name)}`}
        >
          {r.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="font-medium leading-tight">{r.name}</p>
          <p className="truncate text-xs text-muted">
            {r.badge ? `${r.badge} · ` : ''}
            {r.date}
          </p>
        </div>
      </figcaption>
      {r.response && (
        <div className="mt-5 border-l-2 border-clay/40 pl-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-espresso/70">Response from Waena Inn</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.response}</p>
        </div>
      )}
    </figure>
  )
}

/** Masonry grid of guest reviews. */
export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {reviews.map((r) => (
        <ReviewCard key={r.name} r={r} />
      ))}
    </div>
  )
}
