import type { MatchQuality } from '../components/MatchLabel';
import type { TrustSignal } from '../components/TrustBadge';

export type Business = {
  id: string;
  name: string;
  category: BusinessCategory;
  role: string;
  city: string;
  region: string;
  capability: string;
  activity: string;
  trust?: TrustSignal;
  match?: MatchQuality;
  about: string;
  offers: string[];
  moq: string;
  capacity: string;
  serves: string[];
  whyItMatches: string[];
  /** SWAP — optional so existing rows and call sites stay valid. */
  swapOpen?: boolean;
  swapWants?: string[];
  swapOffers?: string[];
};

export type BusinessCategory = 'manufacturer' | 'shopkeeper' | 'supplier' | 'service';

export type Enquiry = {
  id: string;
  title: string;
  location: string;
  neededBy: string;
  quantity: string;
  budget: string;
  fitNote: string;
  buyer: string;
  buyerTrust: TrustSignal;
  match?: MatchQuality;
  whyItFits: string[];
  status: 'draft' | 'active' | 'closed' | 'expired';
  relevant: number;
  interested: number;
  connected: number;
  expiresIn: string;
};

export type UserRole = 'business' | 'job-seeker';

export type BusinessProfileData = {
  gstin?: string;
  businessName: string;
  contactName: string;
  industry: string;
  industries: string[];
  city: string;
  offers: string[];
  needs: string[];
  verificationStatus: 'unverified' | 'verified';
  /** SWAP — mirrors offers/needs so the profile screens stay consistent. */
  swapOpen?: boolean;
  swapWants?: string[];
  swapOffers?: string[];
};

export type JobSeekerProfileData = {
  fullName: string;
  email: string;
  city: string;
  headline: string;
  professionId: string;
  skillIds: string[];
  desiredRoleIds: string[];
  linkedInUrl?: string;
  emailVerified: boolean;
};

export type JobOpportunity = {
  id: string;
  jobType: JobType;
  title: string;
  company: string;
  city: string;
  region: string;
  salary: string;
  workType: string;
  fitNote: string;
  activity: string;
  trust: TrustSignal;
  match?: MatchQuality;
  whyItFits: string[];
  professionId: string;
  roleId: string;
  requiredSkillIds: string[];
};

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';

export const me = {
  id: 'me',
  business: 'Roshan Clothing',
  person: 'Roshan',
  industry: 'Fashion & Apparel',
  industries: ['Fashion & Apparel', 'Textiles'],
  city: 'Kanpur',
  region: 'Uttar Pradesh, India',
  offers: ['Manufacturer', 'Distributor'],
  needs: ['Packaging', 'Logistics'],
  completeness: 72,
  swapOpen: true,
  swapWants: [
    'Photography',
    'Packaging',
    'Catering',
    'Fabric',
    'Job work',
    'Audience',
    'Campaign',
    'Printing',
    'Leather',
    'Accommodation',
    'Warehouse space',
    'Accounts',
  ],
  swapOffers: ['Clothing', 'Promotion', 'Content collaboration', 'Surplus stock'],
};

export const candidate = {
  person: 'Roshan',
  headline: 'Production and sourcing candidate',
  city: 'Kanpur',
  region: 'Uttar Pradesh, India',
  skills: ['Manufacturing', 'Sourcing', 'Quality control'],
  seeking: ['Production roles', 'Buyer coordination'],
  completeness: 64,
};

