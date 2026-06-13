export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 text-sm">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-2"><span aria-hidden className="text-palm">✓</span>{a}</li>
      ))}
    </ul>
  )
}
