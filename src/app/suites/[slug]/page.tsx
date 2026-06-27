import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSuites, getSuite } from '@/lib/suites'
import { Section } from '@/components/Section'
import { Gallery } from '@/components/Gallery'
import { AmenityList } from '@/components/AmenityList'
import { RatingPill } from '@/components/RatingPill'
import { BookingWidget } from '@/components/BookingWidget'
import { StickyBookBar } from '@/components/StickyBookBar'
import { JsonLd } from '@/components/JsonLd'
import { Reviews } from '@/components/Reviews'
import { SITE } from '@/lib/site'
import { getSiteContent } from '@/lib/siteContent'

const TRUST = [
  'Self check-in, any hour',
  'Free on-site parking',
  'Fast Wi-Fi & mini kitchen',
  'Kamaʻāina host — fast replies',
]

export async function generateStaticParams() {
  return getAllSuites().map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getSuite(slug)
  if (!s) return {}
  const description = `${s.name} — sleeps up to ${s.maxGuests} in central Wailuku, Maui. Self check-in, free parking, fast Wi-Fi. From $${s.pricePerNight}/night.`
  const url = `/suites/${s.slug}`
  return {
    title: s.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: s.name,
      description,
      url,
      images: [{ url: s.photos[0], alt: s.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: s.name,
      description,
      images: [s.photos[0]],
    },
  }
}

export default async function SuiteDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const suite = getSuite(slug)
  if (!suite) notFound()
  const reviews = getSiteContent().testimonials
  const ldData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: suite.name,
    image: `${SITE.url}${suite.photos[0]}`,
    address: SITE.address,
    priceRange: `$${suite.pricePerNight}`,
  }
  if (suite.reviewCount > 0) {
    ldData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: suite.rating,
      reviewCount: suite.reviewCount,
    }
  }
  return (
    <>
      <JsonLd data={ldData} />
      <Section className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div className="min-w-0">
        <Link href="/suites" className="link-underline mb-6 inline-flex items-center gap-2 text-sm text-muted">
          <span aria-hidden>←</span> All suites
        </Link>
        <Gallery photos={suite.photos} alt={suite.name} />
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="display text-[2rem] leading-tight sm:text-[2.75rem]">{suite.name}</h1>
            <RatingPill rating={suite.rating} reviews={suite.reviewCount} />
          </div>
          <p className="mt-3 text-muted">Up to {suite.maxGuests} guests · {suite.bedrooms} bedroom · {suite.bathrooms} bath</p>
          <p className="mt-7 max-w-2xl whitespace-pre-line text-[1.05rem] leading-relaxed text-espresso/80">{suite.description}</p>

          <div className="mt-12 flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-clay" />
            <span className="eyebrow">Amenities</span>
          </div>
          <div className="mt-5"><AmenityList amenities={suite.amenities} /></div>

          {reviews.length > 0 && (
            <div className="mt-14">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 bg-clay" />
                  <span className="eyebrow">What guests say</span>
                </div>
                <a href={SITE.googleUrl} target="_blank" rel="noopener noreferrer" className="link-underline shrink-0 text-sm font-medium text-clay">
                  All reviews →
                </a>
              </div>
              <div className="mt-6"><Reviews reviews={reviews.slice(0, 2)} /></div>
            </div>
          )}
        </div>
      </div>
      <aside id="book" className="min-w-0 scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
        <BookingWidget suite={suite} />
        <ul className="mt-5 space-y-2.5 px-1 text-xs text-muted">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span aria-hidden className="text-clay">—</span>
              {t}
            </li>
          ))}
        </ul>
      </aside>
    </Section>
    <StickyBookBar price={suite.pricePerNight} />
    </>
  )
}
