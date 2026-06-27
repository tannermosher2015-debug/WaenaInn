import { JsonLd } from './JsonLd'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I book a stay?',
    a: 'Pick a suite and your dates, then hit “Request to book.” It sends us your stay details, and we’ll confirm availability and send payment details. Nothing is charged until your dates are confirmed.',
  },
  {
    q: 'Where exactly is Waena Inn?',
    a: 'In historic Wailuku Town, central Maui — 8–10 minutes from Kahului Airport (OGG), Maui Memorial Hospital, and Iao Valley, with beaches a short drive on either side of the island.',
  },
  {
    q: 'What time is check-in and check-out?',
    a: 'Self check-in is available 24/7 with secure keypad entry, so you can arrive any hour. We send your entry details before arrival — no front desk, no waiting.',
  },
  {
    q: 'Is parking available?',
    a: 'Yes — free, ample on-site parking is included with every stay.',
  },
  {
    q: 'Do the suites have a kitchen and Wi-Fi?',
    a: 'Each private suite has a mini studio kitchen with cooking basics, fast Wi-Fi, air conditioning, and access to a washing machine.',
  },
  {
    q: 'How many guests can a suite hold?',
    a: 'Our private suites comfortably sleep 2–5 guests. The exact capacity is listed on each suite’s page.',
  },
  {
    q: 'Why stay central instead of West Maui?',
    a: 'Central Wailuku keeps you minutes from the airport and hospital and a quick drive to both sides of the island. Guests regularly tell us it’s cleaner, more comfortable, and better value than staying on the pricier West side.',
  },
]

export function Faq() {
  return (
    <div className="border-t border-line">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      {FAQS.map((f) => (
        <details key={f.q} className="group border-b border-line py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-normal [&::-webkit-details-marker]:hidden">
            {f.q}
            <span
              aria-hidden
              className="shrink-0 text-2xl font-light leading-none text-clay transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  )
}
