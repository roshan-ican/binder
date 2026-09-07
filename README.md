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
