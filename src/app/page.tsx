import Image from 'next/image'
import Link from 'next/link'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'
import { Section, SectionHeader } from '@/components/Section'
import { SuiteCard } from '@/components/SuiteCard'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { Parallax } from '@/components/Parallax'
import { HeroSearch } from '@/components/HeroSearch'
import { Reviews } from '@/components/Reviews'
import { Stars } from '@/components/Stars'
import { Faq } from '@/components/Faq'
import { JsonLd } from '@/components/JsonLd'
import { CenterMark } from '@/components/CenterMark'
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

      {/* ===== Hero — type-forward editorial on deep material ===== */}
      <section className="relative isolate overflow-hidden bg-ink text-sand">
        {/* faint oversized brand watermark */}
        <CenterMark
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 hidden h-[36rem] w-[36rem] text-sand/[0.04] lg:block"
        />
        <div className="container-page grid items-center gap-10 pb-16 pt-10 sm:gap-12 sm:pb-20 sm:pt-16 lg:min-h-[92vh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
          {/* Type column */}
          <div className="order-2 max-w-xl lg:order-1">
            <Reveal>
              <div className="flex items-center gap-3.5">
                <span className="seal h-9 w-9 text-brasslt">
                  <CenterMark className="h-4 w-4" />
                </span>
                <span aria-hidden className="h-px w-8 bg-brass/60" />
                <span className="eyebrow !text-brasslt">Wailuku · Maui, Hawaiʻi</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="display mt-7 text-[2.75rem] leading-[0.96] sm:mt-8 sm:text-[4.25rem] sm:leading-[0.94] lg:text-[5.25rem]">
                The <em className="font-normal italic text-brasslt">center</em>
                <br />
                of Maui.
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <div className="mt-8 flex items-start gap-4">
                <span aria-hidden className="mt-3.5 h-px w-12 shrink-0 bg-brass" />
                <p className="max-w-md text-lg leading-relaxed text-sand/80">
                  Kamaʻāina-hosted private suites in the heart of historic Wailuku — minutes from the
                  airport, Iao Valley, and Maui’s best beaches.
                </p>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-9 max-w-lg">
                <HeroSearch maxGuests={maxGuests} />
              </div>
            </Reveal>

            <Reveal delay={290}>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sand/65">
                {avg > 0 && <span>★ {avg.toFixed(1)} guest rating</span>}
                <span aria-hidden className="text-sand/25">/</span>
                <span>{suites.length} private suites</span>
                <span aria-hidden className="text-sand/25">/</span>
                <span>8 min to OGG</span>
                <span aria-hidden className="text-sand/25">/</span>
                <span>Kamaʻāina-owned</span>
              </div>
            </Reveal>
          </div>

          {/* Framed, graded photograph — a mounted print on brass */}
          <div className="order-1 lg:order-2">
            <Parallax speed={0.06}>
              <figure className="relative">
                <Reveal variant="mask" delay={120}>
                  <div className="overflow-hidden rounded-card p-1.5 ring-1 ring-brass/40">
                    <div className="film-warm relative aspect-[4/3] overflow-hidden rounded-[2px] sm:aspect-[5/6] lg:aspect-[4/5]">
                      <Image
                        src="/hero-maui.jpg"
                        alt="Golden hour over a Maui beach, waves catching the last light"
                        fill
                        priority
                        sizes="(max-width:1024px) 92vw, 44vw"
                        className="film animate-kenburns object-cover"
                      />
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={260}>
                  <figcaption className="mt-4 flex items-center gap-2.5 text-xs text-sand/55">
                    <span aria-hidden className="h-px w-7 bg-brass" />
                    <span className="font-display italic">Golden hour over central Maui</span>
                  </figcaption>
                </Reveal>
              </figure>
            </Parallax>
          </div>
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
              <span aria-hidden className="h-px w-10 bg-clay" />
              <span className="eyebrow">The philosophy</span>
            </div>
            <h2 className="display mt-5 text-[2.4rem] leading-[1.06] sm:text-[3.1rem]">
              Waena means <span className="italic">“center.”</span>
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
            <span aria-hidden className="h-px w-10 bg-clay" />
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

      {/* ===== Location — dark interlude ===== */}
      <section className="bg-ink text-sand">
        <div className="container-page py-20 sm:py-28">
          <Reveal>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-brass" />
              <span className="eyebrow !text-brasslt">The location</span>
            </div>
            <h2 className="display mt-5 max-w-2xl text-[2.2rem] leading-[1.05] sm:text-[3.1rem]">
              Minutes from everything that matters.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:divide-x sm:divide-sand/15">
            {NEARBY.map(([time, place], i) => (
              <Reveal key={place} delay={i * 80} className="sm:px-8 sm:first:pl-0">
                <p className="display text-4xl text-brasslt sm:text-5xl">{time}</p>
                <p className="mt-2 text-sm text-sand/70">{place}</p>
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

      {/* ===== Closing CTA — graded, cinematic full-bleed ===== */}
      <section className="relative isolate overflow-hidden">
        <div className="film-warm absolute inset-0 -z-10">
          <Image
            src="/cta-maui.jpg"
            alt="Golden hour light over the rocky shore at Mākena Cove, Maui"
            fill
            sizes="100vw"
            className="film animate-kenburns object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/65 to-ink/85" />
        </div>
        <div className="container-page py-24 text-center text-sand sm:py-40">
          <Reveal>
            <span className="seal mx-auto flex h-12 w-12 text-brasslt">
              <CenterMark className="h-5 w-5" />
            </span>
            <p className="eyebrow mt-7 !text-brasslt">Your Maui home base awaits</p>
            <h2 className="display mx-auto mt-5 max-w-3xl text-[2.5rem] leading-[1.04] sm:text-[4.25rem]">
              Stay central. Stay comfortable.
              <br />
              Stay with <span className="italic text-brasslt">aloha.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-sand/85">
              A private suite in the heart of Wailuku — minutes from the airport, Iao Valley, and Maui’s best beaches.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="/suites">Reserve a stay</Button>
              <Link
                href="/suites"
                className="link-underline inline-flex items-center gap-2 self-center text-sm font-medium text-sand"
              >
                Browse all {suites.length} suites <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="mt-9 text-sm text-sand/65">
              ★ {avg.toFixed(1)} guest rating · {suites.length} private suites · 8 min to OGG · Self check-in 24/7
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
