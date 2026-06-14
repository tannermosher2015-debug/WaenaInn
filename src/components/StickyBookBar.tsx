/** Mobile-only fixed bottom bar that keeps the booking CTA one tap away. Hidden on lg+ (the sticky aside covers it there). */
export function StickyBookBar({ price }: { price: number }) {
  return (
    <>
      {/* in-flow spacer so the bar never covers page content on mobile */}
      <div aria-hidden className="h-20 lg:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-taupe/60 bg-sand/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <p className="text-sm">
            <span className="text-lg font-semibold text-clay">${price}</span>
            <span className="text-espresso/60"> / night</span>
          </p>
          <a
            href="#book"
            className="rounded-full bg-clay px-7 py-2.5 text-sm font-medium text-sand transition hover:brightness-110"
          >
            Request to book
          </a>
        </div>
      </div>
    </>
  )
}