export const businesses: Business[] = [
  {
    id: 'abc-leather',
    name: 'ABC Leather Works',
    category: 'manufacturer',
    role: 'Manufacturer',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Leather manufacturing · MOQ 500',
    activity: 'Active today',
    trust: 'verified',
    match: 'strong',
    about:
      'Leather jacket and outerwear manufacturing since 1998. Job work and full production runs for domestic brands and export houses.',
    offers: ['Manufacturer', 'Job work'],
    moq: '500 units',
    capacity: '30,000 / month',
    serves: ['India', 'UAE'],
    whyItMatches: [
      'Leather manufacturing',
      'MOQ supports your 500-unit requirement',
      'Serves your location',
      'Active this week',
      'Registration verified',
    ],
    swapOpen: true,
    swapWants: ['Fabric', 'Logistics'],
    swapOffers: ['Job work', 'Leather manufacturing'],
  },
  {
    id: 'northline-tanners',
    name: 'Northline Tanners',
    category: 'supplier',
    role: 'Supplier',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Finished leather · MOQ 200 m',
    activity: 'Active 2 days ago',
    trust: 'documents',
    match: 'good',
    about: 'Finished and semi-finished leather supply, vegetable and chrome tanned.',
    offers: ['Raw materials', 'Supplier'],
    moq: '200 metres',
    capacity: '80,000 m / month',
    serves: ['India'],
    whyItMatches: ['Supplies leather in your region', 'MOQ within your range', 'Documents provided'],
    swapOpen: true,
    swapWants: ['Clothing', 'Promotion'],
    swapOffers: ['Finished leather', 'Raw materials'],
  },
  {
    id: 'meridian-pack',
    name: 'Meridian Packaging',
    category: 'supplier',
    role: 'Packaging',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Garment boxes · MOQ 5,000',
    activity: 'Active today',
    trust: 'proven',
    match: 'strong',
    about: 'Corrugated and rigid garment packaging, printing in-house.',
    offers: ['Packaging'],
    moq: '5,000 units',
    capacity: '400,000 / month',
    serves: ['India'],
    whyItMatches: ['Garment packaging capability', 'Same city', 'Completed dealings on Binder'],
    swapOpen: true,
    swapWants: ['Clothing', 'Promotion'],
    swapOffers: ['Packaging'],
  },
  {
    id: 'shakti-logistics',
    name: 'Shakti Logistics',
    category: 'service',
    role: 'Logistics',
    city: 'Lucknow',
    region: 'Uttar Pradesh',
    capability: 'FTL & part load · North India',
    activity: 'Active this week',
    trust: 'verified',
    match: 'potential',
    about: 'Road freight across North India with warehousing at Lucknow and Delhi.',
    offers: ['Logistics'],
    moq: 'No minimum',
    capacity: '120 vehicles',
    serves: ['North India'],
    whyItMatches: ['Serves your route', 'Registration verified'],
    swapOpen: true,
    swapWants: ['Promotion', 'Warehouse space'],
    swapOffers: ['Logistics', 'Freight'],
  },
  {
    id: 'city-fabric-house',
    name: 'City Fabric House',
    category: 'shopkeeper',
    role: 'Shopkeeper',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Retail fabrics · daily stock',
    activity: 'Open today',
    trust: 'documents',
    match: 'good',
    about: 'Neighbourhood fabric shop with cotton, denim, lining and seasonal garment material.',
    offers: ['Retail supply', 'Shopkeeper'],
    moq: 'No minimum',
    capacity: 'Daily retail stock',
    serves: ['Kanpur'],
    whyItMatches: ['Same city', 'Low quantity purchases', 'Documents provided'],
    swapOpen: true,
    swapWants: ['Photography', 'Promotion'],
    swapOffers: ['Fabric', 'Retail shelf space', 'Surplus stock'],
  },
  {
    id: 'lens-forty-two',
    name: 'Lens Forty Two',
    category: 'service',
    role: 'Photographer',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Product & campaign photography',
    activity: 'Active today',
    trust: 'verified',
    match: 'strong',
    about: 'Product, lookbook and campaign photography for apparel and lifestyle brands. In-house studio with two shooting bays.',
    offers: ['Photography', 'Content'],
    moq: 'No minimum',
    capacity: '8 shoots / month',
    serves: ['Uttar Pradesh', 'Delhi'],
    whyItMatches: ['Shoots apparel products', 'Same city', 'Registration verified'],
    swapOpen: true,
    swapWants: ['Clothing', 'Studio equipment', 'Catering'],
    swapOffers: ['Photography', 'Campaign shoots', 'Content collaboration'],
  },
  {
    id: 'copperleaf-cafe',
    name: 'Copperleaf Café',
    category: 'service',
    role: 'Café & catering',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Catering · 20 to 200 covers',
    activity: 'Open today',
    trust: 'documents',
    match: 'good',
    about: 'Neighbourhood café running daily service plus event catering for offices, launches and shoots.',
    offers: ['Catering', 'Event space'],
    moq: '20 covers',
    capacity: '200 covers / day',
    serves: ['Kanpur'],
    whyItMatches: ['Caters events in your city', 'Same city', 'Documents provided'],
    swapOpen: true,
    swapWants: ['Uniforms', 'Photography', 'Promotion'],
    swapOffers: ['Catering', 'Event space', 'Café audience'],
  },
  {
    id: 'pulse-fitness',
    name: 'Pulse Fitness Club',
    category: 'service',
    role: 'Gym',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: '2,000 members · 3 branches',
    activity: 'Active today',
    trust: 'verified',
    match: 'good',
    about: 'Three-branch fitness club with 2,000 active members and an in-club screen and email channel.',
    offers: ['Member audience', 'In-club promotion'],
    moq: 'No minimum',
    capacity: '2,000 members',
    serves: ['Kanpur'],
    whyItMatches: ['Audience overlaps your customer', 'Same city', 'Registration verified'],
    swapOpen: true,
    swapWants: ['Merchandise', 'Clothing', 'Catering'],
    swapOffers: ['Audience', 'In-club promotion', 'Member discounts'],
  },
  {
    id: 'grand-mercer-hotel',
    name: 'Grand Mercer Hotel',
    category: 'service',
    role: 'Hotel',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: '64 rooms · midweek availability',
    activity: 'Active today',
    trust: 'verified',
    match: 'good',
    about: 'Business hotel near the industrial belt. Midweek occupancy runs low and those rooms expire unsold every night.',
    offers: ['Accommodation', 'Event space'],
    moq: '1 night',
    capacity: '64 rooms',
    serves: ['Kanpur'],
    whyItMatches: ['Hosts your visiting buyers', 'Same city', 'Registration verified'],
    swapOpen: true,
    swapWants: ['Clothing', 'Promotion', 'Uniforms'],
    swapOffers: ['Accommodation', 'Empty midweek rooms', 'Event space'],
  },
  {
    id: 'northbeam-agency',
    name: 'Northbeam Agency',
    category: 'service',
    role: 'Marketing agency',
    city: 'Lucknow',
    region: 'Uttar Pradesh',
    capability: 'Campaigns & influencer marketing',
    activity: 'Active today',
    trust: 'documents',
    match: 'good',
    about: 'Performance and influencer campaigns for consumer brands. Takes part payment in stock from labels it believes in.',
    offers: ['Advertising', 'Influencer marketing'],
    moq: 'One campaign',
    capacity: '6 clients',
    serves: ['North India'],
    whyItMatches: ['Runs campaigns for apparel labels', 'Accepts stock as part payment', 'Documents provided'],
    swapOpen: true,
    swapWants: ['Surplus stock', 'Clothing', 'Content collaboration'],
    swapOffers: ['Campaign', 'Advertising', 'Influencer marketing'],
  },
  {
    id: 'harbour-associates',
    name: 'Harbour Associates',
    category: 'service',
    role: 'Chartered accountants',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Books, GST & compliance',
    activity: 'Active this week',
    trust: 'verified',
    match: 'potential',
    about: 'Small practice handling books, GST filing and compliance for manufacturers and retailers.',
    offers: ['Accounting', 'Compliance'],
    moq: 'Monthly retainer',
    capacity: '40 clients',
    serves: ['Uttar Pradesh'],
    whyItMatches: ['Handles GST for manufacturers', 'Same city', 'Registration verified'],
    swapOpen: true,
    swapWants: ['Content collaboration', 'Photography', 'Campaign'],
    swapOffers: ['Accounts', 'GST filing', 'Compliance'],
  },
  {
    id: 'northgate-works',
    name: 'Northgate Works',
    category: 'service',
    role: 'Warehouse & studio space',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Storage bays & a shoot floor',
    activity: 'Active today',
    trust: 'documents',
    match: 'good',
    about: 'Converted mill offering storage bays, a photography floor and meeting rooms on flexible terms.',
    offers: ['Warehousing', 'Studio hire'],
    moq: 'One week',
    capacity: '12 bays',
    serves: ['Kanpur'],
    whyItMatches: ['Storage near your unit', 'Same city', 'Documents provided'],
    swapOpen: true,
    swapWants: ['Promotion', 'Clothing', 'Catering'],
    swapOffers: ['Warehouse space', 'Studio floor', 'Meeting rooms'],
  },
  {
    id: 'crestline-press',
    name: 'Crestline Print Works',
    category: 'manufacturer',
    role: 'Printing press',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    capability: 'Screen & DTG printing on garments',
    activity: 'Active today',
    trust: 'proven',
    match: 'good',
    about: 'Garment screen and direct-to-garment printing. Two of five machines sit idle most weeks.',
    offers: ['Garment printing'],
    moq: '100 pieces',
    capacity: '5 machines',
    serves: ['Uttar Pradesh'],
    whyItMatches: ['Prints on garments', 'Same city', 'Completed dealings on Binder'],
    swapOpen: true,
    swapWants: ['Fabric', 'Blank garments'],
    swapOffers: ['Printing', 'Press time'],
  },
];

