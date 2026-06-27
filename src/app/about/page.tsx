import Image from 'next/image'
import { getSiteContent } from '@/lib/siteContent'
import { getAllSuites } from '@/lib/suites'
import { Section, PageHero } from '@/components/Section'
import { Reveal } from '@/components/Reveal'
import { SITE } from '@/lib/site'

export const metadata = { title: 'About', alternates: { canonical: '/about' } }

export default function About() {
  const { about } = getSiteContent()
  const suites = getAllSuites()
  const portrait = suites[2]?.photos?.[0] ?? suites[0]?.photos?.[0]

  return (
    <Section>
      <PageHero eyebrow="About us" title={about.heading} lead={about.intro} />

      {/* Story + arched portrait */}
      <div className="grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
        <Reveal>
          <div className="max-w-2xl space-y-5 text-[1.05rem] leading-relaxed text-espresso/80">
            {about.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Reveal>

        <Reveal variant="mask" delay={120} className="order-first lg:order-last">
          <figure>
            <div className="film-warm relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-t-[12rem] ring-1 ring-line">
              {portrait && (
                <Image
                  src={portrait}
                  alt="A renovated Waena Inn suite in Wailuku"
                  fill
                  sizes="(max-width:1024px) 80vw, 34vw"
                  className="film object-cover"
                />
              )}
            </div>
          </figure>
        </Reveal>
      </div>

      {/* Highlights — hairline columns */}
      <Reveal className="mt-16 grid border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-line">
        {about.highlights.map((h, i) => (
          <div
            key={h}
            className="border-b border-line py-6 sm:border-b-0 sm:px-8 sm:py-2 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="index-num text-lg">0{i + 1}</span>
            <p className="mt-2 text-sm leading-relaxed text-espresso/80">{h}</p>
          </div>
        ))}
      </Reveal>

      {/* Closing line */}
      <Reveal className="mt-20 border-t border-line pt-12 text-center">
        <p className="display mx-auto max-w-2xl text-[2rem] leading-snug sm:text-[2.75rem]">
          {about.closing}
        </p>
        <p className="mt-6 text-muted">
          Questions? Email{' '}
          <a className="link-underline font-medium text-clay" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
      </Reveal>
    </Section>
  )
}
