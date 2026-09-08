export type StateWithCities = { state: string; cities: readonly string[] };

/**
 * All 28 states + 8 union territories, each with its major
 * business/commercial hubs. Not an exhaustive town-by-town list — curated
 * for a B2B directory, the same spirit as businessTaxonomy.ts.
 */
export const indiaStatesWithCities: readonly StateWithCities[] = [
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Kakinada', 'Anantapur'] },
  { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'] },
  { state: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'] },
  { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai'] },
  { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'] },
  { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Morbi'] },
  { state: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat', 'Yamunanagar'] },
  { state: 'Himachal Pradesh', cities: ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Kullu', 'Baddi'] },
  { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari', 'Tumakuru', 'Shivamogga'] },
  { state: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad'] },
  { state: 'Madhya Pradesh', cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam', 'Dewas'] },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Amravati'] },
  { state: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur'] },
  { state: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai'] },
  { state: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai'] },
  { state: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung'] },
  { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'] },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Sikar'] },
  { state: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Gyalshing'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Tiruppur'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Secunderabad'] },
  { state: 'Tripura', cities: ['Agartala', 'Udaipur', 'Dharmanagar'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur'] },
  { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Nainital'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur'] },
  { state: 'Andaman and Nicobar Islands', cities: ['Port Blair'] },
  { state: 'Chandigarh', cities: ['Chandigarh'] },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Silvassa', 'Daman', 'Diu'] },
  { state: 'Delhi', cities: ['New Delhi', 'Delhi'] },
  { state: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'] },
  { state: 'Ladakh', cities: ['Leh', 'Kargil'] },
  { state: 'Lakshadweep', cities: ['Kavaratti'] },
  { state: 'Puducherry', cities: ['Puducherry', 'Karaikal'] },
] as const;
