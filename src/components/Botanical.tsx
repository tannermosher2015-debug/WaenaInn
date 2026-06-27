/**
 * Delicate botanical line art — the boutique signature. Fine single-weight
 * strokes, inherits `currentColor`. Use as eyebrow accents, dividers, and
 * faint section ornaments. Variants: a veined leaf, a little sprig, a bloom.
 */
type Variant = 'leaf' | 'sprig' | 'bloom'

export function Botanical({
  variant = 'sprig',
  className = '',
}: {
  variant?: Variant
  className?: string
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }

  if (variant === 'leaf') {
    return (
      <svg viewBox="0 0 40 56" {...common}>
        <path d="M20 54C20 40 8 31 8 17 8 9 14 2 20 2c6 0 12 7 12 15 0 14-12 23-12 37Z" />
        <path d="M20 50 20 9" />
        <path d="M20 40c-4-3-7-5-11-7M20 40c4-3 7-5 11-7M20 30c-3-2-6-4-9-6M20 30c3-2 6-4 9-6M20 21c-2-2-4-3-7-4M20 21c2-2 4-3 7-4" />
      </svg>
    )
  }

  if (variant === 'bloom') {
    return (
      <svg viewBox="0 0 48 48" {...common}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M24 24C24 14 28 8 24 4 20 8 24 14 24 24Z"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="2.4" />
      </svg>
    )
  }

  // sprig — a slender stem with paired leaflets
  return (
    <svg viewBox="0 0 48 48" {...common}>
      <path d="M24 46C24 33 24 18 24 5" />
      <path d="M24 34c-7-1-11-6-12-13 7 1 11 6 12 13ZM24 27c7-1 11-6 12-13-7 1-11 6-12 13ZM24 19c-6-1-9-5-10-10 6 1 9 5 10 10Z" />
    </svg>
  )
}
