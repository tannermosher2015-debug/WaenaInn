'use client'
import { useState } from 'react'
import type { Suite } from '@/lib/suites.schema'
import { filterSuites, type Capacity } from '@/lib/filterSuites'
import { SuiteCard } from '@/components/SuiteCard'
import { Section } from '@/components/Section'

const TABS: { label: string; value: Capacity }[] = [
  { label: 'All', value: 'all' }, { label: '2 guests', value: 2 },
  { label: '3 guests', value: 3 }, { label: '4 guests', value: 4 }, { label: '5+ guests', value: '5+' },
]

export function SuitesGrid({ suites }: { suites: Suite[] }) {
  const [capacity, setCapacity] = useState<Capacity>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const shown = filterSuites(suites, { capacity, featuredOnly })
  return (
    <Section>
      <h1 className="text-4xl font-semibold">All suites</h1>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={String(t.value)} onClick={() => setCapacity(t.value)}
            className={`rounded-full px-4 py-2 text-sm ring-1 ring-taupe ${capacity === t.value ? 'bg-espresso text-sand' : 'hover:bg-taupe/40'}`}>
            {t.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} /> Featured only
        </label>
      </div>
      <p className="mt-4 text-sm text-espresso/60">{shown.length} suites</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => <SuiteCard key={s.slug} suite={s} />)}
      </div>
    </Section>
  )
}
