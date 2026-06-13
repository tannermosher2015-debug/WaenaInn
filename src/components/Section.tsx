export function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return <section id={id} className={`container-page py-16 sm:py-24 ${className}`}>{children}</section>
}
