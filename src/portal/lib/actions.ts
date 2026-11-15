import type { Agreement, PaymentRecord, PortalState, Terms, Ticket } from '../types'
import { ledger, validDate, validateTerms } from './ledger'
export function participant(agreement: Agreement, actor: string) { const member = agreement.participants.find(p => p.userId === actor); if (!member) throw new Error('Only a participant can access this sublease.'); return member }
export function getAgreement(state: PortalState, id: string, actor: string) { const agreement = state.agreements.find(a => a.id === id); if (!agreement) throw new Error('Sublease not found.'); participant(agreement, actor); return agreement }
function log(state: PortalState, agreement: Agreement, actor: string, text: string, href: string) {
  const time = new Date().toISOString()
  state.audit.unshift({ id: crypto.randomUUID(), agreementId: agreement.id, actor, text, time })
  state.notifications.unshift(...agreement.participants.filter(p => p.userId !== actor).map(p => ({ id: crypto.randomUUID(), agreementId: agreement.id, to: p.userId, title: text, body: `${agreement.property} · Local demo activity only`, href, time, read: false })))
}
export function recordPayment(state: PortalState, actor: string, record: Omit<PaymentRecord, 'id' | 'payerId' | 'status' | 'acknowledgment'>): PortalState {
  const next = structuredClone(state); const agreement = getAgreement(next, record.agreementId, actor)
  if (participant(agreement, actor).role !== 'subtenant') throw new Error('Only the incoming subtenant can report a payment.')
  if (agreement.status !== 'active') throw new Error('Both participants must accept the terms before recording payments.')
  if (!Number.isSafeInteger(record.cents) || record.cents <= 0 || !validDate(record.date) || record.date > state.demoDate) throw new Error('Enter a positive amount and a payment date on or before the demo timeline date.')
  const row = ledger(agreement, next.payments, state.demoDate).rows.find(i => i.id === record.installmentId)
  if (!row || record.cents > row.remaining - row.reported) throw new Error('The amount exceeds the installment’s unreported remaining balance.')
  if (record.source === 'demo' && agreement.terms.arrangement !== 'leaseholder') throw new Error('This arrangement supports external reporting only.')
  next.payments.push({ ...record, id: crypto.randomUUID(), payerId: actor, status: 'reported' })
  log(next, agreement, actor, record.source === 'demo' ? 'Demo checkout simulated — no funds moved.' : 'An external payment was reported.', '/portal/payments')
  return next
}
export function reviewPayment(state: PortalState, actor: string, id: string, status: 'acknowledged' | 'disputed', note: string): PortalState {
  const next = structuredClone(state); const record = next.payments.find(p => p.id === id)
  if (!record) throw new Error('Payment record not found.')
  const agreement = getAgreement(next, record.agreementId, actor)
  if (participant(agreement, actor).role !== 'leaseholder' || actor === record.payerId) throw new Error('Only the original leaseholder can review the payer’s report.')
  if (record.source === 'demo') throw new Error('A simulated checkout cannot be acknowledged as money received.')
  if (status === 'acknowledged' && agreement.terms.arrangement === 'landlord') throw new Error('The landlord is the recipient. A student cannot acknowledge receipt on their behalf.')
  if (record.status !== 'reported') throw new Error('This payment has already been reviewed.')
  if (!note.trim()) throw new Error('Add a short review note.')
  record.status = status; record.acknowledgment = { by: actor, time: new Date().toISOString(), note }
  log(next, agreement, actor, `An external payment was ${status}.`, '/portal/payments'); return next
}
function protectPaymentRecords(next: PortalState, agreement: Agreement, terms: Terms) {
  const id = agreement.id
  for (const old of agreement.terms.installments) {
    const committed = next.payments.filter(p => p.agreementId === id && p.installmentId === old.id && p.source === 'external' && p.status !== 'disputed').reduce((sum, p) => sum + p.cents, 0)
    if (committed && (!terms.installments.some(i => i.id === old.id) || terms.installments.find(i => i.id === old.id)!.cents < committed)) throw new Error('Keep installments with reported or acknowledged payments, at least at their committed amount. Resolve payment records before replacing them.')
  }
  if (agreement.terms.arrangement !== terms.arrangement && next.payments.some(p => p.agreementId === id && p.source === 'external' && p.status !== 'disputed')) throw new Error('The payment recipient cannot change after payment activity; create a separate agreement for a new arrangement.')
}
export function proposeTerms(state: PortalState, actor: string, id: string, terms: Terms, reason: string) {
  const next = structuredClone(state); const agreement = getAgreement(next, id, actor); validateTerms(terms)
  if (agreement.amendments.some(a => a.status === 'pending')) throw new Error('Resolve the pending proposal before creating another.')
  if (!reason.trim()) throw new Error('Explain the proposed change.')
  protectPaymentRecords(next, agreement, terms)
  agreement.amendments.unshift({ id: crypto.randomUUID(), proposedBy: actor, createdAt: new Date().toISOString(), terms, reason, acceptedBy: [actor], status: 'pending' })
  log(next, agreement, actor, 'A terms proposal needs your review.', '/portal/sublease'); return next
}
export function acceptTerms(state: PortalState, actor: string, id: string, proposalId?: string, reject = false) {
  const next = structuredClone(state); const agreement = getAgreement(next, id, actor)
  if (!agreement.invite.accepted) throw new Error('The invited demo participant must join before terms can be accepted.')
  if (proposalId) {
    const proposal = agreement.amendments.find(a => a.id === proposalId && a.status === 'pending')
    if (!proposal) throw new Error('This proposal is no longer pending.')
    if (reject) { proposal.status = 'rejected'; log(next, agreement, actor, 'A terms proposal was declined.', '/portal/sublease'); return next }
    validateTerms(proposal.terms); protectPaymentRecords(next, agreement, proposal.terms)
    proposal.acceptedBy = [...new Set([...proposal.acceptedBy, actor])]
    if (agreement.participants.every(p => proposal.acceptedBy.includes(p.userId))) { agreement.terms = proposal.terms; proposal.status = 'accepted'; agreement.acceptedBy = [...proposal.acceptedBy] }
  } else { validateTerms(agreement.terms); agreement.acceptedBy = [...new Set([...agreement.acceptedBy, actor])]; if (agreement.participants.every(p => agreement.acceptedBy.includes(p.userId))) agreement.status = 'active' }
  log(next, agreement, actor, 'Sample terms acceptance recorded. Not a legal signature.', '/portal/sublease'); return next
}
export function createAgreement(state: PortalState, actor: string, agreement: Agreement) {
  participant(agreement, actor); validateTerms(agreement.terms)
  if (agreement.participants.length !== 2 || new Set(agreement.participants.map(p => p.userId)).size !== 2 || new Set(agreement.participants.map(p => p.role)).size !== 2) throw new Error('A sublease requires two distinct participants with complementary roles.')
  const next = structuredClone(state); next.agreements.push({ ...agreement, status: 'draft', acceptedBy: [actor], amendments: [] }); log(next, agreement, actor, 'You have a local demo sublease invitation.', '/portal/sublease'); return next
}
export function acceptInvite(state: PortalState, actor: string, id: string, code: string) {
  const next = structuredClone(state); const agreement = getAgreement(next, id, actor)
  if (agreement.acceptedBy.includes(actor) || agreement.invite.accepted || code !== agreement.invite.code) throw new Error('This invitation is not pending for this participant.')
  agreement.invite.accepted = true; log(next, agreement, actor, 'The sample participant joined the sublease.', '/portal/sublease'); return next
}
export function createRequest(state: PortalState, actor: string, request: Omit<Ticket, 'id' | 'submittedBy' | 'createdAt' | 'status' | 'replies'>) {
  const next = structuredClone(state); const agreement = getAgreement(next, request.agreementId, actor)
  if (!request.title.trim() || !request.description.trim()) throw new Error('Add a title and a description.')
  next.requests.unshift({ ...request, id: crypto.randomUUID(), submittedBy: actor, createdAt: new Date().toISOString(), status: 'Open', replies: [] }); log(next, agreement, actor, `New request: ${request.title}`, '/portal/requests'); return next
}
export function updateRequest(state: PortalState, actor: string, id: string, status: Ticket['status'], reply: string) {
  const next = structuredClone(state); const ticket = next.requests.find(t => t.id === id)
  if (!ticket) throw new Error('Request not found.'); const agreement = getAgreement(next, ticket.agreementId, actor)
  ticket.status = status; if (reply.trim()) ticket.replies.push({ id: crypto.randomUUID(), by: actor, body: reply.trim(), time: new Date().toISOString() }); log(next, agreement, actor, `Request updated: ${ticket.title}`, '/portal/requests'); return next
}
export function updateDeposit(state: PortalState, actor: string, id: string, action: 'inspection' | 'deduction' | 'dispute' | 'status', value: { notes: string; date?: string; cents?: number; kind?: 'Move-in' | 'Move-out'; status?: Agreement['deposit']['status'] }) {
  const next = structuredClone(state); const agreement = getAgreement(next, id, actor); const member = participant(agreement, actor); const entry = { id: crypto.randomUUID(), by: actor, time: new Date().toISOString() }
  if (!value.notes.trim()) throw new Error('Add a descriptive note.')
  if (action === 'inspection') { if (!value.date || !validDate(value.date) || !value.kind) throw new Error('Choose a valid inspection date and type.'); agreement.deposit.inspections.push({ id: entry.id, by: actor, date: value.date, kind: value.kind, notes: value.notes }) }
  if (action === 'dispute') agreement.deposit.disputes.push({ ...entry, reason: value.notes })
  if (action === 'deduction') { if (member.role !== 'leaseholder') throw new Error('Only the leaseholder may propose deductions.'); const amount = value.cents || 0; if (!Number.isSafeInteger(amount) || amount <= 0 || agreement.deposit.deductions.reduce((sum, d) => sum + d.cents, 0) + amount > agreement.terms.depositCents) throw new Error('Proposed deductions cannot exceed the deposit.'); agreement.deposit.deductions.push({ ...entry, cents: amount, reason: value.notes }) }
  if (action === 'status') { if (member.role !== 'leaseholder' || !value.status) throw new Error('Only the leaseholder can report the deposit status.'); agreement.deposit.status = value.status }
  log(next, agreement, actor, `Deposit ${action} recorded: ${value.notes}`, '/portal/protection'); return next
}
export function documentNotice(state: PortalState, actor: string, id: string) { const next = structuredClone(state); const agreement = getAgreement(next, id, actor); log(next, agreement, actor, 'A session-only sample attachment was added. It is available only until reload.', '/portal/documents'); return next }
