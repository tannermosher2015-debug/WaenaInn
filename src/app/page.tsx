import Image from 'next/image'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'
import { Section } from '@/components/Section'
import { SuiteCard } from '@/components/SuiteCard'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { HeroSearch } from '@/components/HeroSearch'
import { Reviews } from '@/components/Reviews'
import { Stars } from '@/components/Stars'
import { Faq } from '@/components/Faq'
import { JsonLd } from '@/components/JsonLd'
import { getSiteContent } from '@/lib/siteContent'

export const metadata = { alternates: { canonical: '/' } }

const WHY = [
  {
    title: 'In the center of it all',
    body: 'Historic Wailuku Town — 8–10 minutes from Kahului Airport, Maui Memorial, Iao Valley, and some of the island’s best beaches.',
  },
  {
    title: 'Kamaʻāina hospitality',
    body: 'Locally owned and run, grounded in respect, care, and community — with the small touches that make you feel taken care of.',
  },
  {
    title: 'Easy, any hour',
    body: 'Self check-in 24/7, reliable Wi-Fi, and free on-site parking. Built for explorers, remote workers, and traveling medical pros.',
  },
]

const NEARBY: [string, string][] = [
  ['8 min', 'Kahului Airport (OGG)'],
  ['5 min', 'Wailuku Town'],
  ['10 min', 'Iao Valley'],
  ['8 min', 'Maui Memorial'],
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm uppercase tracking-widest text-espresso/50">{children}</p>
}

export default function Home() {
  const suites = getAllSuites()
  const featured = suites.filter((s) => s.featured).slice(0, 3)
  const reviews = getSiteContent().testimonials
  const avg = suites.length ? suites.reduce((a, s) => a + s.rating, 0) / suites.length : 0
  const maxGuests = Math.max(6, ...suites.map((s) => s.maxGuests))
  const mosaic = suites.slice(0, 5)
  const businessLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    image: `${SITE.url}/hero-maui-waves.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wailuku',
      addressRegion: 'HI',
      addressCountry: 'US',
    },
    areaServed: 'Maui, Hawaii',
    priceRange: '$$',
    ...(reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 5,
        reviewCount: reviews.length,
        bestRating: 5,
      },
      review: reviews.map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.name },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.text,
      })),
    }),
  }

  return (
    <>
      <JsonLd data={businessLd} />
      {/* ===== Immersive hero ===== */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-maui-waves.jpg"
            alt="Waves rolling onto a Maui beach at golden hour"
            fill
            priority
            sizes="100vw"
            className="animate-kenburns object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/55 to-espresso/30" />
        </div>
        <div className="container-page flex min-h-[82vh] flex-col justify-end pb-14 pt-28 text-sand">
          {avg > 0 && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sand/15 px-3 py-1 text-xs font-medium ring-1 ring-sand/30 backdrop-blur">
              <span aria-hidden>★</span> {avg.toFixed(1)} guest rating
            </span>
          )}
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-7xl">
            Your center
            <br />
            of Maui.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand/85">
            {SITE.tagline}. Kamaʻāina-hosted private suites in the heart of Wailuku — welcoming you with aloha.
          </p>

          {/* Trust / stat row */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sand/90">
            <span>★ {avg.toFixed(1)} avg rating</span>
            <span className="text-sand/40">·</span>
            <span>{suites.length} private suites</span>
            <span className="text-sand/40">·</span>
            <span>8 min to OGG airport</span>
            <span className="text-sand/40">·</span>
            <span>Kamaʻāina-owned</span>
          </div>

          {/* Date search */}
          <div className="mt-8 max-w-2xl">
            <HeroSearch maxGuests={maxGuests} />
          </div>
        </div>
      </section>

      {/* ===== Why Waena Inn ===== */}
      <Section>
        <Reveal className="mb-10 text-center">
          <Eyebrow>Why Waena Inn</Eyebrow>
          <h2 className="mt-2 text-4xl font-semibold">Simple, sincere, central</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {WHY.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="h-full rounded-card bg-white p-7 shadow-soft ring-1 ring-taupe/50">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso/70">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== Featured suites ===== */}
      <Section className="!pt-0">
        <Reveal className="mb-10 text-center">
          <Eyebrow>Accommodation</Eyebrow>
          <h2 className="mt-2 text-4xl font-semibold">Featured suites</h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <SuiteCard suite={s} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Button href="/suites" variant="ghost">
            Explore all {suites.length} suites
          </Button>
        </Reveal>
      </Section>

      {/* ===== Photo mosaic ===== */}
      {mosaic.length >= 5 && (
        <Section className="!pt-0">
          <Reveal>
            <div className="grid grid-cols-2 gap-3 md:h-[460px] md:grid-cols-4 md:grid-rows-2">
              <div className="relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-card md:aspect-auto">
                <Image
                  src={mosaic[0].photos[0]}
                  alt={mosaic[0].name}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover transition duration-700 hover:scale-105"
                />
              </div>
              {mosaic.slice(1, 5).map((s) => (
                <div key={s.slug} className="relative aspect-square overflow-hidden rounded-card">
                  <Image
                    src={s.photos[0]}
                    alt={s.name}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </Section>
      )}

      {/* ===== Location ===== */}
      <Section className="!pt-0">
        <Reveal>
          <div className="rounded-card bg-white p-8 shadow-soft ring-1 ring-taupe/50">
            <Eyebrow>The location</Eyebrow>
            <h2 className="mt-2 text-3xl font-semibold">Minutes from everything that matters</h2>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {NEARBY.map(([time, place]) => (
                <div key={place}>
                  <p className="text-3xl font-semibold text-clay">{time}</p>
                  <p className="mt-1 text-sm text-espresso/70">{place}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ===== Guest reviews ===== */}
      {reviews.length > 0 && (
        <Section className="!pt-0">
          <Reveal className="mb-10 text-center">
            <Eyebrow>Reviews from Google</Eyebrow>
            <h2 className="mt-2 text-4xl font-semibold">Loved by guests</h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Stars rating={5} className="text-lg" />
              <span className="text-sm text-espresso/60">Recent 5-star stays in Wailuku</span>
            </div>
          </Reveal>
          <Reveal>
            <Reviews reviews={reviews} />
          </Reveal>
          <Reveal className="mt-8 text-center">
            <a
              href={SITE.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-clay hover:underline"
            >
              Read all reviews on Google →
            </a>
          </Reveal>
        </Section>
      )}

      {/* ===== FAQ ===== */}
      <Section className="!pt-0">
        <Reveal className="mb-10 text-center">
          <Eyebrow>Good to know</Eyebrow>
          <h2 className="mt-2 text-4xl font-semibold">Booking questions, answered</h2>
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
      </Section>

      {/* ===== CTA band ===== */}
      <Section className="!pt-0">
        <Reveal>
          <div className="rounded-card bg-espresso px-8 py-16 text-center text-sand">
            <h2 className="text-4xl font-semibold">Stay central. Stay comfortable.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sand/80">
              Stay with aloha. Your Maui home base is waiting.
            </p>
            <div className="mt-8">
              <Button href="/suites">Book a stay</Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
