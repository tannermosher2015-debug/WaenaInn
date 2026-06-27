/**
 * Waena = "center." A fine crosshair-in-circle mark used as the brand's
 * signature device — in the wordmark, as section dividers, and in the footer.
 */
export function CenterMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth="1"
    >
      <circle cx="12" cy="12" r="6.5" />
      <line x1="12" y1="0.5" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="23.5" />
      <line x1="0.5" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="23.5" y2="12" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}
