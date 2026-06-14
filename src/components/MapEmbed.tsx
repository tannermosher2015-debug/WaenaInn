/** Keyless Google Maps embed (classic `output=embed` iframe — no API key, no billing). */
export function MapEmbed({
  query,
  title = 'Map',
  className = '',
}: {
  query: string
  title?: string
  className?: string
}) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`
  return (
    <iframe
      title={title}
      src={src}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      style={{ border: 0 }}
    />
  )
}