export const opportunities: Enquiry[] = [
  {
    id: 'urbanwear-jackets',
    title: '500 leather jackets',
    location: 'Delhi',
    neededBy: '18 Oct 2026',
    quantity: '500 units',
    budget: '₹900–₹1,200 / unit',
    fitNote: 'MOQ compatible',
    buyer: 'UrbanWear',
    buyerTrust: 'verified',
    match: 'strong',
    whyItFits: ['MOQ compatible', 'Leather capability', 'Same region'],
    status: 'active',
    relevant: 14,
    interested: 5,
    connected: 2,
    expiresIn: '22 days',
  },
  {
    id: 'kraft-totes',
    title: '2,000 canvas totes',
    location: 'Jaipur',
    neededBy: '02 Nov 2026',
    quantity: '2,000 units',
    budget: '₹180–₹240 / unit',
    fitNote: 'Above your usual MOQ',
    buyer: 'Kraft & Co',
    buyerTrust: 'documents',
    match: 'good',
    whyItFits: ['Apparel manufacturing', 'Serves North India'],
    status: 'active',
    relevant: 9,
    interested: 3,
    connected: 1,
    expiresIn: '30 days',
  },
  {
    id: 'atelier-belts',
    title: '1,200 leather belts',
    location: 'Kanpur',
    neededBy: '25 Sep 2026',
    quantity: '1,200 units',
    budget: '₹260–₹320 / unit',
    fitNote: 'MOQ compatible',
    buyer: 'Atelier Nine',
    buyerTrust: 'verified',
    match: 'strong',
    whyItFits: ['Leather capability', 'Same city', 'Deadline within capacity'],
    status: 'active',
    relevant: 11,
    interested: 4,
    connected: 0,
    expiresIn: '12 days',
  },
];

