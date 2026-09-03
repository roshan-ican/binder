import type { TrustSignal } from '../components/TrustBadge';
import { containsTerm } from './matching';
import {
  businesses,
  me,
  mySwapListings,
  mySwapRequests,
  swapListings,
  type BusinessProfileData,
  type SwapKind,
  type SwapLeg,
  type SwapListing,
  type SwapMatch,
  type SwapRequest,
} from './mock';

/**
 * SWAP matching.
 *
 * A swap only works if value moves in a closed loop. For two businesses that
 * means both directions have to land — I want something they offer AND they
 * want something I offer. When only one direction lands, a third business can
 * close the loop: A gives to B, B gives to C, C gives back to A, and nobody
 * pays cash. That chain is the part a directory cannot do.
 *
 * Everything here is a pure function over the mock data. No service, no score:
 * each match carries the reasons that produced it.
 */

export type SwapParty = {
  id: string;
  name: string;
  role: string;
  city: string;
  trust?: TrustSignal;
  /** What this business is looking for. */
  wants: string[];
  /** Offer labels, used when no listing carries the detail. */
  gives: string[];
  listings: SwapListing[];
};

const maxChains = 4;

/** The signed-in business as a swap party, from the live profile when present. */
export function myParty(profile?: BusinessProfileData | null): SwapParty {
  return {
    id: me.id,
    name: profile?.businessName || me.business,
    role: 'Your business',
    city: profile?.city || me.city,
    trust: profile?.verificationStatus === 'verified' ? 'verified' : undefined,
    wants: profile?.swapWants ?? me.swapWants,
    gives: profile?.swapOffers ?? me.swapOffers,
    listings: mySwapListings,
  };
}

/** Every other business that has opened itself to swaps. */
export function counterparties(): SwapParty[] {
  return businesses
    .filter((business) => business.swapOpen)
    .map((business) => ({
      id: business.id,
      name: business.name,
      role: business.role,
      city: business.city,
      trust: business.trust,
      wants: business.swapWants ?? [],
      gives: business.swapOffers ?? [],
      listings: swapListings.filter((listing) => listing.businessId === business.id),
    }));
}

export function partyById(id: string, profile?: BusinessProfileData | null): SwapParty | undefined {
  if (id === me.id) return myParty(profile);
  return counterparties().find((party) => party.id === id);
}

/**
 * What `from` could hand to `to`, or null if nothing `from` offers is wanted.
 * A listing wins over a bare offer label because it carries the detail a
 * business actually negotiates over.
 */
type Give = { leg: Omit<SwapLeg, 'toId' | 'fromId'>; kind: SwapKind; wanted: string };

/**
 * The wants are the outer loop on purpose: a business gets the thing it asked
 * for first, not whichever of your listings happens to sit at the top. Ask a
 * marketing agency that wants surplus stock, and it should be offered the
 * surplus stock rather than the new season.
 */
function findGive(from: SwapParty, to: SwapParty): Give | null {
  for (const wanted of to.wants) {
    const listing = from.listings.find(
      (item) => containsTerm(item.category, wanted) || containsTerm(item.title, wanted),
    );
    if (listing) {
      return {
        leg: {
          gives: listing.title,
          kind: listing.kind,
          indicativeValue: listing.indicativeValue,
          listingId: listing.id,
        },
        kind: listing.kind,
        wanted,
      };
    }
  }

  // Fall back to the bare offer labels, which carry no category of their own.
  for (const offer of from.gives) {
    const wanted = to.wants.find((want) => containsTerm(offer, want));
    if (wanted) return { leg: { gives: offer, kind: 'service' }, kind: 'service', wanted };
  }

  return null;
}

function leg(from: SwapParty, to: SwapParty, give: Give): SwapLeg {
  return { fromId: from.id, toId: to.id, ...give.leg };
}

/** Two-party swaps: both directions have to land. */
export function findDirectSwaps(profile?: BusinessProfileData | null): SwapMatch[] {
  const mine = myParty(profile);

  return counterparties()
    .flatMap((party) => {
      const iGive = findGive(mine, party);
      const theyGive = findGive(party, mine);
      if (!iGive || !theyGive) return [];

      const sameCity = containsTerm(party.city, mine.city);
      const trusted = party.trust === 'verified' || party.trust === 'proven';

      const reasons = [
        `They need ${lower(iGive.wanted)} — you offer ${lower(iGive.leg.gives)}`,
        `You need ${lower(theyGive.wanted)} — they offer ${lower(theyGive.leg.gives)}`,
        sameCity ? `Both in ${mine.city}` : `${party.city} — outside your city`,
      ];
      if (trusted) reasons.push('Registration verified');

      return [
        {
          id: `swap:${party.id}`,
          kind: 'direct' as const,
          swapKind: theyGive.kind,
          legs: [leg(mine, party, iGive), leg(party, mine, theyGive)],
          reasons,
          match: sameCity && trusted ? 'strong' : sameCity ? 'good' : 'potential',
        } satisfies SwapMatch,
      ];
    })
    .sort((a, b) => quality(b.match) - quality(a.match));
}

