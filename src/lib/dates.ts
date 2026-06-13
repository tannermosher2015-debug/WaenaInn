import { differenceInCalendarDays, eachDayOfInterval, parseISO, formatISO } from 'date-fns'

export const nightsBetween = (checkIn: string, checkOut: string) =>
  differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))

export function rangeHasBlocked(checkIn: string, checkOut: string, blocked: string[]): boolean {
  if (!blocked.length) return false
  const set = new Set(blocked)
  // nights are checkIn .. checkOut-1
  return eachDayOfInterval({ start: parseISO(checkIn), end: parseISO(checkOut) })
    .slice(0, -1)
    .some((d) => set.has(formatISO(d, { representation: 'date' })))
}

export interface StayInput { checkIn: string; checkOut: string; guests: number; maxGuests: number; blocked: string[] }
export function validateStay(s: StayInput): { ok: boolean; error?: string } {
  if (!s.checkIn || !s.checkOut) return { ok: false, error: 'Select dates' }
  if (nightsBetween(s.checkIn, s.checkOut) < 1) return { ok: false, error: 'Check-out must be after check-in' }
  if (s.guests < 1 || s.guests > s.maxGuests) return { ok: false, error: `Max ${s.maxGuests} guests` }
  if (rangeHasBlocked(s.checkIn, s.checkOut, s.blocked)) return { ok: false, error: 'Some dates are unavailable' }
  return { ok: true }
}
