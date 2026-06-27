/** Mobile-only fixed bottom bar that keeps the booking CTA one tap away. Hidden on lg+ (the sticky aside covers it there). */
export function StickyBookBar({ price }: { price: number }) {
  return (
    <>
      {/* in-flow spacer so the bar never covers page content on mobile */}
      <div aria-hidden className="h-20 lg:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sand/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-xl text-clay">${price}</span>
            <span className="text-xs uppercase tracking-widest text-muted">/ night</span>
          </p>
          <a
            href="#book"
            className="inline-flex items-center gap-2 rounded-card bg-espresso px-7 py-2.5 text-sm font-medium tracking-wide text-sand transition-colors duration-300 hover:bg-clay"
          >
            Request to book <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </>
  )
}
