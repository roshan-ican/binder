import type { TrustSignal } from '../components/TrustBadge';
import { containsTerm } from './matching';
import {
  businesses,
  me,
  mySwapListings,
  swapListings,
  type BusinessProfileData,
  type SwapKind,
  type SwapLeg,
  type SwapListing,
  type SwapMatch,
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

function findGive(from: SwapParty, to: SwapParty): Give | null {
  for (const listing of from.listings) {
    const wanted = to.wants.find(
      (want) => containsTerm(listing.category, want) || containsTerm(listing.title, want),
    );
    if (wanted) return { leg: { gives: listing.title, listingId: listing.id }, kind: listing.kind, wanted };
  }

  for (const offer of from.gives) {
    const wanted = to.wants.find((want) => containsTerm(offer, want));
    if (wanted) return { leg: { gives: offer }, kind: 'service', wanted };
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

      chains.push({
        id: `swap-chain:${first.id}:${second.id}`,
        kind: 'chain',
        swapKind: secondGives.kind,
        legs: [leg(mine, first, iGive), leg(first, second, firstGives), leg(second, mine, secondGives)],
        reasons: [
          `A one-to-one swap with ${first.name} does not close — this loop does`,
          `Three businesses, no cash: you give ${lower(iGive.leg.gives)} and receive ${lower(secondGives.leg.gives)}`,
          sameCity ? `All three in ${mine.city}` : `Spans ${unique(cities).join(', ')}`,
        ],
        match: sameCity ? 'good' : 'potential',
      });
    }
  }

  return chains.sort((a, b) => quality(b.match) - quality(a.match)).slice(0, maxChains);
}

export function findSwapMatches(profile?: BusinessProfileData | null): SwapMatch[] {
  return [...findDirectSwaps(profile), ...findSwapChains(profile)];
}

export function findSwapMatch(id: string, profile?: BusinessProfileData | null): SwapMatch | undefined {
  return findSwapMatches(profile).find((match) => match.id === id);
}

/** The other side of a direct swap, or the businesses in a chain. */
export function otherParties(match: SwapMatch, profile?: BusinessProfileData | null): SwapParty[] {
  const ids = unique(match.legs.map((item) => item.fromId).filter((id) => id !== me.id));
  return ids.map((id) => partyById(id, profile)).filter((party): party is SwapParty => Boolean(party));
}

export const swapKindLabel: Record<SwapKind, string> = {
  service: 'Service swap',
  product: 'Product swap',
  value: 'Value swap',
};

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

export type SwapLegView = { from: SwapParty; to: SwapParty; gives: string };

export type SwapSummary = {
  id: string;
  kind: SwapMatch['kind'];
  swapKind: SwapKind;
  match: SwapMatch['match'];
  /** What leaves your business, and what comes back to it. */
  youGive: string;
  youGet: string;
  others: SwapParty[];
  legs: SwapLegView[];
  reasons: string[];
};

export function describeSwap(match: SwapMatch, profile?: BusinessProfileData | null): SwapSummary | undefined {
  const legs = match.legs.map((item) => {
    const from = partyById(item.fromId, profile);
    const to = partyById(item.toId, profile);
    return from && to ? { from, to, gives: item.gives } : undefined;
  });

  if (legs.some((item) => !item)) return undefined;
  const resolved = legs as SwapLegView[];

  return {
    id: match.id,
    kind: match.kind,
    swapKind: match.swapKind,
    match: match.match,
    youGive: resolved.find((item) => item.from.id === me.id)?.gives ?? '',
    youGet: resolved.find((item) => item.to.id === me.id)?.gives ?? '',
    others: otherParties(match, profile),
    legs: resolved,
    reasons: match.reasons,
  };
}

export function describeSwaps(matches: SwapMatch[], profile?: BusinessProfileData | null): SwapSummary[] {
  return matches
    .map((match) => describeSwap(match, profile))
    .filter((summary): summary is SwapSummary => Boolean(summary));
}
