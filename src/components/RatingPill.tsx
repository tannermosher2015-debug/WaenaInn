export function RatingPill({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sand/95 px-3 py-1 text-xs font-medium shadow-soft">
      <span aria-hidden>★</span>{rating.toFixed(2)}
      {reviews ? <span className="text-espresso/60">({reviews})</span> : null}
    </span>
  )
}