export const myEnquiries: Enquiry[] = [
  {
    id: 'my-packaging',
    title: '10,000 garment boxes',
    location: 'Kanpur',
    neededBy: '18 Oct 2026',
    quantity: '10,000 units',
    budget: '₹18–₹26 / unit',
    fitNote: 'Printing required',
    buyer: me.business,
    buyerTrust: 'verified',
    status: 'active',
    relevant: 14,
    interested: 5,
    connected: 2,
    expiresIn: '22 days',
    whyItFits: [],
  },
  {
    id: 'my-logistics',
    title: 'Monthly freight to Delhi',
    location: 'Kanpur',
    neededBy: 'Ongoing',
    quantity: '8 trips / month',
    budget: '₹14,000 / trip',
    fitNote: 'Part load acceptable',
    buyer: me.business,
    buyerTrust: 'verified',
    status: 'draft',
    relevant: 0,
    interested: 0,
    connected: 0,
    expiresIn: '—',
    whyItFits: [],
  },
];

export const jobOpportunities: JobOpportunity[] = [
  {
    id: 'production-supervisor',
    jobType: 'full-time',
    title: 'Production Supervisor',
    company: 'ABC Leather Works',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    salary: '₹38,000–₹52,000 / month',
    workType: 'Full-time',
    fitNote: 'Strong skill match',
    activity: 'Posted today',
    trust: 'verified',
    match: 'strong',
    whyItFits: ['Leather manufacturing experience', 'Same city', 'Quality control background'],
    professionId: 'manufacturing-production',
    roleId: 'production-supervisor',
    requiredSkillIds: ['manufacturing', 'production-planning', 'quality-control', 'team-leadership'],
  },
  {
    id: 'buyer-coordinator',
    jobType: 'full-time',
    title: 'Buyer Coordinator',
    company: 'Meridian Packaging',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    salary: '₹30,000–₹44,000 / month',
    workType: 'Full-time',
    fitNote: 'Relevant operations role',
    activity: 'Active today',
    trust: 'proven',
    match: 'good',
    whyItFits: ['Buyer follow-up', 'Vendor coordination', 'Local commute'],
    professionId: 'sourcing-procurement',
    roleId: 'buyer-coordinator',
    requiredSkillIds: ['buyer-coordination', 'vendor-management', 'operations'],
  },
  {
    id: 'sourcing-associate',
    jobType: 'contract',
    title: 'Sourcing Associate',
    company: 'Northline Tanners',
    city: 'Lucknow',
    region: 'Uttar Pradesh',
    salary: '₹28,000–₹36,000 / month',
    workType: 'Hybrid',
    fitNote: 'Potential match',
    activity: 'Posted 2 days ago',
    trust: 'documents',
    match: 'potential',
    whyItFits: ['Supplier sourcing', 'North India network', 'Documents provided'],
    professionId: 'sourcing-procurement',
    roleId: 'sourcing-associate',
    requiredSkillIds: ['sourcing', 'vendor-management', 'buyer-coordination'],
  },
  {
    id: 'quality-check-intern',
    jobType: 'internship',
    title: 'Quality Check Intern',
    company: 'City Fabric House',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    salary: '₹8,000–₹12,000 / month',
    workType: 'Internship',
    fitNote: 'Good entry point',
    activity: 'Posted today',
    trust: 'documents',
    match: 'good',
    whyItFits: ['Quality control interest', 'Same city', 'Retail fabric exposure'],
    professionId: 'quality-compliance',
    roleId: 'quality-check-intern',
    requiredSkillIds: ['quality-control', 'manufacturing'],
  },
  {
    id: 'inventory-assistant',
    jobType: 'part-time',
    title: 'Inventory Assistant',
    company: 'Meridian Packaging',
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    salary: '₹12,000–₹18,000 / month',
    workType: 'Part-time',
    fitNote: 'Nearby operations role',
    activity: 'Active today',
    trust: 'proven',
    match: 'potential',
    whyItFits: ['Inventory work', 'Local commute', 'Flexible hours'],
    professionId: 'operations-administration',
    roleId: 'inventory-assistant',
    requiredSkillIds: ['inventory-management', 'operations', 'warehouse-operations'],
  },
];

