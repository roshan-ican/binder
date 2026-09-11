<!-- # High level  -->

# Requirements

- get the businesses data of traders, manufactors from google maps
- match them on their interests ((algorithm to match them between each))
  -- we understand each once requirements? pain points and needs
  -- on the swipe notify them that there business as a client and has shown an intertes by someone in our platform sign up or see
  -- they put the location and prefill their details if they have any updates they can do it
- must be available in multiple cities
- realtime sync interaction
- chat feature
- ways to make it a sustainable
- goal is to make legitmate connections where buesinness and al work becomes easy

# somethiong else

- people
  -- should be able to find vendors, manufactors and resellers
  -- people should be able to like
- businesses
  -- match the business to businesses
  -- they can reach out to other
- match the suppiliers and suppliers

---

# Clarified Product Direction

> This section clarifies the notes above without replacing them. Items marked **Open decision** still need product validation.

Binder is a multi-city platform for creating legitimate business connections. It helps people and businesses discover traders, manufacturers, vendors, suppliers, and resellers based on what they need and what another business can offer.

## Product goals

- Make it easier to find relevant businesses instead of searching through an unfiltered directory.
- Understand each business's interests, requirements, pain points, needs, and capabilities well enough to recommend useful connections.
- Let a person or business express interest with a lightweight action such as a like or swipe.
- Turn mutual or accepted interest into a real conversation through chat.
- Support many cities without making the matching logic dependent on one location.
- Build a sustainable product without reducing the quality or legitimacy of connections.

## User groups

### People

- Can search for and discover vendors, manufacturers, suppliers, traders, and resellers.
- Can view enough business information to judge whether a connection is relevant.
- Can like or express interest in a business.

### Businesses

- Can create or claim a business profile.
- Can enter a location and receive prefilled public business details when a matching record exists.
- Can correct or update prefilled details before using the profile.
- Can describe what they offer, what they need, the industries they serve, and their pain points.
- Can discover and express interest in other businesses.
- Can receive and respond to connection interest.
- Can chat after the required connection condition is met.

## Core functional requirements

### Business data discovery

- The system should import publicly available business data for relevant traders, manufacturers, suppliers, vendors, and resellers through an approved Google Maps data provider.
- Imported records should retain their external source identifier so repeated imports update the same business instead of creating duplicates.
- Data collection should be configurable by country, city, business category, and search query.
- A business owner should be able to claim or create a profile and review imported details before those details are treated as owner-confirmed.
- Imported public data and owner-provided data should remain distinguishable.

### Business needs and capabilities

- A business profile should capture both sides of matching:
  - **Needs:** what the business is looking for.
  - **Capabilities:** products, services, supply capacity, or expertise the business can provide.
- The system should also capture industry, business role, location, preferred service area, and useful free-text context.
- **Open decision:** define which fields are mandatory before a profile can participate in matching.

### Matching and discovery

- Matching should compare one business's needs with another business's capabilities.
- Results should consider relevance, location or service coverage, industry, and stated preferences.
- The product should explain the main reason for a suggested match instead of showing an unexplained score only.
- A business should not be matched with itself, blocked accounts, or profiles that do not meet the minimum completeness or legitimacy rules.
- Matching must support business-to-business connections, including supplier-to-buyer and supplier-to-supplier connections when their needs and capabilities are complementary.

### Interest and invitations

- A like or right swipe should record interest in the target business.
- If the target business is already registered, it should receive an in-app notification.
- If the target business exists only as an imported public listing, Binder may invite it to claim its profile and state that a business on Binder has shown interest.
- Invitations must not reveal private information without the interested user's consent.
- **Open decision:** decide whether chat opens after one business accepts an enquiry or only after mutual interest.

### Multi-city support

- Country and city must be stored as structured values rather than as one unvalidated text field.
- Users should be able to search within a city and, where useful, expand discovery to nearby cities or businesses serving a wider area.
- Adding a city should be a configuration or data operation, not a new application build.

### Real-time interaction and chat

- New messages, interest, acceptance, and relevant connection changes should appear without requiring a manual refresh when connectivity allows.
- Chat should be connected to a specific enquiry or match so both parties understand why the conversation began.
- The UI must handle sending, sent, failed, unread, empty, offline, and retry states.
- Users must be able to block or report an unwanted connection.

### Trust and legitimacy

- Imported does not mean verified. The UI should clearly distinguish imported, claimed, and verified profiles.
- Important business details changed by an owner should be auditable.
- The system should support reporting, blocking, duplicate detection, and moderation.
- Verification rules should be consistent across supported countries while allowing country-specific evidence later.

### Sustainability

- The core discovery experience should remain useful without requiring payment for every connection.
- Possible revenue paths include optional verified-business plans, promoted discovery, qualified lead tools, or business workflow features.
- Paid placement must be visibly identified and must not silently replace match relevance.
- **Open decision:** select a revenue model only after testing which feature businesses value enough to pay for.

