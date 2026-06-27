import { Section, PageHero } from '@/components/Section'
import { Reveal } from '@/components/Reveal'
import { MapEmbed } from '@/components/MapEmbed'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Contact', alternates: { canonical: '/contact' } }

export default function Contact() {
  const inputCls =
    'rounded-card border border-line bg-paper px-4 py-3 text-sm text-espresso placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-clay/40'

  return (
    <Section>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        lead="Questions about a stay, your dates, or the neighborhood? We reply quickly — with aloha."
      />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="text-muted">
            {SITE.address} ·{' '}
            <a className="link-underline font-medium text-clay" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
          <form
            action={`mailto:${SITE.email}`}
            method="post"
            encType="text/plain"
            className="mt-8 grid gap-4"
          >
            <label className="grid gap-1.5">
              <span className="eyebrow">Your name</span>
              <input name="name" required placeholder="Jane Doe" className={inputCls} />
            </label>
            <label className="grid gap-1.5">
              <span className="eyebrow">Your email</span>
              <input name="email" type="email" required placeholder="jane@email.com" className={inputCls} />
            </label>
            <label className="grid gap-1.5">
              <span className="eyebrow">Message</span>
              <textarea name="message" required rows={5} placeholder="How can we help?" className={inputCls} />
            </label>
            <button className="group mt-1 inline-flex items-center justify-center gap-2 self-start rounded-card bg-espresso px-7 py-3.5 text-sm font-medium tracking-wide text-sand transition-colors duration-300 hover:bg-clay">
              Send message
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </button>
          </form>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-clay" />
            <span className="eyebrow">Find us</span>
          </div>
          <div className="mt-5 overflow-hidden rounded-card ring-1 ring-line">
            <MapEmbed query={SITE.mapQuery} title="Waena Inn location in Wailuku, Maui" className="h-80 w-full" />
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
