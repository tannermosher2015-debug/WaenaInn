export function RatingPill({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-card bg-paper/90 px-3 py-1 text-xs font-medium text-espresso shadow-soft ring-1 ring-line/70 backdrop-blur">
      <span aria-hidden className="text-clay">★</span>{rating.toFixed(2)}
      {reviews ? <span className="text-muted">({reviews})</span> : null}
    </span>
  )
}
