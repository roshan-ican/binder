import { indiaStatesWithCities, type StateWithCities } from './indiaLocations';
import { uaeEmiratesWithCities } from './uaeLocations';

export type CountryCode = 'IN' | 'AE';

export type CountryConfig = {
  code: CountryCode;
  name: string;
  flag: string;
  /** E.164 calling code, including the leading '+'. */
  phoneCode: string;
  currency: { code: string; symbol: string };
  /** What the first-level administrative division is called here. */
  regionLabel: string;
  regionLabelPlural: string;
  regions: readonly StateWithCities[];
  /** Example query for the location search field. */
  searchPlaceholder: string;
  /** Sample location used by the prototype's fake registration lookup. */
  demoCity: string;
  /** The business registration number a business is known by in this country. */
  taxId: {
    label: string;
    placeholder: string;
    helper: string;
    /** Trust-gate copy: what joining without this number costs. */
    optionalNote: string;
    /** Format check only -- never proof the number is real or active. */
    isWellFormed: (value: string) => boolean;
    /** The number the prototype's fake lookup accepts. No real registry is called. */
    demoValue: string;
  };
};

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const uaeTrnPattern = /^[0-9]{15}$/;

export const countries: readonly CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    phoneCode: '+91',
    currency: { code: 'INR', symbol: '₹' },
    regionLabel: 'State',
    regionLabelPlural: 'States',
    regions: indiaStatesWithCities,
    searchPlaceholder: 'Kanpur, Maharashtra...',
    demoCity: 'Mumbai, Maharashtra',
    taxId: {
      label: 'GSTIN',
      placeholder: '27ABCDE1234F1Z5',
      helper: '15 characters, from your GST registration certificate.',
      optionalNote: 'No GST required to join',
      isWellFormed: (value) => gstinPattern.test(value.trim().toUpperCase()),
      demoValue: '27AAPFU0939F1ZV',
    },
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    phoneCode: '+971',
    currency: { code: 'AED', symbol: 'AED' },
    regionLabel: 'Emirate',
    regionLabelPlural: 'Emirates',
    regions: uaeEmiratesWithCities,
    searchPlaceholder: 'Jebel Ali, Sharjah...',
    demoCity: 'Jebel Ali (JAFZA), Dubai',
    taxId: {
      label: 'Tax Registration Number (TRN)',
      placeholder: '100123456700003',
      helper: '15 digits, from your FTA VAT certificate.',
      optionalNote: 'No TRN required to join',
      isWellFormed: (value) => uaeTrnPattern.test(value.replace(/\s/g, '')),
      demoValue: '100123456700003',
    },
  },
];

export const defaultCountryCode: CountryCode = 'IN';

export function getCountry(code: CountryCode): CountryConfig {
  return countries.find((country) => country.code === code) ?? countries[0];
}
