import { Reveal } from './Reveal'
import { Botanical } from './Botanical'

export function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return <section id={id} className={`container-page py-16 sm:py-24 lg:py-28 ${className}`}>{children}</section>
}

/**
 * Editorial interior-page header: brand mark + eyebrow, a large serif title,
 * an optional lead paragraph, closed with a hairline rule. Keeps every page
 * opening in the same voice as the homepage.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string
  title: React.ReactNode
  lead?: string
}) {
  return (
    <Reveal>
      <header className="mb-12 border-b border-line pb-10 sm:mb-16 sm:pb-12">
        <div className="flex items-center gap-3">
          <Botanical variant="sprig" className="h-5 w-5 text-palm" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h1 className="display mt-5 max-w-3xl text-[2.5rem] leading-[1.02] sm:text-[3.5rem]">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>}
      </header>
    </Reveal>
  )
}

/**
 * Editorial section intro: a light serif index numeral, an all-caps eyebrow,
 * a serif heading, and a hairline rule — left-aligned and asymmetric. This is
 * the deliberate anti-template move replacing centered eyebrow stacks.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  aside,
}: {
  index: string
  eyebrow: string
  title: React.ReactNode
  intro?: string
  aside?: React.ReactNode
}) {
  return (
    <Reveal className="mb-12 sm:mb-16">
      <div className="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-5 sm:gap-7">
          <span className="index-num mt-1 text-2xl leading-none sm:text-3xl">{index}</span>
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="display mt-3 text-[2rem] leading-[1.05] sm:text-[2.75rem]">{title}</h2>
            {intro && <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{intro}</p>}
          </div>
        </div>
        {aside && <div className="shrink-0 sm:pb-1">{aside}</div>}
      </div>
    </Reveal>
  )
}
