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
    <figure className="mb-6 break-inside-avoid rounded-card bg-white p-6 shadow-soft ring-1 ring-taupe/50">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-sand ${avatarColor(r.name)}`}
        >
          {r.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <figcaption className="font-semibold leading-tight">{r.name}</figcaption>
          {r.badge && <p className="truncate text-xs text-espresso/50">{r.badge}</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Stars rating={r.rating} />
        <span className="text-xs text-espresso/50">{r.date}</span>
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed text-espresso/80">{r.text}</blockquote>
      {r.photos && r.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {r.photos.slice(0, 3).map((p) => (
            <div key={p} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-taupe/50">
              <Image src={p} alt="" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
      {r.response && (
        <div className="mt-4 rounded-xl bg-sand/70 p-3">
          <p className="text-xs font-semibold text-espresso/80">Response from Waena Inn</p>
          <p className="mt-1 text-xs leading-relaxed text-espresso/70">{r.response}</p>
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
