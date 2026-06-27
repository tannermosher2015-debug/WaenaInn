'use client'
import { useState } from 'react'
import type { Suite } from '@/lib/suites.schema'
import { filterSuites, type Capacity } from '@/lib/filterSuites'
import { SuiteCard } from '@/components/SuiteCard'
import { Section, PageHero } from '@/components/Section'
import { Reveal } from '@/components/Reveal'

const ALL_TABS: { label: string; value: Capacity }[] = [
  { label: 'All', value: 'all' }, { label: '2 guests', value: 2 },
  { label: '3 guests', value: 3 }, { label: '4 guests', value: 4 }, { label: '5+ guests', value: '5+' },
]

export function SuitesGrid({
  suites,
  initialCapacity = 'all',
}: {
  suites: Suite[]
  initialCapacity?: Capacity
}) {
  const [capacity, setCapacity] = useState<Capacity>(initialCapacity)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  // Only show capacity tabs that actually match at least one suite (keeps "All").
  const tabs = ALL_TABS.filter(
    (t) => t.value === 'all' || filterSuites(suites, { capacity: t.value, featuredOnly: false }).length > 0,
  )
  const shown = filterSuites(suites, { capacity, featuredOnly })
  return (
    <Section>
      <PageHero
        eyebrow="Accommodation"
        title="The suites"
        lead="Privately renovated studios and suites across historic Wailuku — each thoughtfully prepared, all minutes from the airport, the valley, and both shores of the island."
      />
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={String(t.value)}
            onClick={() => setCapacity(t.value)}
            className={`rounded-card px-4 py-2 text-sm tracking-wide transition-colors duration-300 ${
              capacity === t.value
                ? 'bg-espresso text-sand'
                : 'text-espresso/75 ring-1 ring-line hover:ring-espresso/40'
            }`}
          >
            {t.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="accent-clay"
          />
          Featured only
        </label>
      </div>
      <p className="mt-5 eyebrow">{shown.length} suites</p>
      <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 3) * 80}>
            <SuiteCard suite={s} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
