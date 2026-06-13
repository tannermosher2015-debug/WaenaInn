import { getSiteContent } from '@/lib/siteContent'
import { Section } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'About' }
export default function About() {
  const { about } = getSiteContent()
  return (
    <Section className="max-w-3xl">
      <p className="text-sm uppercase tracking-widest text-espresso/50">About us</p>
      <h1 className="mt-2 text-4xl font-semibold">{about.heading}</h1>
      <p className="mt-6 leading-relaxed text-espresso/80">{about.body}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {about.highlights.map((h) => (
          <li key={h} className="rounded-card bg-white p-5 text-sm shadow-soft ring-1 ring-taupe/50">{h}</li>
        ))}
      </ul>
      <p className="mt-10 text-espresso/70">Questions? Email <a className="text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </Section>
  )
}