export type Conversation = {
  id: string;
  business: string;
  preview: string;
  time: string;
  unread: boolean;
  context: string;
  messages: { id: string; from: 'them' | 'me'; body: string; time: string }[];
};

export const conversations: Conversation[] = [
  {
    id: 'abc-leather',
    business: 'ABC Leather Works',
    preview: 'Can handle 500 units by 18 Oct...',
    time: '2m',
    unread: true,
    context: '500 leather jackets',
    messages: [
      { id: '1', from: 'them', body: 'We can handle 500 units by 18 Oct. Sending the rate card now.', time: '09:12' },
      { id: '2', from: 'me', body: 'Good. What is the lead time if we go to 800 units?', time: '09:20' },
      { id: '3', from: 'them', body: 'Three extra working days. Same rate above 750.', time: '09:24' },
    ],
  },
  {
    id: 'swap-lens-forty-two',
    business: 'Lens Forty Two',
    preview: 'Happy to shoot the winter line in exchange for jackets.',
    time: '15m',
    unread: true,
    context: 'Swap · Photography ↔ Clothing',
    messages: [
      { id: '1', from: 'them', body: 'Happy to shoot the winter line in exchange for jackets.', time: '11:02' },
      { id: '2', from: 'me', body: 'Works for us. Four jackets against a full product day?', time: '11:09' },
      { id: '3', from: 'them', body: 'Make it five and I will include the retouching.', time: '11:14' },
    ],
  },
  {
    id: 'meridian-pack',
    business: 'Meridian Packaging',
    preview: 'Sharing the box spec sheet.',
    time: '1h',
    unread: false,
    context: '10,000 garment boxes',
    messages: [
      { id: '1', from: 'them', body: 'Sharing the box spec sheet.', time: 'Yesterday' },
      { id: '2', from: 'me', body: 'Received. We need a 4-colour print on the lid.', time: 'Yesterday' },
    ],
  },
];

