# Roost portal: local demo and live launch boundary

## Implemented now

The portal extends the marketplace at `/portal`, with payments, requests, documents, calendar, sublease details, protection, settings, and `/portal/new`. Profile, listing details, and listing conversations provide entry points. The two seeded agreements let Alex act as a subtenant or leaseholder; the account menu switches fictional identities without changing assigned roles.

Financial values derive from integer-cent installments. Calendar-month proration uses actual days; anniversary billing clamps to month end without drifting. Move-out is exclusive. Custom schedules and additional charges are explicit obligations. Changes require both participants, and reported/acknowledged payment amounts are protected both when proposing and accepting amendments.

Only recipient-acknowledged external reports reduce the demo ledger. Self-reports, disputed records, and simulated checkout do not. Direct-to-landlord reports cannot be acknowledged by a student on the landlord's behalf. Autopay is a scheduling preview, never an authorization. No credentials or payment instruments are collected.

Structured fictional data uses `roost-portal-demo-v1` in browser localStorage, separate from marketplace state. Files, filenames, and object URLs stay in React memory only; URLs are revoked on removal or leaving the portal. A stored receipt reference may remain after reload, but the attachment itself expires. Notifications and read states are local; due-date and end-of-stay reminders are derived from the explicitly displayed June 10, 2027 demo timeline. Nothing is emailed or pushed.

This is not authenticated multi-user storage: another browser cannot redeem a local invitation. Demo membership checks protect app flows, not against someone editing browser storage. Do not enter real financial, legal, or personal data.

## Provider evaluation

Stripe Connect is a candidate for marketplace payments because it models connected accounts and payments between parties. This is an architectural fit assessment, not confirmation that Stripe has approved student subleasing, deposit custody, or this business model. Confirm supported countries, recipient eligibility, underwriting, fees, charge ownership, refunds, disputes, and platform liability directly before choosing a charge model. See [Stripe Connect](https://docs.stripe.com/connect).

Keep direct-to-landlord and off-platform arrangements as external tracking unless that recipient has separately completed supported onboarding. Do not route a landlord's funds to a student as a workaround. Roost must not describe an ordinary payment flow as escrow, insurance, or deposit protection.

## Required before real money movement

1. Implement server authentication and participant membership checks for every agreement, request, payment, document, and invitation operation. Use hashed, expiring invitation tokens and transaction-scoped permissions. Remove public demo identity switching from live mode.
2. Move structured state to a database with row-level access controls and server validation. Use transactional updates, versioned accepted terms, immutable audit records, and integer-cent ledger entries. Test concurrency, duplicate submissions, privilege escalation, and stale agreement acceptance.
3. Store documents in private storage with authenticated uploads, MIME/content inspection, malware scanning, short-lived authorized downloads, retention/deletion policies, and audit trails. Never use a public bucket for leases or receipts.
4. Obtain provider approval for the business model, complete recipient onboarding, and establish applicable agreement, privacy, dispute, and deposit requirements with qualified review. The current deposit return date is a participant expectation, not a statutory deadline.
5. Create hosted checkout sessions on the server with authoritative recipient, currency, amount, accepted terms version, and idempotency key. Display actual fees before consent. Use provider-hosted payment-method collection; never store raw banking or card data.
6. Verify signed webhooks using the original raw body. Persist a unique provider/event ID before processing, tolerate retries and out-of-order events, and reconcile provider objects before posting ledger entries. A browser redirect must never mark a payment paid. Model processing, failure, refunds, reversals, and disputes separately. Stripe documents signature verification and duplicate-event handling in [its webhook guide](https://docs.stripe.com/webhooks).
7. Add separately recorded, revocable recurring-payment consent with amount/date disclosures, provider mandates where required, notifications, cancellation, and failure handling. Saving the current preview day grants no consent.
8. Test in the provider sandbox, audit authorization and financial reconciliation, configure monitored background jobs, and obtain explicit approval before enabling live keys or deploying a real-money release.

The provider adapter currently exposes only a disabled demo preview. No live checkout, webhook handler, real payout, actual autopay, escrow, insurance, or e-signature service is implemented.

## Local verification

Run `npm test`, `npm run lint`, and `npm run build`. Start with `npm run dev`, then open `/portal`. Browser QA covers all sidebar routes, payer reporting, recipient acknowledgment and ledger update, plus mobile navigation. Build output remains compatible with the existing Vite/Vercel SPA configuration. No deployment was performed.
