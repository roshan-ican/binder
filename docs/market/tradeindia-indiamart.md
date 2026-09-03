# TradeIndia & IndiaMART — how they work, and where Binder differs

Background research for the SWAP feature. Everything here describes the shape of
these products as publicly documented; specific plan prices change often and are
not quoted as current figures.

## The shape both products share

Both are B2B **directories with a lead layer on top**. The mechanics are almost
identical:

1. **Catalog listings.** A seller creates a company profile and product pages —
   photos, specification, minimum order quantity, indicative price, service
   area. These pages are the SEO surface; most buyer traffic arrives on them
   from search engines rather than from inside the app.
2. **Buy leads / RFQ.** A buyer posts a requirement ("500 leather jackets,
   Delhi, by 18 Oct"). The platform matches it to sellers by category and
   location and pushes it to them as a lead.
3. **Lead routing is the product.** The same buy lead is sold to several
   sellers at once. Whoever calls first usually wins. Buyer contact details are
   the thing being gated.
4. **Verification as a trust tier.** GST, company registration, and a paid
   "trusted/verified" badge. Verification is partly a trust signal and partly an
   upsell.
5. **Seller subscriptions.** Free listing with negligible visibility, then paid
   tiers that buy: a fixed quota of buyer leads per month, higher placement in
   category and search results, a richer catalog, a badge, and a relationship
   manager at the top tier. Tiers are usually annual contracts sold by a
   telesales team.

Buyers are free. Sellers pay. Revenue scales with how many sellers compete for
the same lead.

## What that means in practice

- **The buyer's requirement is broadcast, not matched.** A seller pays for
  volume of leads, not fit, so both sides wade through noise.
- **The seller's incentive is to answer fast, not to be right.** Five suppliers
  ring the same buyer within minutes of a post.
- **A profile is a one-time act.** A seller fills the catalog once and then only
  returns when a lead notification arrives. There is no reason to open the app
  on a Tuesday with nothing to buy.
- **Everything is denominated in cash.** The only transaction the platform can
  express is "I pay you money for goods".

## Where Binder differs

TradeIndia asks: **"Who can sell me this?"**

Binder asks: **"Who can help me do this — and what can we exchange?"**

Three deliberate departures:

### 1. Matching is explained, not scored
Binder shows a match quality label plus the concrete reasons behind it ("MOQ
supports your 500-unit requirement", "same city", "registration verified").
No percentage. We only claim what the ranking can actually explain — see the
note in `src/components/MatchLabel.tsx`.

### 2. Trust is a gate, not a badge
Verification on Binder blocks the actions that matter (connecting, posting an
enquiry, proposing a swap) rather than decorating a profile. `BusinessTrustGate`
already enforces this.

### 3. SWAP — value exchange, not only cash
This is the wedge. A business declares what it needs and what it can offer, and
Binder finds exchanges:

- **Service swap** — photographer ↔ clothing brand, designer ↔ manufacturer.
- **Product swap** — café needs uniforms, clothing company needs catering.
- **Value swap** — a gym gives a restaurant access to 2,000 members; the
  restaurant gives gym members a discount and promotion. Exposure, audience,
  distribution and space are tradeable.

And the part that is genuinely hard to copy: **swap chains**. When A needs B but
B does not need A, Binder closes the loop through a third business —
clothing brand → photographer → restaurant → clothing brand. Nobody pays cash;
Binder coordinates the three-way exchange.

A directory cannot do this, because a directory only models one relationship
(seller → buyer) and one currency (money). SWAP also gives a business a standing
reason to come back: *"you have 4 possible swaps this week"* is a weekly hook, not
a one-time profile setup.

## Implication for the product

The funnel Binder is building is:

```
Discover → Verify → Connect → SWAP → Transact
```

The first three steps are table stakes against TradeIndia and IndiaMART. SWAP is
the reason a business picks Binder over either of them, and the reason it opens
the app when it has nothing to buy.
