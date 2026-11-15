import type { PortalState } from '../types'
import { currency, ledger } from './ledger'
export function withReminders(state: PortalState): PortalState {
  const next = structuredClone(state)
  const previous = new Map(next.notifications.filter(n => n.id.startsWith('reminder:')).map(n => [n.id, n]))
  next.notifications = next.notifications.filter(n => !n.id.startsWith('reminder:') && n.id !== 'sample-notification')
  if (!next.settings.reminders) return next
  const delta = (date: string) => (Date.parse(date) - Date.parse(next.demoDate)) / 86400000
  for (const agreement of next.agreements.filter(a => a.status === 'active')) {
    const events = ledger(agreement, next.payments, next.demoDate).rows.filter(r => r.remaining > 0 && delta(r.due) <= 7).map(r => ({ key: r.id, title: r.due < next.demoDate ? 'An installment is overdue' : 'Your next rent payment', body: `${currency(r.remaining)} outstanding · ${r.due}`, href: '/portal/payments' }))
    if (delta(agreement.terms.end) >= 0 && delta(agreement.terms.end) <= 30) events.push({ key: 'move-out', title: 'Your sublease ends soon', body: `Plan your handover for ${agreement.terms.end}.`, href: '/portal/calendar' })
    for (const event of events) for (const person of agreement.participants) {
      const id = `reminder:${agreement.id}:${person.userId}:${event.key}`
      next.notifications.push({ id, agreementId: agreement.id, to: person.userId, title: event.title, body: `${agreement.property} · ${event.body} · Local demo reminder`, href: event.href, time: `${next.demoDate}T12:00:00Z`, read: previous.get(id)?.read ?? false })
    }
  }
  return next
}