export const jobSeekerConversations: Conversation[] = [
  {
    id: 'job-abc-leather',
    business: 'ABC Leather Works',
    preview: 'Can you come in for a production supervisor interview tomorrow?',
    time: '8m',
    unread: true,
    context: 'Production Supervisor application',
    messages: [
      {
        id: '1',
        from: 'them',
        body: 'We reviewed your profile for the Production Supervisor role.',
        time: '10:04',
      },
      {
        id: '2',
        from: 'them',
        body: 'Can you come in for an interview tomorrow afternoon?',
        time: '10:06',
      },
      {
        id: '3',
        from: 'me',
        body: 'Yes. Please share the location and time.',
        time: '10:11',
      },
    ],
  },
  {
    id: 'job-meridian-pack',
    business: 'Meridian Packaging',
    preview: 'Your buyer coordination experience looks relevant.',
    time: '2h',
    unread: false,
    context: 'Buyer Coordinator application',
    messages: [
      {
        id: '1',
        from: 'them',
        body: 'Your buyer coordination experience looks relevant for this opening.',
        time: 'Yesterday',
      },
      {
        id: '2',
        from: 'me',
        body: 'I can share references from my last production role.',
        time: 'Yesterday',
      },
    ],
  },
];

export const notifications = [
  { id: '1', group: 'Today', title: 'New enquiry matches what you offer', body: '500 leather jackets · Delhi', time: '2h' },
  { id: '2', group: 'Today', title: 'ABC Leather accepted your connection', body: 'Discussing 500 leather jackets', time: '5h' },
  { id: '3', group: 'Earlier', title: 'Meridian Packaging is interested', body: '10,000 garment boxes', time: '2d' },
];

export const searchSuggestions = ['Manufacturer', 'Leather', 'Job work', 'Apparel'];
export const recentSearches = ['Packaging Kanpur', 'Leather manufacturers'];

/* ---------------------------------------------------------------------------
 * SWAP
 *
 * Binder's exchange layer. A business says what it can offer and what it wants,
 * and value moves without cash having to. Three kinds:
 *   service — photographer ↔ clothing brand
 *   product — café uniforms ↔ catering
 *   value   — a gym's 2,000 members ↔ member discounts and promotion
 * ------------------------------------------------------------------------ */

/**
 * What a listing *is*. Pairings — product↔service, service↔service and the rest
 * — are derived from the two sides of a match, never stored: seven categories
 * make forty-nine combinations, and none of them need a name of their own.
 *
 * `surplus` deliberately overlaps `product` and `materials`. The difference is
 * intent: surplus means "I want this gone", which is a different negotiating
 * posture and one of SWAP's strongest cases.
 */
