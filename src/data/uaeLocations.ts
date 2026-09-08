import type { StateWithCities } from './indiaLocations';

/**
 * The 7 emirates with their main commercial areas and free zones. Curated for
 * a B2B directory, the same spirit as indiaLocations.ts.
 */
export const uaeEmiratesWithCities: readonly StateWithCities[] = [
  { state: 'Abu Dhabi', cities: ['Abu Dhabi', 'Al Ain', 'Musaffah', 'Khalifa Industrial Zone (KIZAD)', 'Ruwais', 'Madinat Zayed'] },
  { state: 'Dubai', cities: ['Deira', 'Bur Dubai', 'Business Bay', 'Al Quoz', 'Jebel Ali (JAFZA)', 'Dubai Investments Park', 'Dubai Silicon Oasis', 'Ras Al Khor', 'Dubai South', 'Dragon Mart'] },
  { state: 'Sharjah', cities: ['Sharjah City', 'Industrial Area', 'Hamriyah Free Zone', 'Sharjah Airport Free Zone (SAIF)', 'Al Dhaid'] },
  { state: 'Ajman', cities: ['Ajman City', 'Ajman Free Zone', 'Al Jurf Industrial Area'] },
  { state: 'Umm Al Quwain', cities: ['Umm Al Quwain City', 'UAQ Free Trade Zone'] },
  { state: 'Ras Al Khaimah', cities: ['Ras Al Khaimah City', 'RAK Free Trade Zone', 'Al Hamra Industrial Zone', 'Al Jazeera Al Hamra'] },
  { state: 'Fujairah', cities: ['Fujairah City', 'Fujairah Free Zone', 'Dibba', 'Port of Fujairah'] },
];
