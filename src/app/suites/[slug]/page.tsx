import { notFound } from 'next/navigation'
import { getAllSuites, getSuite } from '@/lib/suites'
import { Section } from '@/components/Section'
import { Gallery } from '@/components/Gallery'
import { AmenityList } from '@/components/AmenityList'
import { RatingPill } from '@/components/RatingPill'
import { Button } from '@/components/Button'
import { JsonLd } from '@/components/JsonLd'
import { SITE } from '@/lib/site'

export async function generateStaticParams() {
  return getAllSuites().map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getSuite(slug)
  return s ? { title: s.name, description: s.summary } : {}
}

export default async function SuiteDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const suite = getSuite(slug)
  if (!suite) notFound()
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
      <div>
        <Gallery photos={suite.photos} alt={suite.name} />
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{suite.name}</h1>
            <RatingPill rating={suite.rating} reviews={suite.reviewCount} />
          </div>
          <p className="mt-2 text-espresso/60">Up to {suite.maxGuests} guests · {suite.bedrooms} bedroom · {suite.bathrooms} bath</p>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-espresso/80">{suite.description}</p>
          <h2 className="mt-10 text-xl font-semibold">Amenities</h2>
          <div className="mt-4"><AmenityList amenities={suite.amenities} /></div>
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-taupe/50">
          <p><span className="text-2xl font-semibold text-clay">${suite.pricePerNight}</span><span className="text-espresso/60"> / night</span></p>
          {/* Full booking widget arrives in the booking/payments plan; for now a clear CTA */}
          <Button href="/contact" className="mt-5 w-full">Request to book</Button>
          <p className="mt-3 text-center text-xs text-espresso/50">Dates subject to host confirmation.</p>
        </div>
      </aside>
    </Section>
    </>
  )
}