## Non-functional requirements

- **Privacy:** expose only information appropriate to the user's relationship and consent state.
- **Security:** protect account, profile, message, and verification data with authorization checks at the data boundary.
- **Performance:** discovery should feel responsive and should use pagination rather than loading an entire city at once.
- **Reliability:** interest and message writes should be idempotent so retries do not create duplicates.
- **Scalability:** importing and matching should work per city or region without requiring all records to be processed together.
- **Accessibility:** controls need clear labels, readable contrast, keyboard support on web, and reasonable touch targets on mobile.
- **Cross-platform support:** the same core flows should work on iOS, Android, and web.
- **Observability:** imports, matching runs, invitations, and message failures should be traceable without exposing private message content in logs.

# High-Level Design

## System context

1. The Expo client provides onboarding, profiles, discovery, interest, enquiries, notifications, and chat for iOS, Android, and web.
2. The Go backend owns business rules, authorization, matching, business-directory access, invitations, and chat APIs.
3. Supabase provides authentication, PostgreSQL storage, and real-time database events where appropriate.
4. The supplier-import process obtains public business records through the configured Google Maps data provider and normalizes them into Binder's business directory.
5. Notification providers deliver push, email, or other approved invitations after the backend records the event.

## Main product flow

1. A user signs in and chooses a person, business, or job-seeker flow where supported.
2. A business enters its location and searches for an existing imported record.
3. It claims a matching record or creates a new profile, then confirms or updates the details.
4. It adds needs, capabilities, industries, and preferences.
5. Binder generates relevant discovery candidates and explains why each may fit.
6. The user likes, skips, searches, or sends an enquiry.
7. The target receives an in-app notification or a privacy-safe claim invitation.
8. Once the connection rule is satisfied, both sides can communicate in a contextual conversation.

## Major boundaries

- The client owns presentation state, form state, navigation, loading, validation, and feedback.
- The backend owns authoritative permission checks and business rules; the client must not be the source of truth for trust or matching eligibility.
- The database stores canonical accounts, businesses, needs, capabilities, interests, matches, conversations, and messages.
- Import jobs write normalized source data but must not overwrite owner-confirmed fields without an explicit merge rule.
- Matching reads profile facts and produces explainable candidates; it should not directly send messages or invitations.

## Delivery phases

### Phase 1: complete UI flows

- Finish all required states using local mock data and local component state.
- Validate both business and job-seeker navigation without changing the existing Binder visual language.
- Do not add more backend infrastructure merely to complete a screen.

### Phase 2: define contracts

- Turn the completed UI flows into request, response, validation, and error contracts.
- Agree on chat-opening rules, profile completeness, verification, and invitation consent.

### Phase 3: incremental Go integration

- Connect one completed flow at a time.
- Preserve loading, retry, empty, validation, and failure states during each integration.
- Start with identity/profile synchronization, then directory/search, matching/interest, and finally real-time chat and notifications.

# Low-Level Design

## Core domain records

- **Account:** authenticated identity, role, status, notification preferences, and timestamps.
- **Business:** canonical profile, ownership state, location, contact visibility, trust state, and profile completeness.
- **Business source:** external provider, external place ID, raw-source metadata, last import time, and source confidence.
- **Need:** structured category plus optional description, quantity, timing, and service area.
- **Capability:** structured offer plus optional description, capacity, industries served, and service area.
- **Interest:** actor, target, action, context, status, and idempotency key.
- **Match:** both parties, score, reason codes, lifecycle state, and timestamps.
- **Enquiry:** initiating party, receiving party, related need/capability, status, and optional conversation.
- **Conversation:** participants, originating enquiry or match, status, and last activity.
- **Message:** conversation, sender, content type, body or attachment reference, delivery state, and timestamps.
- **Report/block:** reporter, target, reason, moderation state, and timestamps.

## Matching pipeline

1. Load an eligible source profile with at least one active need or capability.
2. Find candidates whose capabilities can satisfy its needs or whose needs complement its capabilities.
3. Remove the source business, blocked users, duplicates, inactive profiles, and ineligible candidates.
4. Apply city, service-area, industry, role, and preference filters.
5. Score the remaining candidates using explicit factors rather than one opaque rule.
6. Store or return reason codes such as `need_capability_fit`, `same_city`, `serves_region`, or `shared_industry`.
7. Rank candidates and paginate the result.
8. Record user feedback such as like, skip, enquiry, block, or report separately from the computed score.

## Interest and chat state rules

- Suggested -> interested when a user likes or sends an enquiry.
- Interested -> connected when the product's acceptance rule is satisfied.
- Connected -> closed when either party closes the enquiry.
- Any active state -> blocked when one party blocks the other.
- Only authorized conversation participants may list or send messages.
- A retried interest or message request with the same idempotency key must not create a second record.

