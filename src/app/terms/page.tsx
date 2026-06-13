import { Section } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Terms & Conditions' }

export default function Terms() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-4xl font-semibold">Terms &amp; Conditions</h1>
      <p className="mt-6 leading-relaxed text-espresso/80">
        {/* TODO(client): replace with real booking terms — cancellation policy, house rules, taxes/fees, liability. */}
        These terms govern your stay at Waena Inn, including booking, cancellation, house rules, and
        applicable taxes and fees. This is placeholder text — finalized terms will be provided before launch.
      </p>
      <p className="mt-6 text-espresso/70">
        Questions? Email{' '}
        <a className="text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </Section>
  )
}
