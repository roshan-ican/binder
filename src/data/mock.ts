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
  gstin: string;
  businessName: string;
  contactName: string;
  industry: string;
  city: string;
  offers: string[];
  needs: string[];
  verified: boolean;
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
  business: 'Roshan Clothing',
  person: 'Roshan',
  industry: 'Fashion & Apparel',
  city: 'Kanpur',
  region: 'Uttar Pradesh, India',
  offers: ['Manufacturer', 'Distributor'],
  needs: ['Packaging', 'Logistics'],
  completeness: 72,
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