## Import and profile-claim rules

- Normalize phone numbers, websites, categories, country, city, coordinates, and provider IDs before matching records.
- Prefer a stable provider place ID for deduplication, with reviewed fallback rules for records that lack one.
- Keep the last imported value separately from the current owner-confirmed value when they differ.
- A claim request must prove account access and follow the agreed business-verification process.
- Re-importing a claimed profile must not silently overwrite owner-confirmed profile fields.

## Suggested API groups

- `/session` for authenticated account synchronization.
- `/businesses` for profile creation, claiming, updating, and visibility.
- `/directory` for location-aware search and public business details.
- `/needs` and `/capabilities` for structured matching inputs.
- `/matches` for recommendations and match explanations.
- `/interests` and `/enquiries` for like, accept, decline, and close actions.
- `/conversations` and `/messages` for chat.
- `/notifications` for in-app notification state and preferences.
- `/reports` and `/blocks` for safety actions.
- `/internal/imports` for protected supplier-import operations, never public client access.

## File-system design requirements

- Keep mobile/web screens in `src/screens` and avoid placing reusable business logic inside screen files.
- Keep shared visual components in `src/components` and reuse the existing components before adding new ones.
- Keep all reusable color, spacing, radius, size, typography, and motion values in `src/theme`.
- Keep temporary prototype content in `src/data`; clearly name mock-only data so it is not mistaken for authoritative server data.
- Keep feature-specific client logic in `src/features/<feature>` when it includes state, validation, transformations, or transport coordination.
- Keep shared network clients and external-service adapters in `src/lib`; screen files should not construct HTTP or Supabase clients.
- Keep prototype route definitions and route-level state in `src/navigation` until an approved routing migration is needed.
- Keep Expo assets in `assets`, deployment helpers in `scripts`, and visual design documentation in `design-reference`.
- Keep the Go application under `backend` with executable entry points in `backend/cmd`, private application packages in `backend/internal`, and ordered reversible SQL in `backend/migrations`.
- Keep tests beside the Go package or TypeScript feature they verify, using the language's normal naming convention.
- Do not commit secrets. Document required environment variables in example files and keep real values in ignored local environment files.
- Do not import backend implementation files into the Expo client. The boundary between them is the versioned API contract.

## Target repository layout

```text
binder/
|-- App.tsx                       # Expo application entry composition
|-- assets/                       # Icons, splash images, and bundled media
|-- src/
|   |-- components/               # Reusable Binder UI components
|   |-- data/                     # Prototype and mock data only
|   |-- features/
|   |   |-- auth/                 # Auth state, validation, and client coordination
|   |   |-- businesses/           # Future business profile feature logic
|   |   |-- discovery/            # Future search and match feature logic
|   |   `-- messaging/            # Future enquiry and chat feature logic
|   |-- lib/                      # Shared transport and external client adapters
|   |-- navigation/               # Route definitions and navigation state
|   |-- screens/                  # Route-level screen composition
|   `-- theme/                    # Semantic design tokens
|-- backend/
|   |-- cmd/
|   |   |-- api/                  # HTTP API executable
|   |   |-- match/                # Matching job or CLI executable
|   |   |-- migrate/              # Migration executable
|   |   `-- supplier-sync/        # External business import executable
|   |-- internal/
|   |   |-- httpapi/              # Routes, request decoding, and responses
|   |   |-- matching/             # Matching rules and ranking
|   |   |-- supplierimport/       # Normalization, deduplication, and import rules
|   |   |-- authsession/          # Account/session synchronization
|   |   |-- config/               # Environment configuration
|   |   `-- db/                   # Database connection and shared persistence
|   `-- migrations/               # Ordered up/down SQL migrations
|-- design-reference/             # Approved Binder visual reference
|-- scripts/                      # Build and deployment helpers
`-- prd.md                        # Product and system requirements
```

> The future feature folders above describe intended ownership boundaries. Create them only when their implementation begins; do not add empty scaffolding.

## Definition of done for a flow

- The happy path is navigable from its real entry point to completion.
- Empty, loading, validation, failure, retry, disabled, and success states exist where relevant.
- Business and job-seeker behavior remains intact where the flow is shared.
- UI uses existing components and semantic theme tokens.
- Client-only prototypes use mock/local state; integrated flows use the agreed Go API contract.
- TypeScript changes pass `npm run typecheck`.
- Go changes pass the relevant package tests.
- Visual correctness is confirmed at the relevant platform and viewport before being reported as verified.

# Open Product Decisions

- What exact action opens chat: one accepted enquiry or mutual interest?
- Which profile fields are required before matching begins?
- What evidence is required to claim or verify a business in each country?
- Which contact details may be shown before and after a connection?
- Which notification channels are allowed for an imported, unclaimed business?
- How far outside a selected city should discovery expand?
- Which sustainability model should be tested first without damaging match trust?
