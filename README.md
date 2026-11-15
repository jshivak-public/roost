# Roost — student subleases, one swipe away

A responsive UIUC marketplace built with Vite, React, TypeScript, Tailwind CSS, React Router, Motion, Lucide, and shadcn-style Radix UI primitives. Nothing is deployed automatically.

## Run locally

```powershell
cd C:\Users\jimsh\apartment_tinder
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173). Node 22.12+ or a supported newer version is recommended.

```sh
npm test
npm run lint
npm run build
npm run preview
```

The production output is `dist/`.

## Try the demo

1. Open Discover and drag a card left/right, or use Pass / Save / Like. Like adds the home to Saved. Undo restores the last decision and removes only a bookmark introduced by that like.
2. Complete the lifestyle questionnaire from Profile or discovery. Weighted scores and deal-breaker flags update immediately.
3. Set a semester, budget, dates, or advanced filters. Availability must contain the requested stay; flexible dates are informational, not a guarantee of availability.
4. Save two or three homes and compare them side by side.
5. Open a listing, browse photos, inspect the match breakdown, and start a listing-specific local conversation.
6. List your space through five steps. Upload up to six compressed images, reorder them by dragging or the keyboard-accessible “Move earlier” controls, save a draft, or publish to the demo. Manage drafts and active listings in Profile.

## Demo persistence and privacy

Everything is stored in this browser under the `roost-demo-v1` localStorage key: the demo profile, 18 seeded listings, created listings and compressed images, likes/passes, saves, local reports, and messages. No account, email confirmation, real delivery, moderation queue, or payment is created. Every seeded owner is a simulated account and has no verified badge. Email domain validation is only a demo UI check, not proof of enrollment.

Use sample information on shared devices. Sign-out ends the simulated session but does not erase local data. To reset the entire demo, remove only `roost-demo-v1` from this site's browser storage. Data is scoped to the exact origin, so localhost and 127.0.0.1 have different demo data. Photos and Google Fonts need internet access; uploaded photos stay local. Seed photos illustrate sample spaces and do not depict authenticated listings at those addresses.

## Matching

`src/lib/matching.ts` contains deterministic weighted comparisons: sleep 20, cleanliness 25, guests 15, social environment 15, smoking 15, pets 10. A score is shown only when at least 60% of the total preference weight is comparable. Coverage is shown in details; absent data is never filled with matching values. Pet allergies and selected deal breakers are flagged separately. Minimum-match filtering excludes hard conflicts. Budget, date, distance, and space requirements are independent practical filters.

Campus configuration and semester date presets live in `src/data/config.ts`. Discovery currently explicitly scopes to UIUC.

## Architecture

- `src/pages/`: lazy-loaded route screens
- `src/components/`: shared layout, listing cards, filters, provider, Radix dialog and button primitives
- `src/hooks/`: typed marketplace context and hook
- `src/services/repository.ts`: persistence interface and local demo repository
- `src/services/supabase.ts`: optional Supabase client factory, unused by demo mode
- `src/data/`: realistic sample data and configurable campuses/calendars
- `src/lib/`: matching, filtering, formatting, swipe/undo logic, and tests
- `src/types.ts`: domain entities

## Supabase integration (future setup)

The current app is intentionally a complete **local demo**, even if environment variables are supplied. Setting credentials alone does not enable a production backend.

1. Create a Supabase project, copy `.env.example` to `.env.local`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project URL and public anon/publishable key. Never put a service-role key in any `VITE_` variable.
2. Create universities, profiles, listings, listing_photos, lifestyle_preferences, saved_listings, swipes, conversations, conversation_participants, messages, reports, and future listing_boosts tables. Use auth user IDs for ownership and foreign keys/indexes for campus, owner, date, and conversation queries.
3. Deploy and test RLS: only owners may mutate listings and preferences; only participants may read/write private messages; only a user may access their saves and swipes. Scope listing queries to campus and active status. Do not make private emails public.
4. Implement university-domain validation on a trusted server and Supabase Auth email confirmation. Set verified status from confirmed server-owned identity, never from a client-editable field. Configure redirect URLs for local and Vercel environments.
5. Use a Storage bucket with owner-restricted writes, validated image content/size, and separate public listing photos from private information.
6. Replace the demo repository/provider persistence with asynchronous Supabase queries and mutations, including loading/error states and server-side validation/authorization. Components already consume the shared data context rather than direct localStorage calls. Add cross-session auth, message subscriptions, moderation handling, and integration tests before enabling public use.

See `docs/backend-plan.md` for the data model and authorization boundaries. No live database migrations or auth are claimed in this version.

## Vercel

Import this repository into Vercel when ready. Choose Vite, build command `npm run build`, output directory `dist`, and install command `npm install`. `vercel.json` provides SPA fallback routing so listing, profile, and other deep links survive refresh. Configure public Supabase environment values only after implementing the backend adapter. `.env*` is ignored except the blank example. No localhost API dependencies are embedded in the production app.

## Accessibility and checks

Semantic navigation, labeled form controls, visible focus rings, Radix focus-trapped dialogs, reduced-motion support, button alternatives to swipe, accessible photo reorder buttons, mobile bottom navigation, empty states, and persistence-error feedback are included. Automated tests cover deterministic matching, missing data, hard deal breakers, calendar containment, compound filters, campus isolation, and reversible swipe/save state.
# Sublease management portal

Open `/portal` after `npm run dev`, or choose **My Subleases** in Profile. The portal includes role-aware balances, external payment reporting and acknowledgment, checkout/autopay previews, shared requests, session-only documents, calendar, mutually accepted term changes, private local invitations, and deposit tracking.

Use the account menu to switch fictional participants. Alex is a subtenant at Campustown and a leaseholder at Green Street. Structured demo state persists in a separate browser storage key; uploaded files disappear on reload or leaving the portal. There is no live authentication, money movement, email delivery, escrow, or legal signature service.

See [portal launch notes](docs/portal-launch.md) for persistence details, testing, provider evaluation, and the required steps before a live-money launch.

