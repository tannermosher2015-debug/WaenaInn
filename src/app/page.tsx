import Image from 'next/image'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'
import { Section } from '@/components/Section'
import { SuiteCard } from '@/components/SuiteCard'
import { RatingPill } from '@/components/RatingPill'
import { Button } from '@/components/Button'
import { AmenityList } from '@/components/AmenityList'

export default function Home() {
  const suites = getAllSuites()
  const featured = suites.filter((s) => s.featured).slice(0, 3)
  const hero = suites[0]
  const topRating = suites.length ? Math.max(...suites.map((s) => s.rating)) : 0
  return (
    <>
      <Section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          {topRating > 0 && <RatingPill rating={topRating} />}
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] sm:text-6xl">Find your<br />Maui stay.</h1>
          <p className="mt-5 max-w-md text-espresso/70">{SITE.tagline}. Kamaʻāina-hosted private suites in the heart of Wailuku, welcoming you with aloha.</p>
          <div className="mt-8 flex gap-3">
            <Button href="/suites">Browse suites</Button>
            <Button href="/about" variant="ghost">Our story</Button>
          </div>
        </div>
        {hero && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-soft">
            <Image src={hero.photos[0]} alt={hero.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" priority />
          </div>
        )}
      </Section>

      <Section className="!py-0"><div className="rounded-card bg-white p-8 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-espresso/50">Every suite includes</h2>
        <div className="mt-4"><AmenityList amenities={['Air conditioning','24-hour check-in','Free parking','Cooking basics','Free WiFi','Washing machine']} /></div>
      </div></Section>

      <Section>
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-widest text-espresso/50">Accommodation</p>
          <h2 className="mt-2 text-4xl font-semibold">Featured suites</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => <SuiteCard key={s.slug} suite={s} />)}
        </div>
        <div className="mt-10 text-center"><Button href="/suites" variant="ghost">Explore all {suites.length} suites</Button></div>
      </Section>

      <Section><div className="rounded-card bg-espresso px-8 py-16 text-center text-sand">
        <h2 className="text-4xl font-semibold">Stay central. Stay comfortable.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sand/80">Minutes from Kahului, Iao Valley, and Maui&apos;s best beaches.</p>
        <div className="mt-8"><Button href="/suites">Book a stay</Button></div>
      </div></Section>
    </>
  )
}
