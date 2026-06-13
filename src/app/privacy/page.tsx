import { Section } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Privacy Policy' }

export default function Privacy() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-6 leading-relaxed text-espresso/80">
        {/* TODO(client): replace with the real privacy policy reviewed for your jurisdiction. */}
        Waena Inn respects your privacy. We collect only the information needed to respond to
        booking inquiries and provide our lodging services, and we do not sell your personal
        information. This is placeholder text — a finalized policy will be provided before launch.
      </p>
      <p className="mt-6 text-espresso/70">
        Questions about your data? Email{' '}
        <a className="text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </Section>
  )
}
