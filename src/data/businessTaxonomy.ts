export type BusinessIndustryGroup = { id: string; label: string; industries: readonly string[] };

export const businessIndustryGroups: readonly BusinessIndustryGroup[] = [
  { id: 'technology', label: 'Technology', industries: ['Artificial Intelligence', 'Software & SaaS', 'Crypto & Web3', 'Fintech', 'Cybersecurity', 'Cloud Services', 'IT Services', 'Consumer Electronics'] },
  { id: 'health', label: 'Health & Wellness', industries: ['Hospitals', 'Clinics', 'Pharmaceuticals', 'Medical Devices', 'Diagnostics & Laboratories', 'Mental Health', 'Fitness & Wellness', 'Health Insurance'] },
  { id: 'fashion', label: 'Fashion & Textiles', industries: ['Fashion & Apparel', 'Textiles', 'Leather & Footwear', 'Jewellery & Accessories', 'Garment Manufacturing', 'Fabric & Yarn', 'Beauty & Personal Care'] },
  { id: 'manufacturing', label: 'Manufacturing', industries: ['Industrial Manufacturing', 'Automotive', 'Machinery & Equipment', 'Chemicals', 'Plastics & Rubber', 'Metals & Fabrication', 'Furniture', 'Packaging'] },
  { id: 'retail', label: 'Retail & Commerce', industries: ['Retail', 'E-commerce', 'Wholesale', 'Consumer Goods', 'Home & Lifestyle', 'Marketplaces', 'Import & Export'] },
  { id: 'food', label: 'Food & Agriculture', industries: ['Food & Beverage', 'Agriculture', 'Dairy', 'Restaurants & Catering', 'Food Processing', 'Fisheries & Seafood', 'AgriTech'] },
  { id: 'construction', label: 'Construction & Property', industries: ['Construction', 'Real Estate', 'Architecture', 'Interior Design', 'Building Materials', 'Property Management', 'Facilities Management'] },
  { id: 'transport', label: 'Transport & Logistics', industries: ['Logistics', 'Warehousing', 'Freight & Shipping', 'Automotive Services', 'Aviation', 'Public Transport', 'Last-mile Delivery'] },
  { id: 'services', label: 'Professional Services', industries: ['Consulting', 'Legal Services', 'Accounting & Tax', 'Human Resources', 'Marketing & Advertising', 'Design Services', 'Business Support'] },
  { id: 'finance', label: 'Finance', industries: ['Banking', 'Insurance', 'Investments', 'Payments', 'Lending', 'Accounting Technology', 'Asset Management'] },
  { id: 'education', label: 'Education', industries: ['Schools', 'Higher Education', 'EdTech', 'Vocational Training', 'Professional Training', 'Tutoring', 'Publishing'] },
  { id: 'media', label: 'Media & Entertainment', industries: ['Film & Television', 'Music', 'Gaming', 'News & Publishing', 'Content Creation', 'Events', 'Sports'] },
  { id: 'energy', label: 'Energy & Environment', industries: ['Renewable Energy', 'Oil & Gas', 'Utilities', 'Recycling & Waste', 'Environmental Services', 'Climate Technology', 'Mining'] },
  { id: 'travel', label: 'Travel & Hospitality', industries: ['Hotels & Resorts', 'Travel Services', 'Tourism', 'Restaurants', 'Events & Venues', 'Airlines', 'Leisure'] },
] as const;

export const businessIndustries = businessIndustryGroups.flatMap((group) => group.industries);
