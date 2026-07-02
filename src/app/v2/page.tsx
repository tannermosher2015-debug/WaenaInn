import { getAllSuites } from '@/lib/suites'
import { HeroFramed } from '@/components/HeroFramed'
import { HomeSections } from '@/components/HomeSections'

// Internal design sample — keep it out of the index / sitemap.
export const metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
}

export default function HomeV2() {
  const suites = getAllSuites()
  const featured = suites.find((s) => s.featured) ?? suites[0]
  const avg = suites.length ? suites.reduce((a, s) => a + s.rating, 0) / suites.length : 0
  const reviewCount = suites.reduce((a, s) => a + (s.reviewCount ?? 0), 0)

  const unitLabel = (featured?.slug ?? '').replace(/^unit-/, 'Unit ')

  return (
    <>
      <HeroFramed
        suiteLabel={unitLabel || 'Featured suite'}
        suiteSub={`Maui private suite · sleeps ${featured?.maxGuests ?? 2}`}
        pricePerNight={featured?.pricePerNight ?? 200}
        suiteMaxGuests={featured?.maxGuests ?? 2}
        avg={avg}
        reviewCount={reviewCount}
      />
      <HomeSections />
    </>
  )
}
