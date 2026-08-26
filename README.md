# Binder

Mobile app for B2B need/offer matching. React Native (Expo), iOS + Android.

Visual direction: chrome on black, minimal, editorial. The design system in
`src/theme` is the code mirror of the Figma file
**Binder — Mobile Design System V1**.

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
src/theme/        design tokens — colour, spacing, radius, size, typography
src/components/   the shared component inventory
src/screens/      screens composed from those components
src/data/         mock data for the prototype flows
```

## Token rules that matter

- Colour comes from `colors.*` only. No raw hex in a screen.
- Chrome is a material accent: roughly 90% black/neutral, 10% chrome.
- Borders carry the system. Shadow opacity never exceeds 0.12.
- Body text is 15pt or larger. Touch targets are 44pt or larger.
- The three trust signals — documents, verified, proven — stay separate.
