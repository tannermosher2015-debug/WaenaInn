import Image from 'next/image'
import Link from 'next/link'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'
import { Section, SectionHeader } from '@/components/Section'
import { SuiteCard } from '@/components/SuiteCard'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { HeroVideo } from '@/components/HeroVideo'
import { HeroSearch } from '@/components/HeroSearch'
import { Reviews } from '@/components/Reviews'
import { Stars } from '@/components/Stars'
import { Faq } from '@/components/Faq'
import { JsonLd } from '@/components/JsonLd'
import { Botanical } from '@/components/Botanical'
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

export default function Home() {
  const suites = getAllSuites()
  const featured = suites.filter((s) => s.featured).slice(0, 3)
  const content = getSiteContent()
  const reviews = content.testimonials
  const avg = suites.length ? suites.reduce((a, s) => a + s.rating, 0) / suites.length : 0
  const maxGuests = Math.max(6, ...suites.map((s) => s.maxGuests))
  const mosaic = suites.slice(0, 5)
  const ethosPhoto = suites[1]?.photos?.[0] ?? suites[0]?.photos?.[0]

  const businessLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    image: `${SITE.url}/hero-maui.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.streetAddress,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
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

      {/* ===== Hero — immersive Maui video ===== */}
      <section className="relative isolate overflow-hidden">
        <HeroVideo src="/maui-hero.mp4" poster="/maui-hero-poster.jpg" className="absolute inset-0 -z-10" />
        {/* soft warm scrim — keeps the top bright, grounds text at the base */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso/75 via-espresso/20 to-transparent"
        />
        <div className="container-page relative flex min-h-[88vh] flex-col justify-end pb-16 pt-28 text-paper sm:pb-20">
          <Reveal>
            <div className="flex items-center gap-3">
              <Botanical variant="sprig" className="h-5 w-5 text-butter" />
              <span className="eyebrow !text-paper/85">Wailuku · Maui, Hawaiʻi</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="display mt-5 max-w-3xl text-[2.9rem] leading-[1.0] sm:text-[4.5rem] sm:leading-[0.96] lg:text-[5.5rem]">
              The <em className="font-normal italic text-butter">center</em> of Maui.
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/90">
              A little inn in the heart of the island — kamaʻāina-hosted suites made for slow Maui
              mornings, easy island days, and a warm welcome home.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button href="/suites">Explore the suites</Button>
              <Link
                href="/about"
                className="link-underline inline-flex items-center gap-2 text-sm font-medium text-paper"
              >
                Read our story <span aria-hidden className="text-butter">→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={290}>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-paper/90">
              {avg > 0 && <span>★ {avg.toFixed(1)} guest rating</span>}
              <span aria-hidden className="text-paper/50">·</span>
              <span>{suites.length} private suites</span>
              <span aria-hidden className="text-paper/40">·</span>
              <span>Kamaʻāina-owned</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Soft availability search — present, but not the headline ===== */}
      <section className="border-y border-line bg-sagetint/50">
        <div className="container-page py-7 sm:py-9">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="flex items-center gap-3">
              <Botanical variant="bloom" className="h-6 w-6 shrink-0 text-clay" />
              <div>
                <p className="eyebrow">Plan your stay</p>
                <p className="font-display text-xl">Check availability</p>
              </div>
            </div>
            <div className="w-full sm:max-w-2xl sm:flex-1">
              <HeroSearch maxGuests={maxGuests} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Ethos / philosophy ===== */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
          <Reveal variant="mask" className="order-2 lg:order-1">
            <div className="film-warm relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-t-[13rem] ring-1 ring-line">
              {ethosPhoto && (
                <Image
                  src={ethosPhoto}
                  alt="Inside a Waena Inn suite in Wailuku"
                  fill
                  sizes="(max-width:1024px) 80vw, 38vw"
                  className="film object-cover"
                />
              )}
            </div>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <div className="flex items-center gap-3">
              <Botanical variant="sprig" className="h-5 w-5 text-palm" />
              <span className="eyebrow">The philosophy</span>
            </div>
            <h2 className="display mt-5 text-[2.4rem] leading-[1.06] sm:text-[3.1rem]">
              Waena means <span className="italic text-clay">“center.”</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-espresso/85">{content.about.intro}</p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">{content.about.body[0]}</p>
            <Link
              href="/about"
              className="link-underline mt-8 inline-flex items-center gap-2 font-medium text-espresso"
            >
              Our story <span aria-hidden className="text-clay">→</span>
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* ===== Why Waena Inn ===== */}
      <Section className="!pt-0">
        <SectionHeader index="01" eyebrow="Why Waena Inn" title="Simple, sincere, central" />
        <div className="grid md:grid-cols-3 md:divide-x md:divide-line">
          {WHY.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 100}
              className="border-t border-line pt-8 first:border-t-0 first:pt-0 md:border-t-0 md:pt-1 md:px-10 md:first:pl-0 md:last:pr-0"
            >
              <span className="index-num text-xl">0{i + 1}</span>
              <h3 className="display mt-4 text-xl sm:text-2xl">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== Featured suites ===== */}
      <Section className="!pt-0">
        <SectionHeader
          index="02"
          eyebrow="Accommodation"
          title="Featured suites"
          aside={
            <Link
              href="/suites"
              className="link-underline inline-flex items-center gap-2 text-sm font-medium text-espresso"
            >
              All {suites.length} suites <span aria-hidden className="text-clay">→</span>
            </Link>
          }
        />
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <SuiteCard suite={s} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== Gallery mosaic ===== */}
      {mosaic.length >= 5 && (
        <Section className="!pt-0">
          <Reveal className="mb-6 flex items-center gap-3">
            <Botanical variant="sprig" className="h-5 w-5 text-palm" />
            <span className="eyebrow">A look inside</span>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:h-[480px] md:grid-cols-4 md:grid-rows-2">
            <Reveal
              variant="mask"
              className="col-span-2 row-span-2 aspect-square overflow-hidden rounded-card md:aspect-auto md:h-full"
            >
              <div className="film-warm relative h-full w-full">
                <Image
                  src={mosaic[0].photos[0]}
                  alt={mosaic[0].name}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="film object-cover transition duration-700 hover:scale-105"
                />
              </div>
            </Reveal>
            {mosaic.slice(1, 5).map((s, i) => (
              <Reveal
                key={s.slug}
                variant="mask"
                delay={(i + 1) * 80}
                className="aspect-square overflow-hidden rounded-card"
              >
                <div className="film-warm relative h-full w-full">
                  <Image
                    src={s.photos[0]}
                    alt={s.name}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="film object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ===== Location — soft pastel interlude ===== */}
      <section className="bg-sagetint/60">
        <div className="container-page py-16 sm:py-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <Botanical variant="sprig" className="h-5 w-5 text-palm" />
              <span className="eyebrow">The location</span>
            </div>
            <h2 className="display mt-5 max-w-2xl text-[2.2rem] leading-[1.05] sm:text-[3.1rem]">
              Minutes from everything that matters.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:divide-x sm:divide-espresso/10">
            {NEARBY.map(([time, place], i) => (
              <Reveal key={place} delay={i * 80} className="sm:px-8 sm:first:pl-0">
                <p className="display text-4xl text-clay sm:text-5xl">{time}</p>
                <p className="mt-2 text-sm text-muted">{place}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Guest reviews ===== */}
      {reviews.length > 0 && (
        <Section>
          <SectionHeader
            index="03"
            eyebrow="Reviews from Google"
            title="Loved by guests"
            aside={
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <Stars rating={5} className="text-base" />
                <a
                  href={SITE.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-sm font-medium text-espresso"
                >
                  Read all on Google →
                </a>
              </div>
            }
          />
          <Reveal>
            <Reviews reviews={reviews} />
          </Reveal>
        </Section>
      )}

      {/* ===== FAQ ===== */}
      <Section className="!pt-0">
        <SectionHeader index="04" eyebrow="Good to know" title="Booking questions, answered" />
        <Reveal>
          <Faq />
        </Reveal>
      </Section>

      {/* ===== Closing — warm, light send-off ===== */}
      <section className="relative isolate overflow-hidden bg-blush/50">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Botanical
            variant="leaf"
            className="absolute -left-10 bottom-0 h-72 w-72 -rotate-12 text-palm/15"
          />
          <Botanical
            variant="leaf"
            className="absolute -right-10 top-4 h-64 w-64 rotate-[200deg] text-clay/10"
          />
        </div>
        <div className="container-page py-20 text-center sm:py-28">
          <Reveal>
            <Botanical variant="bloom" className="mx-auto h-9 w-9 text-clay" />
            <p className="eyebrow mt-6">Your Maui home base awaits</p>
            <h2 className="display mx-auto mt-5 max-w-3xl text-[2.5rem] leading-[1.04] sm:text-[4rem]">
              Stay central. Stay comfortable.
              <br />
              Stay with <span className="italic text-clay">aloha.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              A private suite in the heart of Wailuku — minutes from the airport, Iao Valley, and Maui’s best beaches.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button href="/suites">Reserve a stay</Button>
              <Link
                href="/contact"
                className="link-underline inline-flex items-center gap-2 self-center text-sm font-medium text-espresso"
              >
                Say aloha <span aria-hidden className="text-clay">→</span>
              </Link>
            </div>
            <p className="mt-8 text-sm text-muted">
              ★ {avg.toFixed(1)} guest rating · {suites.length} private suites · 8 min to OGG · Self check-in 24/7
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
