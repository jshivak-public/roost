import type { Agreement, Installment, PaymentRecord, Terms } from '../types'
export const currency = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
export const displayDate = (date: string) => new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
export const toCents = (amount: string) => { if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error('Enter an amount with no more than two decimal places.'); const cents = Math.round(Number(amount) * 100); if (!Number.isSafeInteger(cents) || cents < 0 || cents > 100000000) throw new Error('Enter a valid amount.'); return cents }
const iso = (date: Date) => date.toISOString().slice(0, 10)
const utc = (date: string) => new Date(`${date}T00:00:00Z`)
const days = (start: string, end: string) => Math.round((utc(end).getTime() - utc(start).getTime()) / 86400000)
export function validDate(date: string) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(utc(date).getTime()) && iso(utc(date)) === date }
export function generateSchedule(input: Pick<Terms, 'rentCents' | 'start' | 'end' | 'frequency' | 'proration'>): Installment[] {
  if (!validDate(input.start) || !validDate(input.end) || input.end <= input.start || days(input.start, input.end) > 1096) throw new Error('Choose a valid stay of up to three years, with move-out after move-in.')
  if (!Number.isSafeInteger(input.rentCents) || input.rentCents <= 0) throw new Error('Rent must be a positive amount in cents.')
  if (input.frequency === 'custom') return []
  if (input.frequency === 'one-time') return [{ id: `rent-${input.start}`, due: input.start, description: 'One-time rent', cents: input.rentCents, kind: 'rent' }]
  const result: Installment[] = []; let cursor = input.start; let index = 0
  const origin = utc(input.start)
  while (cursor < input.end) {
    const start = utc(cursor)
    let periodEnd: string; let denominator: number
    if (input.proration === 'anniversary') {
      const targetMonth = new Date(Date.UTC(origin.getUTCFullYear(), origin.getUTCMonth() + index + 1, 1))
      const lastDay = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)).getUTCDate()
      periodEnd = iso(new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth(), Math.min(origin.getUTCDate(), lastDay))))
      denominator = days(cursor, periodEnd)
    } else {
      periodEnd = iso(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)))
      denominator = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate()
    }
    const coveredEnd = periodEnd < input.end ? periodEnd : input.end
    result.push({ id: `rent-${cursor}`, due: cursor, description: `${start.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })} rent${days(cursor, coveredEnd) < denominator ? ' · prorated' : ''}`, cents: Math.round(input.rentCents * days(cursor, coveredEnd) / denominator), kind: 'rent' })
    cursor = coveredEnd; index++
  }
  return result
}
export function validateTerms(terms: Terms) {
  generateSchedule({ ...terms, frequency: 'monthly' })
  if (!Number.isSafeInteger(terms.depositCents) || terms.depositCents < 0) throw new Error('The deposit must be a valid nonnegative amount.')
  if (!terms.installments.length) throw new Error('Add at least one installment.')
  const ids = new Set<string>()
  for (const i of terms.installments) {
    if (ids.has(i.id) || !validDate(i.due) || !Number.isSafeInteger(i.cents) || i.cents <= 0 || !i.description.trim()) throw new Error('Every installment needs a unique ID, valid date, description, and positive amount.')
    ids.add(i.id)
  }
}
export function ledger(agreement: Agreement, payments: PaymentRecord[], asOf: string) {
  const records = payments.filter(p => p.agreementId === agreement.id)
  const rows = agreement.terms.installments.map(i => {
    const matching = records.filter(p => p.installmentId === i.id)
    const acknowledged = matching.filter(p => p.status === 'acknowledged' && p.source === 'external').reduce((sum, p) => sum + p.cents, 0)
    const reported = matching.filter(p => p.status === 'reported' && p.source === 'external').reduce((sum, p) => sum + p.cents, 0)
    const remaining = Math.max(0, i.cents - acknowledged)
    const status = !remaining ? 'Settled externally' : reported ? 'Awaiting acknowledgment' : i.due < asOf ? 'Overdue' : i.due === asOf ? 'Due today' : 'Upcoming'
    return { ...i, acknowledged, reported, remaining, status }
  })
  const total = rows.reduce((sum, i) => sum + i.cents, 0)
  const paid = rows.reduce((sum, i) => sum + i.acknowledged, 0)
  return { rows, total, paid, remaining: Math.max(0, total - paid), due: rows.filter(i => i.due <= asOf).reduce((sum, i) => sum + i.remaining, 0), pending: rows.reduce((sum, i) => sum + i.reported, 0), next: [...rows].sort((a, b) => a.due.localeCompare(b.due)).find(i => i.remaining > 0), monthExpected: rows.filter(i => i.due.slice(0, 7) === asOf.slice(0, 7)).reduce((sum, i) => sum + i.cents, 0) }
}
