/** Gold star rating out of 5. */
export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span
      className={`inline-flex text-amber-400 ${className}`}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden className={i < rating ? '' : 'text-taupe'}>
          ★
        </span>
      ))}
    </span>
  )
}