/**
 * Three-party chains. Only chains that reach a business you could not swap with
 * one-to-one are worth surfacing — anything else is a direct swap with extra
 * steps.
 */
export function findSwapChains(profile?: BusinessProfileData | null): SwapMatch[] {
  const mine = myParty(profile);
  const parties = counterparties();
  const directPartners = new Set(findDirectSwaps(profile).map((match) => match.legs[1].fromId));
  const seen = new Set<string>();
  const chains: SwapMatch[] = [];

  for (const first of parties) {
    const iGive = findGive(mine, first);
    if (!iGive) continue;

    for (const second of parties) {
      if (second.id === first.id) continue;
      if (directPartners.has(first.id) && directPartners.has(second.id)) continue;

      const firstGives = findGive(first, second);
      const secondGives = findGive(second, mine);
      if (!firstGives || !secondGives) continue;

      const key = [first.id, second.id].join('>');
      if (seen.has(key)) continue;
      seen.add(key);

      const cities = [mine.city, first.city, second.city];
      const sameCity = cities.every((city) => containsTerm(city, mine.city));
      // Name the business the loop actually reaches — the one you could not
      // have swapped with directly. That is the whole reason the chain exists.
      const unreachable = !directPartners.has(second.id) ? second : first;

      chains.push({
        id: `swap-chain:${first.id}:${second.id}`,
        kind: 'chain',
        swapKind: secondGives.kind,
        legs: [leg(mine, first, iGive), leg(first, second, firstGives), leg(second, mine, secondGives)],
        reasons: [
          `You cannot swap with ${unreachable.name} one-to-one — this loop reaches them`,
          `Three businesses, no cash: you give ${lower(iGive.leg.gives)} and receive ${lower(secondGives.leg.gives)}`,
          sameCity ? `All three in ${mine.city}` : `Spans ${unique(cities).join(', ')}`,
        ],
        match: sameCity ? 'good' : 'potential',
      });
    }
  }

  return chains.sort((a, b) => quality(b.match) - quality(a.match)).slice(0, maxChains);
}

/**
 * Who can answer a procurement request. Two conditions, same as a direct swap:
 * they can cover the need, and they want at least one of the several things the
 * request put on the table. Any one offer closing the deal is the point — it is
 * why a request reaches businesses a single listing never would.
 */
export function findRequestSwaps(request: SwapRequest, profile?: BusinessProfileData | null): SwapMatch[] {
  const mine = myParty(profile);

  return counterparties()
    .flatMap((party) => {
      const listing = party.listings.find(
        (item) =>
          containsTerm(item.category, request.needCategory) || containsTerm(item.title, request.needCategory),
      );
      if (!listing) return [];

      // The first offer they want closes it. A plain loop, because a `find`
      // that also assigns its reason out of scope is a trap for the next edit.
      let offer: SwapRequest['canOffer'][number] | undefined;
      let wanted: string | undefined;
      for (const candidate of request.canOffer) {
        const hit = party.wants.find((want) => containsTerm(candidate.label, want));
        if (hit) {
          offer = candidate;
          wanted = hit;
          break;
        }
      }
      if (!offer || !wanted) return [];

      const sameCity = containsTerm(party.city, mine.city);
      const trusted = party.trust === 'verified' || party.trust === 'proven';
      const reasons = [
        `They can cover your ${lower(request.needCategory)} requirement`,
        `They want ${lower(wanted)} — one of the things you offered instead of cash`,
        sameCity ? `Both in ${mine.city}` : `${party.city} — outside your city`,
      ];
      if (trusted) reasons.push('Registration verified');

      return [
        {
          id: `swap-request:${request.id}:${party.id}`,
          kind: 'direct' as const,
          swapKind: listing.kind,
          legs: [
            {
              fromId: mine.id,
              toId: party.id,
              gives: offer.label,
              kind: offer.kind,
              indicativeValue: offer.indicativeValue,
            },
            {
              fromId: party.id,
              toId: mine.id,
              gives: listing.title,
              kind: listing.kind,
              indicativeValue: listing.indicativeValue,
              listingId: listing.id,
            },
          ],
          reasons,
          match: sameCity && trusted ? 'strong' : sameCity ? 'good' : 'potential',
        } satisfies SwapMatch,
      ];
    })
    .sort((a, b) => quality(b.match) - quality(a.match));
}

export function findSwapMatches(profile?: BusinessProfileData | null): SwapMatch[] {
  return [
    ...findDirectSwaps(profile),
    ...findSwapChains(profile),
    ...mySwapRequests.flatMap((request) => findRequestSwaps(request, profile)),
  ];
}

export function findSwapMatch(id: string, profile?: BusinessProfileData | null): SwapMatch | undefined {
  return findSwapMatches(profile).find((match) => match.id === id);
}

/** The other side of a direct swap, or the businesses in a chain. */
export function otherParties(match: SwapMatch, profile?: BusinessProfileData | null): SwapParty[] {
  const ids = unique(match.legs.map((item) => item.fromId).filter((id) => id !== me.id));
  return ids.map((id) => partyById(id, profile)).filter((party): party is SwapParty => Boolean(party));
}

