import { Section, PageHero } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Privacy Policy' }

export default function Privacy() {
  return (
    <Section>
      <div className="max-w-3xl">
        <PageHero eyebrow="Legal" title="Privacy Policy" />
        <p className="text-[1.05rem] leading-relaxed text-espresso/80">
          {/* TODO(client): have a finalized, jurisdiction-reviewed policy replace this general statement. */}
          Waena Inn respects your privacy. We collect only the information you provide when you
          contact us or request a booking — such as your name, email, and stay details — and use it
          solely to respond to your inquiry and arrange your stay. We do not sell your personal
          information or share it with third parties for marketing. You may ask us to update or
          delete your information at any time.
        </p>
        <p className="mt-6 text-muted">
          Questions about your data? Email{' '}
          <a className="link-underline font-medium text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </Section>
  )
}