export type SwapKind =
  | 'product'
  | 'service'
  | 'surplus'
  | 'capacity'
  | 'promotion'
  | 'space'
  | 'materials';

/** What a business puts on the table. Wants live on the business itself. */
export type SwapListing = {
  id: string;
  businessId: string;
  kind: SwapKind;
  title: string;
  description: string;
  /** Indicative only — a swap is negotiated, never priced by Binder. */
  indicativeValue: string;
  category: string;
};

/** One movement of value: `fromId` gives `gives` to `toId`. */
export type SwapLeg = {
  fromId: string;
  toId: string;
  gives: string;
  /** The category of the thing moving. Pairings are derived from these. */
  kind: SwapKind;
  indicativeValue?: string;
  listingId?: string;
};

export type SwapMatch = {
  id: string;
  kind: 'direct' | 'chain';
  /** The category you receive — what the Swaps filter works on. */
  swapKind: SwapKind;
  /** Two legs for a direct swap, three for a chain. Always a closed loop. */
  legs: SwapLeg[];
  reasons: string[];
  match: MatchQuality;
};

export type SwapProposal = {
  id: string;
  headline: string;
  counterparties: string;
  /** Same status language as enquiries. */
  status: 'draft' | 'active' | 'closed' | 'expired';
  updated: string;
};

export const swapListings: SwapListing[] = [
  {
    id: 'lens-product-shoot',
    businessId: 'lens-forty-two',
    kind: 'service',
    title: 'Product photography package',
    description: 'Full day in studio, up to 40 products, retouched exports for web and print.',
    indicativeValue: '₹25,000 package',
    category: 'Photography',
  },
  {
    id: 'lens-campaign',
    businessId: 'lens-forty-two',
    kind: 'service',
    title: 'Campaign shoot with model',
    description: 'Half-day campaign shoot, one model and stylist included, 12 final frames.',
    indicativeValue: '₹40,000 package',
    category: 'Photography',
  },
  {
    id: 'copperleaf-catering',
    businessId: 'copperleaf-cafe',
    kind: 'service',
    title: 'Event catering for 50',
    description: 'Catering for a launch or shoot day — 50 covers, service staff included.',
    indicativeValue: '₹18,000 value',
    category: 'Catering',
  },
  {
    id: 'meridian-box-run',
    businessId: 'meridian-pack',
    kind: 'product',
    title: 'Garment box production run',
    description: '1,000 printed rigid garment boxes from an existing die, four-colour lid.',
    indicativeValue: '₹22,000 value',
    category: 'Packaging',
  },
  {
    id: 'pulse-member-access',
    businessId: 'pulse-fitness',
    kind: 'promotion',
    title: 'Access to 2,000 members',
    description: 'One campaign across three branches: in-club screens, email list and a sampling table.',
    indicativeValue: '2,000 member audience',
    category: 'Audience',
  },
  {
    id: 'city-fabric-lots',
    businessId: 'city-fabric-house',
    kind: 'surplus',
    title: 'Seasonal fabric lots',
    description: 'End-of-season cotton and denim lots, sorted and ready to move.',
    indicativeValue: '₹15,000 value',
    category: 'Fabric',
  },
  {
    id: 'abc-job-work',
    businessId: 'abc-leather',
    kind: 'service',
    title: 'Job work capacity',
    description: 'One week of stitching line capacity on outerwear, cut pieces supplied by you.',
    indicativeValue: '₹40,000 value',
    category: 'Job work',
  },
  {
    id: 'shakti-freight',
    businessId: 'shakti-logistics',
    kind: 'capacity',
    title: 'Part-load freight, North India',
    description: 'Four part-load trips on the Kanpur–Delhi route, insured, within the month.',
    indicativeValue: '₹32,000 value',
    category: 'Logistics',
  },
  {
    id: 'mercer-midweek-rooms',
    businessId: 'grand-mercer-hotel',
    kind: 'capacity',
    title: 'Ten midweek room nights',
    description: 'Tuesday to Thursday rooms that would otherwise go unsold, for visiting buyers or your team.',
    indicativeValue: '₹38,000 value',
    category: 'Accommodation',
  },
  {
    id: 'northbeam-campaign',
    businessId: 'northbeam-agency',
    kind: 'promotion',
    title: 'One-month influencer campaign',
    description: 'Four creators, brief to delivery, plus paid amplification on the two best performing posts.',
    indicativeValue: '₹85,000 value',
    category: 'Campaign',
  },
  {
    id: 'harbour-books',
    businessId: 'harbour-associates',
    kind: 'service',
    title: 'A year of books and GST filing',
    description: 'Monthly bookkeeping, GST returns and annual filing for a single-unit manufacturer.',
    indicativeValue: '₹60,000 value',
    category: 'Accounts',
  },
  {
    id: 'northgate-bay',
    businessId: 'northgate-works',
    kind: 'space',
    title: 'A storage bay for six months',
    description: 'One 600 sq ft bay with loading access, plus two days a month on the shoot floor.',
    indicativeValue: '₹90,000 value',
    category: 'Warehouse space',
  },
  {
    id: 'crestline-press-time',
    businessId: 'crestline-press',
    kind: 'capacity',
    title: 'Idle press time, 2,000 pieces',
    description: 'Screen printing on garments you supply, run on the machines that sit idle midweek.',
    indicativeValue: '₹45,000 value',
    category: 'Printing',
  },
  {
    id: 'northline-leather-lot',
    businessId: 'northline-tanners',
    kind: 'materials',
    title: 'Finished leather, 400 metres',
    description: 'Vegetable-tanned finished leather in three colourways, ready to cut.',
    indicativeValue: '₹1,20,000 value',
    category: 'Leather',
  },
  {
    id: 'abc-spare-parts',
    businessId: 'abc-leather',
    kind: 'surplus',
    title: 'Spare machine parts and trims',
    description: 'Surplus buckles, zips and stitching machine parts from a line we retired.',
    indicativeValue: '₹12,000 value',
    category: 'Trims',
  },
];

