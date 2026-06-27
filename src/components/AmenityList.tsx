export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 border-t border-line sm:grid-cols-2">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-3 border-b border-line py-3 text-sm">
          <span aria-hidden className="text-clay">—</span>
          {a}
        </li>
      ))}
    </ul>
  )
}
