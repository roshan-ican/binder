# Binder

Mobile app for B2B need/offer matching. React Native (Expo), iOS + Android.

Visual direction: chrome on black, minimal, editorial.

## Run it locally

```bash
npm install
npm start          # then press i (iOS), a (Android), or w (web)
```

Requires Node 20+. `npm start` opens Expo Dev Tools; scan the QR code with
Expo Go on a phone, or press a key to open a simulator.

```bash
npm run typecheck  # tsc --noEmit
```

## Layout

```
src/theme/        shared colours, spacing, radius, size, typography
src/components/   the shared component inventory
src/screens/      screens composed from those components
src/data/         mock data for the prototype flows
src/navigation/   the small prototype navigator
src/features/     feature workflows and endpoint-specific API contracts
src/lib/          shared HTTP transport and Supabase client
backend/cmd/      Go entry points: API, migrations, seed, matching CLI
backend/internal/ Go application packages and infrastructure
backend/migrations/ versioned database migrations
```

## Supplier discovery sync

The Go supplier sync imports Google Maps businesses through Apify. Gangtok,
Sikkim is the default location, and locations/search terms remain configurable.

From `backend`, run a low-volume, no-database test first:

```powershell
go run ./cmd/supplier-sync --dry-run --max-results 5
```

After reviewing the Apify run, apply migrations and persist the results:

```powershell
go run ./cmd/migrate up
go run ./cmd/supplier-sync
```

Use semicolons between locations and commas between search terms:

```powershell
go run ./cmd/supplier-sync --locations "Gangtok, Sikkim, India;Siliguri, West Bengal, India" --search-terms "manufacturer,wholesaler,supplier"
```

For a continuously running process, `--schedule` runs immediately and then every
15 days. In production, a host-managed scheduled job invoking the one-shot command
is preferred because it survives process restarts cleanly.

## Code boundaries

- `src/features/auth/` owns Google sign-in, the Binder session endpoint contract,
  and sign-in orchestration. Screens render UI; navigation selects routes from
  the result. `src/lib/` contains shared clients rather than feature endpoints.
- `backend/cmd/api/main.go` loads configuration, constructs dependencies, and
  starts the server. HTTP routes and request/response handling live in
  `backend/internal/httpapi/`.
- `backend/internal/authsession/` links identities to Binder accounts;
  `supabaseauth/` verifies provider tokens; `matching/` owns matching logic.
  HTTP handlers call these packages rather than implementing their logic.
- Add business profile persistence to an `internal/business/` package when that
  flow is implemented. Create other feature packages as their behaviour is added.
  Keep the existing Go module and central migrations together.

Google and OTP sign-in use Supabase directly, without waiting for Go account sync.
Startup restores the Supabase session; logout signs out of the current device.
Completed prototype onboarding is saved locally per Supabase user and is not
backend authorization or cross-device business storage. The Go session endpoint
remains available for the later business API integration.

## What the prototype covers

Welcome → Discover → Search results → Business profile (with "why this
matches") → Connect → Conversation, plus the Opportunities deck, the Enquiries
dashboard and detail, Inbox, and Profile.

## Business directory schema

Migration 000006 unifies imported vendors and registered businesses in
`businesses`. `owner_user_id` is nullable; the read-only `is_claimed` boolean
is generated from whether an owner exists. Verification remains separate.
Deleting an owner leaves the business unclaimed instead of deleting its listings.
Auth identities and `users` are unchanged.

`business_roles` and `business_industries` support multiple roles/industries.
`business_capabilities` holds multiple structured offers per business for matching.
Matches, conversation participants, and messages now reference business IDs;
there is no separate supplier identity. `suppliers` and the unused
`ai_extractions` log are removed. Historical migrations still contain their
original definitions so existing installations can upgrade normally.

The directory has optional contact/source fields, a unique Google Place ID,
Google profile link, rating/review count, and `last_synced_at`. Unknown countries
remain NULL. Apify importing and public directory endpoints are not implemented
by this schema change. A future importer must preserve owner-edited fields on
claimed businesses and update imported Google metadata separately.

Run migrations from `backend` with `go run ./cmd/migrate up`. Migration 000006
preserves existing business/feature references; it discards extraction logs.
Its rollback cannot restore those logs or original supplier UUIDs and refuses
when unclaimed businesses exist. Restore a backup for an exact reversal.

Schema tests require an **empty scratch Postgres database with pgvector**:
`TEST_DATABASE_URL=... go test ./internal/schema`. They migrate up/down and clear
fixtures. Auth integration tests require a separate migrated scratch database:
`TEST_DATABASE_URL=... go test ./internal/authsession`. Never point schema tests
at the application database.