/** What the user can put on the table. Mirrors `me.swapOffers`. */
export const mySwapListings: SwapListing[] = [
  {
    id: 'my-clothing-lot',
    businessId: me.id,
    kind: 'product',
    title: 'Outerwear from the current line',
    description: 'Jackets and overshirts from the running collection, your pick of sizes.',
    indicativeValue: '₹30,000 retail value',
    category: 'Clothing',
  },
  {
    id: 'my-promotion',
    businessId: me.id,
    kind: 'promotion',
    title: 'Promotion to our customer list',
    description: 'A feature in our newsletter and two stories to 14,000 followers.',
    indicativeValue: '14,000 reach',
    category: 'Promotion',
  },
  {
    id: 'my-content',
    businessId: me.id,
    kind: 'service',
    title: 'Co-branded content production',
    description: 'We shoot, write and produce a content series with you and run it on both channels.',
    indicativeValue: '₹55,000 value',
    category: 'Content collaboration',
  },
  {
    id: 'my-surplus',
    businessId: me.id,
    kind: 'surplus',
    title: 'Last season overstock',
    description: 'Two hundred pieces of unsold winter stock, mixed sizes. We would rather move it than discount it.',
    indicativeValue: '₹1,80,000 retail value',
    category: 'Surplus stock',
  },
];

export const swapProposals: SwapProposal[] = [
  {
    id: 'swap-meridian',
    headline: 'Clothing ↔ garment boxes',
    counterparties: 'Meridian Packaging',
    status: 'active',
    updated: 'Updated 2h ago',
  },
  {
    id: 'swap-pulse',
    headline: 'Outerwear ↔ member audience',
    counterparties: 'Pulse Fitness Club',
    status: 'draft',
    updated: 'Not sent yet',
  },
];
