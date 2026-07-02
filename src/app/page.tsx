import Link from 'next/link'
import { getAllSuites } from '@/lib/suites'
import { Button } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { HeroVideo } from '@/components/HeroVideo'
import { Botanical } from '@/components/Botanical'
import { HomeSections } from '@/components/HomeSections'

export const metadata = { alternates: { canonical: '/' } }

export default function Home() {
  const suites = getAllSuites()
  const avg = suites.length ? suites.reduce((a, s) => a + s.rating, 0) / suites.length : 0

  return (
    <>
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

      <HomeSections />
    </>
  )
}
