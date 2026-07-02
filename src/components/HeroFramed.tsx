'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { Botanical } from '@/components/Botanical'
import { HeroVideo } from '@/components/HeroVideo'

/**
 * Alternate "framed glass" hero (sample /v2). A cinematic full-bleed Maui video
 * under a frosted panel — big editorial headline left, a functional booking card
 * right that routes to /suites carrying the chosen dates + guests.
 */
export function HeroFramed({
  suiteLabel,
  suiteSub,
  pricePerNight,
  suiteMaxGuests,
  avg,
  reviewCount,
}: {
  suiteLabel: string
  suiteSub: string
  pricePerNight: number
  suiteMaxGuests: number
  avg: number
  reviewCount: number
}) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  function reserve() {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    params.set('guests', String(guests))
    router.push(`/suites?${params.toString()}`)
  }

  const fieldLabel = 'block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-paper/60'
  const dateInput =
    'mt-1 w-full bg-transparent text-sm text-paper outline-none [color-scheme:dark] placeholder:text-paper/40'

  return (
    <section className="relative isolate overflow-hidden">
      <HeroVideo src="/maui-hero.mp4" poster="/maui-hero-poster.jpg" className="absolute inset-0 -z-10" />
      {/* Warm espresso scrim — enough contrast for paper text over the bright video */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-espresso/80 via-espresso/45 to-espresso/70"
      />

      <div className="container-page px-3 pb-6 pt-24 sm:px-6 sm:pt-28">
        {/* the frosted frame */}
        <div className="relative flex min-h-[82vh] flex-col rounded-[1.75rem] border border-paper/30 bg-gradient-to-b from-paper/[0.12] to-paper/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,253,249,0.25)] transform-gpu sm:min-h-[80vh] sm:p-9 lg:p-12">
          {/* top bar inside the frame */}
          <Reveal>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Botanical variant="sprig" className="h-5 w-5 text-butter" />
                <span className="eyebrow !text-paper/85">Wailuku · Maui, Hawaiʻi</span>
              </div>
              <Link
                href="/suites"
                className="rounded-full bg-paper px-5 py-2 text-sm font-medium text-espresso transition-colors duration-300 hover:bg-butter"
              >
                Book now
              </Link>
            </div>
          </Reveal>

          {/* headline — editorial, translucent middle line */}
          <Reveal delay={90}>
            <h1 className="display mt-10 max-w-3xl text-paper text-[2.9rem] leading-[0.98] sm:mt-14 sm:text-[4.6rem] sm:leading-[0.95] lg:text-[5.6rem]">
              Your Maui
              <br />
              <span className="text-paper/45">home in the</span>
              <br />
              center of it all.
            </h1>
          </Reveal>

          {/* bottom region: intro + rating on the left, booking card on the right */}
          <div className="mt-auto grid items-end gap-8 pt-12 lg:grid-cols-[1fr_auto] lg:gap-12">
            <Reveal delay={160}>
              <div className="flex flex-col gap-6">
                <p className="max-w-sm text-base leading-relaxed text-paper/90">
                  A little kamaʻāina-hosted inn in the heart of Wailuku — made for slow island
                  mornings, easy days, and a warm welcome home.
                </p>
                {avg > 0 && (
                  <div className="flex items-center gap-3 text-paper">
                    <span aria-hidden className="text-butter">★</span>
                    <span className="display text-3xl leading-none">{avg.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="text-sm text-paper/80">
                        from {reviewCount}+ guest reviews
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Reveal>

            {/* functional booking card */}
            <Reveal delay={230}>
              <div className="w-full rounded-[1.25rem] bg-espresso/90 p-6 text-paper ring-1 ring-paper/15 sm:w-[22rem]">
                <p className="eyebrow !text-butter">Featured suite</p>
                <h2 className="display mt-1.5 text-2xl leading-tight text-paper">{suiteLabel}</h2>
                <p className="mt-1 text-sm text-paper/70">{suiteSub}</p>

                <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card ring-1 ring-paper/15">
                  <label className="bg-paper/[0.06] px-4 py-3">
                    <span className={fieldLabel}>Check-in</span>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className={dateInput}
                    />
                  </label>
                  <label className="bg-paper/[0.06] px-4 py-3">
                    <span className={fieldLabel}>Check-out</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className={dateInput}
                    />
                  </label>
                </div>

                <label className="mt-3 flex items-center justify-between rounded-card bg-paper/[0.06] px-4 py-3 ring-1 ring-paper/15">
                  <span className={fieldLabel}>Guests</span>
                  <input
                    type="number"
                    min={1}
                    max={suiteMaxGuests}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    aria-label="Guests"
                    className="w-14 bg-transparent text-right text-sm text-paper outline-none [color-scheme:dark]"
                  />
                </label>

                <div className="mt-5 flex items-baseline justify-between">
                  <p className="display text-3xl text-paper">
                    ${pricePerNight}
                    <span className="text-sm font-normal text-paper/70">/night</span>
                  </p>
                  <p className="text-sm text-paper/70">sleeps {suiteMaxGuests}</p>
                </div>

                <button
                  onClick={reserve}
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-card bg-paper py-3.5 text-sm font-medium tracking-wide text-espresso transition-colors duration-300 hover:bg-butter"
                >
                  Reserve
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
