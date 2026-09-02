# Binder UI Extension Brief

## Goal

Design the missing Binder mobile screens by extending the existing product shown in `screenshots/`. The result must feel like the same app and the same design system. Do not redesign, modernize, rebrand, brighten, simplify, or reinterpret the existing screens.

Binder is a two-sided B2B and jobs product with two roles:

- Businesses discover suppliers, publish enquiries, review interested businesses, connect, and message.
- Job seekers create a candidate profile, discover matched jobs, apply, track applications, and message companies.

## Non-negotiable visual direction

- Premium, minimal, editorial, chrome on black.
- Approximately 90% black and neutral surfaces, with chrome used only as a restrained accent.
- Preserve the existing typography hierarchy, spacing rhythm, border treatment, card density, control shapes, icon style, and bottom navigation.
- Prefer editorial sections separated by rules. Do not put every section into a card.
- Do not introduce colorful gradients, glassmorphism, large illustrations, generic SaaS styling, or a new component library.
- Dark mode is the only design target in this phase. Light mode will be designed later.
- Use semantic design tokens so a future light theme remains possible.
- Design for React Native on iOS and Android while retaining web compatibility.

## Existing motion language to preserve

Motion communicates state and feedback; it is not decoration.

- Tap feedback: 120 ms.
- Small state and route transitions: 200 ms.
- Sheets and modal transitions: 260 ms.
- Chrome trace treatment: 2100 ms.
- Ambient water treatment: 4200 ms.
- Route entry uses a subtle fade plus an 8 px upward settle.
- Pressable controls use restrained scale/opacity feedback.
- The job deck uses direct, physical horizontal dragging with rotation, PASS/INTERESTED feedback, and interruptible card motion.
- Preserve reduced-motion accessibility. Do not add looping decoration or unrelated parallax.

## Screens to design next

### Business flow

1. Create enquiry form.
2. Enquiry preview before publishing.
3. Enquiry published success state.
4. Edit enquiry form.
5. Close enquiry confirmation and closed state.
6. Saved businesses list.
7. Edit business profile.
8. Public business profile preview.
9. Business document and catalogue management.
10. Team members and invitations.

The enquiry form should cover title/requirement, category, quantity and unit, budget or price range, needed-by date, location/service area, description/specification, optional attachments, save draft, preview, and publish.

### Job-seeker flow

1. Full job-detail screen.
2. Apply review/confirmation.
3. Application submitted success state.
4. Saved jobs list.
5. Application-detail and status timeline.
6. Withdraw-application confirmation.
7. Edit candidate profile.
8. Public candidate-profile preview.
9. Resume, work history, education, and document management.

### Shared flow

1. Returning-user sign-in and session entry.
2. Saved searches and alert configuration.
3. Notification preferences.
4. Account and privacy settings.
5. Attachment picker and attachment message states.
6. Conversation details and actions.
7. Report, block, and confirmation states.
8. Loading, empty, offline, error, retry, disabled, and success variants for each important screen.

## Product rules visible in the current UI

- Keep business and job-seeker terminology distinct.
- Business status language is fixed: Draft, Active, Closed, Expired.
- Verification must remain optional during onboarding but required before a business connects, messages, or publishes.
- Matching explanations should remain visible and understandable; do not reduce matches to an unexplained percentage.
- Empty and error states must always provide a useful next action.
- Destructive actions require clear confirmation.
- Designs should include realistic content rather than generic lorem ipsum.

## Expected output

- Produce the missing screens in the same mobile frame and visual system as the supplied screenshots.
- Reuse existing patterns before introducing new ones.
- Include the key states for each flow, not only the ideal/default screen.
- Annotate any new reusable component or token that is genuinely required.
- Clearly distinguish proposed new screens from screenshots of already implemented screens.

## Reference implementation

The current app uses:

- `src/theme` for color, spacing, radius, size, typography, and motion tokens.
- `src/components` for the reusable UI inventory.
- `src/screens` for screen composition.
- `src/navigation/AppNavigator.tsx` for the current prototype flow.

When there is ambiguity, follow the closest existing screenshot or component rather than inventing a different visual direction.
