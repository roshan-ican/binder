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
```

## What the prototype covers

Welcome → Discover → Search results → Business profile (with "why this
matches") → Connect → Conversation, plus the Opportunities deck, the Enquiries
dashboard and detail, Inbox, and Profile.
