# Binder Development Instructions

## Current priority

- Complete the UI and all required user flows before starting API or backend work.
- Keep using local mock data and local component state while the UI is being completed.
- Do not add API clients, databases, authentication services, or backend scaffolding unless the user explicitly asks to begin the backend phase.
- The planned backend language is Go. Do not substitute Node.js, NestJS, or another backend stack without the user's approval.

## Preserve the existing design

- The current visual direction is intentional: premium, minimal, editorial, chrome on black.
- Extend the existing design; do not redesign screens, change the visual language, or introduce a new component library.
- Reuse components from `src/components` and tokens from `src/theme` before creating new styles or components.
- Do not hardcode colors, spacing, radius, typography, or motion values when an appropriate shared token exists.
- Keep chrome as a restrained accent. Follow the usage notes in `src/theme/colors.ts`; do not turn gradients or metallic effects into page backgrounds or repeated decoration.
- Maintain visual consistency across new screens, including typography, spacing, controls, cards, navigation, feedback states, and motion.
- When a requested UI is not fully specified, infer it from the closest existing screen or component rather than inventing a different design direction.

## UI implementation phase

- Build complete user flows, not isolated screens. Include navigation, empty states, loading placeholders, validation feedback, error states, success states, disabled states, and useful press interactions where relevant.
- Support both business and job-seeker roles without breaking either role's existing flow.
- Keep screen composition in `src/screens`, reusable UI in `src/components`, design tokens in `src/theme`, mock content in `src/data`, and prototype routing in `src/navigation`.
- Keep the current lightweight navigator until the UI flows require a real routing library or the user explicitly requests that migration.
- Preserve iOS, Android, and web compatibility. Avoid platform-specific behavior unless it is guarded and necessary.
- Keep accessibility in mind: readable contrast, clear labels, reasonable touch targets, keyboard-friendly inputs, and reduced unnecessary motion.

## Light mode

- Light mode is planned for a later phase; do not implement it unless explicitly requested.
- New UI must still use semantic theme tokens so light mode can be added later without rewriting every screen.
- Do not scatter direct black, white, or gray values throughout screen and component files.

## Backend phase (later)

- When the user explicitly starts backend work, use Go and define the API contract from the completed UI flows.
- Keep the Go backend separate from the Expo client with a clear boundary between transport models and UI models.
- Do not replace working mock flows all at once. Integrate APIs incrementally, one completed flow at a time, with loading, failure, retry, and empty states.
- Ask before choosing major backend infrastructure such as the database, authentication provider, deployment platform, or service architecture.

## Working agreement

- Prefer the smallest change that completes the requested behavior.
- Do not expand the task into unrelated architecture, redesign, cleanup, or new features.
- Inspect the relevant existing screen, component, and theme tokens before editing.
- Preserve user changes and unrelated work already present in the repository.
- Run `npm run typecheck` after TypeScript changes. For broader UI changes, also run the relevant Expo target when practical and clearly state what was and was not visually verified.
- Do not claim a screen or interaction is visually correct unless it was actually opened and checked at the relevant viewport or device size.
