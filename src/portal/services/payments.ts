export interface PaymentProvider { enabled: boolean; name: string; preview(amountCents: number): { amountCents: number; feeCents: number; totalCents: number; movesMoney: false } }
export const paymentProvider: PaymentProvider = { enabled: false, name: 'Demo preview', preview: amountCents => ({ amountCents, feeCents: 0, totalCents: amountCents, movesMoney: false }) }
// A live adapter must create checkout on a trusted server and validate signed, idempotent provider webhooks.
// Neither UI completion nor a browser mutation may create a provider-confirmed ledger credit.
