export type TaxonomyItem = {
  id: string;
  label: string;
  aliases: string[];
};

export type Profession = TaxonomyItem & {
  suggestedSkillIds: string[];
  suggestedRoleIds: string[];
};

export const skills: TaxonomyItem[] = [
  { id: 'manufacturing', label: 'Manufacturing', aliases: ['production', 'factory'] },
  { id: 'production-planning', label: 'Production planning', aliases: ['production scheduling'] },
  { id: 'quality-control', label: 'Quality control', aliases: ['quality assurance', 'qa', 'qc'] },
  { id: 'sourcing', label: 'Sourcing', aliases: ['procurement', 'vendor sourcing'] },
  { id: 'vendor-management', label: 'Vendor management', aliases: ['supplier management'] },
  { id: 'buyer-coordination', label: 'Buyer coordination', aliases: ['buyer follow-up'] },
  { id: 'inventory-management', label: 'Inventory management', aliases: ['stock control'] },
  { id: 'operations', label: 'Operations', aliases: ['business operations'] },
  { id: 'logistics', label: 'Logistics', aliases: ['transport', 'freight'] },
  { id: 'warehouse-operations', label: 'Warehouse operations', aliases: ['warehousing'] },
  { id: 'sales', label: 'Sales', aliases: ['business development'] },
  { id: 'customer-service', label: 'Customer service', aliases: ['customer support'] },
  { id: 'digital-marketing', label: 'Digital marketing', aliases: ['online marketing'] },
  { id: 'retail-operations', label: 'Retail operations', aliases: ['store operations'] },
  { id: 'data-analysis', label: 'Data analysis', aliases: ['analytics', 'reporting'] },
  { id: 'team-leadership', label: 'Team leadership', aliases: ['people management', 'supervision'] },
];

export const roles: (TaxonomyItem & { professionId: string })[] = [
  { id: 'production-supervisor', label: 'Production Supervisor', aliases: ['production lead'], professionId: 'manufacturing-production' },
  { id: 'production-assistant', label: 'Production Assistant', aliases: ['factory assistant'], professionId: 'manufacturing-production' },
  { id: 'sourcing-associate', label: 'Sourcing Associate', aliases: ['procurement associate'], professionId: 'sourcing-procurement' },
  { id: 'buyer-coordinator', label: 'Buyer Coordinator', aliases: ['buyer support'], professionId: 'sourcing-procurement' },
  { id: 'quality-inspector', label: 'Quality Inspector', aliases: ['quality checker', 'qc inspector'], professionId: 'quality-compliance' },
  { id: 'quality-check-intern', label: 'Quality Check Intern', aliases: ['quality intern'], professionId: 'quality-compliance' },
  { id: 'operations-coordinator', label: 'Operations Coordinator', aliases: ['operations executive'], professionId: 'operations-administration' },
  { id: 'inventory-assistant', label: 'Inventory Assistant', aliases: ['stock assistant'], professionId: 'operations-administration' },
  { id: 'sales-executive', label: 'Sales Executive', aliases: ['sales representative'], professionId: 'sales-business-development' },
  { id: 'logistics-coordinator', label: 'Logistics Coordinator', aliases: ['freight coordinator'], professionId: 'logistics-warehouse' },
  { id: 'customer-support-executive', label: 'Customer Support Executive', aliases: ['customer service executive'], professionId: 'customer-service' },
  { id: 'marketing-associate', label: 'Marketing Associate', aliases: ['marketing executive'], professionId: 'marketing' },
];

export const professions: Profession[] = [
  {
    id: 'manufacturing-production', label: 'Manufacturing & Production', aliases: ['factory', 'production'],
    suggestedSkillIds: ['manufacturing', 'production-planning', 'quality-control', 'team-leadership'],
    suggestedRoleIds: ['production-supervisor', 'production-assistant'],
  },
  {
    id: 'sourcing-procurement', label: 'Sourcing & Procurement', aliases: ['buying', 'purchasing'],
    suggestedSkillIds: ['sourcing', 'vendor-management', 'buyer-coordination'],
    suggestedRoleIds: ['sourcing-associate', 'buyer-coordinator'],
  },
  {
    id: 'quality-compliance', label: 'Quality & Compliance', aliases: ['qa', 'qc', 'inspection'],
    suggestedSkillIds: ['quality-control', 'manufacturing', 'data-analysis'],
    suggestedRoleIds: ['quality-inspector', 'quality-check-intern'],
  },
  {
    id: 'operations-administration', label: 'Operations & Administration', aliases: ['admin', 'back office'],
    suggestedSkillIds: ['operations', 'inventory-management', 'data-analysis', 'team-leadership'],
    suggestedRoleIds: ['operations-coordinator', 'inventory-assistant'],
  },
  {
    id: 'sales-business-development', label: 'Sales & Business Development', aliases: ['sales', 'business development'],
    suggestedSkillIds: ['sales', 'customer-service', 'buyer-coordination'],
    suggestedRoleIds: ['sales-executive'],
  },
  {
    id: 'logistics-warehouse', label: 'Logistics & Warehouse', aliases: ['transport', 'supply chain', 'warehouse'],
    suggestedSkillIds: ['logistics', 'warehouse-operations', 'inventory-management'],
    suggestedRoleIds: ['logistics-coordinator', 'inventory-assistant'],
  },
  {
    id: 'customer-service', label: 'Customer Service', aliases: ['support', 'customer care'],
    suggestedSkillIds: ['customer-service', 'sales', 'operations'],
    suggestedRoleIds: ['customer-support-executive'],
  },
  {
    id: 'marketing', label: 'Marketing', aliases: ['promotion', 'digital marketing'],
    suggestedSkillIds: ['digital-marketing', 'sales', 'data-analysis'],
    suggestedRoleIds: ['marketing-associate'],
  },
];

export function taxonomyLabel(id: string, catalogue: TaxonomyItem[]) {
  const item = catalogue.find((entry) => entry.id === id);
  if (item) return item.label;
  if (id.startsWith('custom:')) return titleCase(id.slice('custom:'.length).replace(/-/g, ' '));
  return titleCase(id.replace(/-/g, ' '));
}

export function customTaxonomyId(label: string) {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `custom:${slug}`;
}

export function matchesTaxonomy(item: TaxonomyItem, query: string) {
  const normalized = query.trim().toLowerCase();
  return !normalized || [item.label, ...item.aliases].some((value) => value.toLowerCase().includes(normalized));
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
