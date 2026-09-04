import type { MatchQuality } from '../components/MatchLabel';
import type { TrustSignal } from '../components/TrustBadge';
import { keywordMatches, normalise, scoreToMatchQuality } from './matchHelpers';
import { me } from './mock';

export const SWAP_CATEGORIES = [
  'Materials',
  'Textiles',
  'Packaging',
  'Logistics',
  'Space',
  'Equipment',
  'Services',
  'Inventory',
] as const;

export type SwapCategory = (typeof SWAP_CATEGORIES)[number];

export type SwapAsset = {
  category: string;
  title: string;
  description: string;
  quantity?: string;
};

export type SwapListing = {
  id: string;
  businessId: string;
  business: string;
  businessCity: string;
  businessTrust: TrustSignal;
  offering: SwapAsset;
  seeking: SwapAsset;
  status: 'draft' | 'active' | 'closed' | 'expired';
  expiresIn: string;
  relevant: number;
  interested: number;
  connected: number;
};

export type SwapMatch = {
  id: string;
  kind: 'direct';
  quality: MatchQuality;
  reasons: string[];
  mine: SwapListing;
  theirs: SwapListing;
};

export type SwapChainMatch = {
  id: string;
  kind: 'chain';
  quality: MatchQuality;
  reasons: string[];
  loop: SwapListing[];
};

export const swapListings: SwapListing[] = [
  {
    id: 'my-fabric-for-boxes',
    businessId: 'me',
    business: me.business,
    businessCity: me.city,
    businessTrust: 'verified',
    offering: {
      category: 'Textiles',
      title: 'Leftover cotton fabric rolls',
      description: 'Roll-end cotton fabric offcuts from production, still usable for lining and small-batch runs.',
      quantity: '400 metres',
    },
    seeking: {
      category: 'Packaging',
      title: 'Garment boxes',
      description: 'Rigid garment boxes for finished stock, any neutral finish.',
    },
    status: 'active',
    expiresIn: '18 days',
    relevant: 6,
    interested: 2,
    connected: 0,
  },
  {
    id: 'my-space-for-freight',
    businessId: 'me',
    business: me.business,
    businessCity: me.city,
    businessTrust: 'verified',
    offering: {
      category: 'Space',
      title: 'Warehouse space, 2,000 sq ft',
      description: 'Spare storage bay near our unit, available most weekdays.',
    },
    seeking: {
      category: 'Logistics',
      title: 'Freight and delivery capacity',
      description: 'Regular delivery capacity on the Kanpur–Delhi route.',
    },
    status: 'active',
    expiresIn: '25 days',
    relevant: 4,
    interested: 1,
    connected: 0,
  },
  {
    id: 'my-draft-listing',
    businessId: 'me',
    business: me.business,
    businessCity: me.city,
    businessTrust: 'verified',
    offering: {
      category: 'Inventory',
      title: 'Surplus buttons and trims',
      description: 'Assorted buttons and trims left over from a discontinued line.',
    },
    seeking: {
      category: 'Services',
      title: 'Sample stitching support',
      description: 'Occasional overflow stitching for sample runs.',
    },
    status: 'draft',
    expiresIn: '—',
    relevant: 0,
    interested: 0,
    connected: 0,
  },
  {
    id: 'meridian-boxes-for-fabric',
    businessId: 'meridian-pack',
    business: 'Meridian Packaging',
    businessCity: 'Kanpur',
    businessTrust: 'proven',
    offering: {
      category: 'Packaging',
      title: 'Surplus garment boxes',
      description: 'Overrun rigid garment boxes from a cancelled order, matte black finish.',
      quantity: '3,000 units',
    },
    seeking: {
      category: 'Textiles',
      title: 'Cotton fabric offcuts',
      description: 'Cotton fabric scraps for internal padding and sample work.',
    },
    status: 'active',
    expiresIn: '20 days',
    relevant: 5,
    interested: 2,
    connected: 0,
  },
  {
    id: 'shakti-freight-for-crates',
    businessId: 'shakti-logistics',
    business: 'Shakti Logistics',
    businessCity: 'Lucknow',
    businessTrust: 'verified',
    offering: {
      category: 'Logistics',
      title: 'Spare freight capacity, Kanpur–Delhi route',
      description: 'Part-load truck capacity on our regular Delhi route, twice weekly.',
    },
    seeking: {
      category: 'Packaging',
      title: 'Packaging crates',
      description: 'Durable crates for our own warehouse dispatch.',
    },
    status: 'active',
    expiresIn: '14 days',
    relevant: 3,
    interested: 1,
    connected: 0,
  },
  {
    id: 'city-fabric-crates-for-space',
    businessId: 'city-fabric-house',
    business: 'City Fabric House',
    businessCity: 'Kanpur',
    businessTrust: 'documents',
    offering: {
      category: 'Packaging',
      title: 'Surplus packaging crates',
      description: 'Spare wooden and plastic crates from a closed retail line.',
    },
    seeking: {
      category: 'Space',
      title: 'Warehouse storage space',
      description: 'Short-term storage space for seasonal stock.',
    },
    status: 'active',
    expiresIn: '10 days',
    relevant: 2,
    interested: 0,
    connected: 0,
  },
  {
    id: 'abc-leather-offcuts',
    businessId: 'abc-leather',
    business: 'ABC Leather Works',
    businessCity: 'Kanpur',
    businessTrust: 'verified',
    offering: {
      category: 'Materials',
      title: 'Leather offcuts and scrap',
      description: 'Usable leather offcuts from jacket production.',
    },
    seeking: {
      category: 'Equipment',
      title: 'Spare stitching machines',
      description: 'A couple of spare industrial stitching machines for a new line.',
    },
    status: 'active',
    expiresIn: '9 days',
    relevant: 1,
    interested: 0,
    connected: 0,
  },
];

