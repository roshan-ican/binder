# Binder design system

Source of truth in two places, kept in sync deliberately:

- **Figma** — [Binder — Mobile Design System V1](https://www.figma.com/design/YK4DggVLooTLFb1OSZvCel)
  (variable collections `Primitives`, `Color`, `Spacing`, `Radius`, `Size`)
- **Code** — `src/theme/*`, consumed through `src/components/*`

Variable names match one to one. `Color/bg/primary` in Figma is `colors.bg.primary`
here, and every Figma variable carries that path as its iOS/Android code syntax,
so Dev Mode hands a developer the exact token to type.

## Colour

| Layer | Tokens | Rule |
|---|---|---|
| Primitives | `ink/*`, `line/*`, `paper/*`, `chrome/*`, `state/*` | Never referenced from a screen. Hidden from Figma pickers via empty scopes. |
| Background | `bg.primary` `bg.secondary` `bg.raised` `bg.elevated` | Page → grouped region → card → sheet. |
| Surface | `surface.soft` `.hover` `.selected` `.field` `.inverse` | `surface.inverse` is the chrome CTA fill. |
| Text | `text.primary` `.secondary` `.tertiary` `.disabled` `.inverse` | `text.inverse` only on chrome. |
| Border | `border.subtle` `.default` `.strong` `.field` `.focus` | Borders carry the system; shadows do not. |
| Chrome | `chrome[100]`–`chrome[600]` | Material accent. Target 90% neutral / 10% chrome. |
| Semantic | `semantic.success` `.warning` `.danger` `.info` | Desaturated. States only, never branding. |

Chrome is allowed on: the wordmark, the primary CTA, a selected underline, a
match indicator, verification detail, one premium divider, a numeric highlight.
It is not allowed as a background, a repeated gradient, or metallic text.

## Type

`typography.*` — display large/medium, heading 1–3, body large/default/small,
label large/default/micro, number hero, editorial serif. Negative tracking on
large headings only; `micro` is uppercase with +0.8 tracking. Body text stays at
15pt or above wherever practical.

The serif (`typography.editorial`) appears at most once per screen and never on
a button, label, input or tab.

## Spacing, radius, size

4-point grid (`spacing[1]`–`spacing[16]`). Page padding is 20 by default, 16 on
dense data screens, 24 on hero screens. `rhythm.*` names the recurring vertical
pairs so screens don't re-invent them.

Radius ladder stops at 16 for containers; 20 belongs to bottom-sheet top corners
and 999 only to real pills. Controls are 52 high, never below the 44pt touch
target.

## Language that must not drift

| Concept | Exact wording |
|---|---|
| Match quality | Strong match · Good fit · Potential fit — never a percentage |
| Enquiry status | Draft · Active · Closed · Expired |
| Connection | Pending · Accepted · Declined · Blocked |
| Trust | Documents provided · Verification pending · Verified · Proven |

The three trust systems stay separate — no combined "trusted" badge, and no
claim ("Certified by Binder", "100% genuine") the product cannot support.

## Things this system does not do

No feed, stories, reactions, or follower counts. No invented match scores. No
glassmorphism, neon chrome, or shadow-heavy floating cards. No more than four
bottom tabs. No core action reachable only by swipe. No empty result screen —
search widens the region and says so.
