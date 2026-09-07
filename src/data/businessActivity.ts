/** Public prototype activity only; private enquiries and drafts do not belong here. */
export type PublicBusinessEnquiry = {
  id: string;
  businessId: string;
  title: string;
  status: 'active' | 'closed' | 'expired';
  dateLabel: string;
  quantity: string;
  location: string;
  description: string;
};

export const publicBusinessEnquiries: PublicBusinessEnquiry[] = [
  {
    id: 'abc-packaging', businessId: 'abc-leather',
    title: 'Garment packaging boxes', status: 'active',
    dateLabel: 'Needed by 25 Sep 2026', quantity: '5,000 boxes', location: 'Kanpur',
    description: 'Looking for recyclable boxes for leather jackets. Please share available sizes, print options and delivery lead time.',
  },
  {
    id: 'abc-lining', businessId: 'abc-leather',
    title: 'Cotton lining fabric', status: 'closed',
    dateLabel: 'Closed Aug 2026', quantity: '2,000 metres', location: 'Kanpur',
    description: 'Cotton lining for an outerwear production run. This enquiry is no longer accepting responses.',
  },
  {
    id: 'abc-freight', businessId: 'abc-leather',
    title: 'Road freight to Delhi', status: 'expired',
    dateLabel: 'Expired Jul 2026', quantity: 'One part-load shipment', location: 'Kanpur → Delhi',
    description: 'Transport for packaged garments. The response window for this requirement has ended.',
  },
  {
    id: 'northline-wrap', businessId: 'northline-tanners',
    title: 'Protective wrapping for leather rolls', status: 'active',
    dateLabel: 'Needed by 30 Sep 2026', quantity: '1,000 sheets', location: 'Kanpur',
    description: 'Seeking moisture-resistant wrapping for finished leather rolls, suitable for road transport.',
  },
  {
    id: 'meridian-board', businessId: 'meridian-pack',
    title: 'Kraft paperboard supply', status: 'closed',
    dateLabel: 'Closed Aug 2026', quantity: '3 tonnes', location: 'Kanpur',
    description: 'Paperboard sourcing for garment packaging. This enquiry is no longer accepting responses.',
  },
];