export const mySwapListings = swapListings.filter((listing) => listing.businessId === 'me');

function legScore(offer: SwapAsset, need: SwapAsset) {
  const categoryMatch = normalise(offer.category) === normalise(need.category);
  const keywordHits = keywordMatches(`${offer.title} ${offer.description}`, [
    normalise(need.category),
    ...normalise(need.title).split(' '),
  ]);
  return { score: (categoryMatch ? 50 : 0) + keywordHits * 10, categoryMatch };
}

export function findDirectSwapMatches(mine: SwapListing[], all: SwapListing[]): SwapMatch[] {
  const others = all.filter((listing) => listing.status === 'active' && listing.businessId !== 'me');
  const results: SwapMatch[] = [];

  for (const mineListing of mine.filter((listing) => listing.status === 'active')) {
    for (const theirs of others) {
      const mineGivesThem = legScore(mineListing.offering, theirs.seeking);
      const themGiveMine = legScore(theirs.offering, mineListing.seeking);
      if (!mineGivesThem.categoryMatch || !themGiveMine.categoryMatch) continue;

      const sameCity = normalise(mineListing.businessCity) === normalise(theirs.businessCity) ? 20 : 0;
      results.push({
        id: `match:${mineListing.id}:${theirs.id}`,
        kind: 'direct',
        quality: scoreToMatchQuality(mineGivesThem.score + themGiveMine.score + sameCity),
        reasons: buildDirectReasons(mineListing, theirs),
        mine: mineListing,
        theirs,
      });
    }
  }

  return results;
}

function buildDirectReasons(mine: SwapListing, theirs: SwapListing): string[] {
  const reasons = [
    `${theirs.business} offers ${theirs.offering.title.toLowerCase()} — matches what you're seeking (${mine.seeking.category}).`,
    `You offer ${mine.offering.title.toLowerCase()} — matches what ${theirs.business} is seeking (${theirs.seeking.category}).`,
  ];
  if (normalise(mine.businessCity) === normalise(theirs.businessCity)) {
    reasons.push(`Same city — easy handover in ${mine.businessCity}.`);
  }
  return reasons;
}

export function findSwapChains(mine: SwapListing[], all: SwapListing[]): SwapChainMatch[] {
  const others = all.filter((listing) => listing.status === 'active' && listing.businessId !== 'me');
  const results: SwapChainMatch[] = [];

  for (const mineListing of mine.filter((listing) => listing.status === 'active')) {
    for (const b of others) {
      const bGivesMine = legScore(b.offering, mineListing.seeking);
      if (!bGivesMine.categoryMatch) continue;

      for (const c of others) {
        if (c.id === b.id) continue;
        const cGivesB = legScore(c.offering, b.seeking);
        if (!cGivesB.categoryMatch) continue;
        const mineGivesC = legScore(mineListing.offering, c.seeking);
        if (!mineGivesC.categoryMatch) continue;

        const loop = [mineListing, b, c];
        results.push({
          id: `chain:${mineListing.id}:${b.id}:${c.id}`,
          kind: 'chain',
          quality: scoreToMatchQuality((bGivesMine.score + cGivesB.score + mineGivesC.score) / 3),
          reasons: buildChainReasons(loop),
          loop,
        });
      }
    }
  }

  return results;
}

function buildChainReasons(loop: SwapListing[]): string[] {
  return loop.map((receiver, index) => {
    const giver = loop[(index + 1) % loop.length];
    return `${giver.business} gives ${giver.offering.title.toLowerCase()} to ${receiver.business}, covering their need for ${receiver.seeking.category.toLowerCase()}.`;
  });
}
