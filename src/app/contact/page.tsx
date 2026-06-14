import { Section } from '@/components/Section'
import { MapEmbed } from '@/components/MapEmbed'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Contact', alternates: { canonical: '/contact' } }
export default function Contact() {
  return (
    <Section className="max-w-xl">
      <h1 className="text-4xl font-semibold">Contact us</h1>
      <p className="mt-3 text-espresso/70">{SITE.address} · <a className="text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
      <form action={`mailto:${SITE.email}`} method="post" encType="text/plain" className="mt-8 grid gap-4">
        <input name="name" required placeholder="Your name" className="rounded-xl border border-taupe bg-white px-4 py-3" />
        <input name="email" type="email" required placeholder="Your email" className="rounded-xl border border-taupe bg-white px-4 py-3" />
        <textarea name="message" required rows={5} placeholder="How can we help?" className="rounded-xl border border-taupe bg-white px-4 py-3" />
        <button className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand hover:brightness-110">Send message</button>
      </form>
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-espresso/50">Find us</h2>
        <div className="mt-4 overflow-hidden rounded-card shadow-soft ring-1 ring-taupe/50">
          <MapEmbed query={SITE.mapQuery} title="Waena Inn location in Wailuku, Maui" className="h-72 w-full" />
        </div>
      </div>
    </Section>
  )
}