/** Every category, in the order they appear in filters and pickers. */
export const swapKinds: SwapKind[] = [
  'product',
  'service',
  'surplus',
  'capacity',
  'promotion',
  'space',
  'materials',
];

/** What one side is putting on the table. */
export const swapKindLabel: Record<SwapKind, string> = {
  product: 'Products',
  service: 'Services',
  surplus: 'Surplus stock',
  capacity: 'Spare capacity',
  promotion: 'Promotion',
  space: 'Space & equipment',
  materials: 'Raw materials',
};

/** The short form used on filter chips and pickers. */
export const swapKindShortLabel: Record<SwapKind, string> = {
  product: 'Products',
  service: 'Services',
  surplus: 'Surplus',
  capacity: 'Capacity',
  promotion: 'Promotion',
  space: 'Space',
  materials: 'Materials',
};

export const swapKindHelper: Record<SwapKind, string> = {
  product: 'Finished goods or stock you can hand over.',
  service: 'Work you perform — a shoot, a design, an audit.',
  surplus: 'Dead stock, overstock, seasonal leftovers, spare parts.',
  capacity: 'Capacity that expires unused — machine time, empty rooms, return trips.',
  promotion: 'Advertising, influencer reach, your audience or customer list.',
  space: 'Workspace, warehousing, machinery, vehicles, venues, studios.',
  materials: 'Raw inputs — fabric, leather, board, metal, agricultural produce.',
};

/**
 * Pairings are derived, never stored. Seven categories make forty-nine
 * combinations and not one of them needs a name of its own.
 */
export function pairLabel(legs: { kind: SwapKind }[]): string {
  if (legs.length > 2) return legs.map((item) => swapKindShortLabel[item.kind]).join(' → ');
  return legs.map((item) => swapKindLabel[item.kind]).join(' ↔ ');
}

function quality(value: SwapMatch['match']) {
  return value === 'strong' ? 2 : value === 'good' ? 1 : 0;
}

function unique(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function lower(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/* -------------------------------------------------------------------------
 * View models — screens render these, so the swap components stay free of
 * lookup logic.
 * ---------------------------------------------------------------------- */

export type SwapLegView = {
  from: SwapParty;
  to: SwapParty;
  gives: string;
  kind: SwapKind;
  indicativeValue?: string;
};

export type SwapSummary = {
  id: string;
  kind: SwapMatch['kind'];
  swapKind: SwapKind;
  match: SwapMatch['match'];
  /** What leaves your business, and what comes back to it. */
  youGive: string;
  youGet: string;
  youGiveValue?: string;
  youGetValue?: string;
  /**
   * Information only. Matching never gates on value parity — a swap is
   * negotiated, and each side prices its own half at cost, not retail.
   */
  balanceNote?: string;
  others: SwapParty[];
  legs: SwapLegView[];
  reasons: string[];
};

export function describeSwap(match: SwapMatch, profile?: BusinessProfileData | null): SwapSummary | undefined {
  const legs = match.legs.map((item) => {
    const from = partyById(item.fromId, profile);
    const to = partyById(item.toId, profile);
    return from && to
      ? { from, to, gives: item.gives, kind: item.kind, indicativeValue: item.indicativeValue }
      : undefined;
  });

  if (legs.some((item) => !item)) return undefined;
  const resolved = legs as SwapLegView[];
  const given = resolved.find((item) => item.from.id === me.id);
  const received = resolved.find((item) => item.to.id === me.id);

  return {
    id: match.id,
    kind: match.kind,
    swapKind: match.swapKind,
    match: match.match,
    youGive: given?.gives ?? '',
    youGet: received?.gives ?? '',
    youGiveValue: given?.indicativeValue,
    youGetValue: received?.indicativeValue,
    balanceNote: balanceNote(given?.indicativeValue, received?.indicativeValue),
    others: otherParties(match, profile),
    legs: resolved,
    reasons: match.reasons,
  };
}

/**
 * A plain read on the two indicative values, shown so both sides can see the
 * shape of the deal. It never filters anything out: an unequal swap is still a
 * swap if both sides want it.
 */
function balanceNote(give?: string, get?: string): string | undefined {
  const giveAmount = rupees(give);
  const getAmount = rupees(get);
  if (!giveAmount || !getAmount) return undefined;

  const ratio = giveAmount / getAmount;
  if (ratio > 1.25) return 'By the indicative values, you would be giving more.';
  if (ratio < 0.8) return 'By the indicative values, you would be getting more.';
  return 'The indicative values are roughly balanced.';
}

/** Reads Indian-grouped amounts such as "₹1,20,000 value". */
function rupees(value?: string) {
  const match = value?.match(/₹\s*([\d,]+)/);
  if (!match) return undefined;
  const amount = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export function describeSwaps(matches: SwapMatch[], profile?: BusinessProfileData | null): SwapSummary[] {
  return matches
    .map((match) => describeSwap(match, profile))
    .filter((summary): summary is SwapSummary => Boolean(summary));
}
