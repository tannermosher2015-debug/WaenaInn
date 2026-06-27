import { Section, PageHero } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Terms & Conditions' }

export default function Terms() {
  return (
    <Section>
      <div className="max-w-3xl">
        <PageHero eyebrow="Legal" title="Terms & Conditions" />
        <p className="text-[1.05rem] leading-relaxed text-espresso/80">
          {/* TODO(client): finalize booking terms — cancellation policy, house rules, liability — with review. */}
          These terms govern your stay at Waena Inn. Bookings are confirmed by email once your dates
          and payment are arranged; applicable Hawaii taxes and any cleaning fee are shown at the time
          of booking. House rules — including check-in details, occupancy, and care of the suite — are
          shared with your booking confirmation. For questions about cancellations or your reservation,
          please reach out before booking.
        </p>
        <p className="mt-6 text-muted">
          Questions? Email{' '}
          <a className="link-underline font-medium text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </Section>
  )
}
