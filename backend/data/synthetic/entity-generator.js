/**
 * Synthetic Entity Data Generator
 * 
 * Generates Accused, Victim, Location, Phone, Vehicle, and Police_Station records.
 * Task 1.5 — Build Synthetic Entity Data
 */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

// ============================================================
// Accused names with Kannada + English variants for entity resolution
// ============================================================
const ACCUSED_NAMES = [
  { name: "Ravi Kumar", aliases: ["Ravi K", "R. Kumar", "ರವಿ ಕುಮಾರ್"], district: "Mysuru" },
  { name: "Suresh Babu", aliases: ["Suresh B", "S. Babu", "ಸುರೇಶ್ ಬಾಬು"], district: "Bengaluru Urban" },
  { name: "Mustafa Khan", aliases: ["Mustafa K", "M. Khan", "ಮುಸ್ತಾಫಾ"], district: "Mangaluru" },
  { name: "Anil Sharma", aliases: ["Anil S", "ಅನಿಲ್"], district: "Hubli-Dharwad" },
  { name: "Rajesh Reddy", aliases: ["Rajesh R", "ರಾಜೇಶ್"], district: "Kalaburagi" },
  { name: "Darshan Raj", aliases: ["Darshan R", "ದರ್ಶನ್"], district: "Bengaluru Urban" },
  { name: "Vijay Patel", aliases: ["Vijay P", "ವಿಜಯ್"], district: "Belagavi" },
  { name: "Imran Sheikh", aliases: ["Imran S", "ಇಮ್ರಾನ್"], district: "Mysuru" },
  { name: "Kiran Gowda", aliases: ["Kiran G", "ಕಿರಣ್"], district: "Mangaluru" },
  { name: "Prakash Naik", aliases: ["Prakash N", "ಪ್ರಕಾಶ್"], district: "Hubli-Dharwad" },
  { name: "Sunil Verma", aliases: ["Sunil V", "ಸುನಿಲ್"], district: "Bengaluru Urban" },
  { name: "Farhan Ahmed", aliases: ["Farhan A", "ಫರ್ಹಾನ್"], district: "Kalaburagi" },
  { name: "Deepak Singh", aliases: ["Deepak S", "ದೀಪಕ್"], district: "Belagavi" },
  { name: "Naveen Kumar", aliases: ["Naveen K", "ನವೀನ್"], district: "Mysuru" },
  { name: "Asif Pasha", aliases: ["Asif P", "ಅಸಿಫ್"], district: "Bengaluru Urban" },
  { name: "Manoj Tiwari", aliases: ["Manoj T", "ಮನೋಜ್"], district: "Hubli-Dharwad" },
  { name: "Hassan Ali", aliases: ["Hassan A", "ಹಸನ್"], district: "Mangaluru" },
  { name: "Rahul Dev", aliases: ["Rahul D", "ರಾಹುಲ್"], district: "Bengaluru Urban" },
  { name: "Irfan Khan", aliases: ["Irfan K", "ಇರ್ಫಾನ್"], district: "Kalaburagi" },
  { name: "Vikram Joshi", aliases: ["Vikram J", "ವಿಕ್ರಮ್"], district: "Belagavi" },
  { name: "Shafiulla Baig", aliases: ["Shafiulla B", "ಶಫಿउಲ್ಲಾ"], district: "Mysuru" },
  { name: "Ganesh Hedge", aliases: ["Ganesh H", "ಗಣೇಶ್"], district: "Mangaluru" },
  { name: "Yusuf Mirza", aliases: ["Yusuf M", "ಯೂಸುಫ್"], district: "Bengaluru Urban" },
  { name: "Ravi Shankar", aliases: ["Ravi S", "ರವಿ ಶಂಕರ್"], district: "Hubli-Dharwad" },
  { name: "Afzal Khan", aliases: ["Afzal K", "ಅಫ್ಜಲ್"], district: "Kalaburagi" },
];

const VICTIM_NAMES = [
  { name: "Lakshmi Devi", gender: "female", age: 65, vulnerable: true, district: "Mysuru" },
  { name: "Rajesh Kumar", gender: "male", age: 45, vulnerable: false, district: "Bengaluru Urban" },
  { name: "Ayesha Begum", gender: "female", age: 34, vulnerable: false, district: "Mangaluru" },
  { name: "Suresh Babu", gender: "male", age: 52, vulnerable: false, district: "Hubli-Dharwad" },
  { name: "Priya Sharma", gender: "female", age: 28, vulnerable: false, district: "Bengaluru Urban" },
  { name: "Mohammed Irfan", gender: "male", age: 40, vulnerable: false, district: "Kalaburagi" },
  { name: "Geetha", gender: "female", age: 70, vulnerable: true, district: "Mysuru" },
  { name: "Venkatesh", gender: "male", age: 55, vulnerable: false, district: "Belagavi" },
  { name: "Suma", gender: "female", age: 38, vulnerable: false, district: "Hubli-Dharwad" },
  { name: "Nagaraj", gender: "male", age: 60, vulnerable: true, district: "Mangaluru" },
  { name: "Fathima", gender: "female", age: 42, vulnerable: false, district: "Kalaburagi" },
  { name: "Srinivas", gender: "male", age: 48, vulnerable: false, district: "Bengaluru Urban" },
  { name: "Kamala", gender: "female", age: 68, vulnerable: true, district: "Mysuru" },
  { name: "Ramesh", gender: "male", age: 35, vulnerable: false, district: "Belagavi" },
  { name: "Zareena", gender: "female", age: 30, vulnerable: false, district: "Mangaluru" },
];

const LOCATIONS = [
  { name: "Mysuru Central Market", district: "Mysuru", taluk: "Mysuru Taluk", type: "commercial", lat: 12.3052, long: 76.6551 },
  { name: "Mysuru Palace Road", district: "Mysuru", taluk: "Mysuru Taluk", type: "commercial", lat: 12.3058, long: 76.6539 },
  { name: "Devaraja Mohalla", district: "Mysuru", taluk: "Mysuru Taluk", type: "residence", lat: 12.3116, long: 76.6530 },
  { name: "Krishna Rajendra Market", district: "Mysuru", taluk: "Mysuru Taluk", type: "commercial", lat: 12.3167, long: 76.6534 },
  { name: "Vani Vilas Mohalla", district: "Mysuru", taluk: "Mysuru Taluk", type: "residence", lat: 12.3234, long: 76.6465 },
  { name: "Mall of Mysuru", district: "Mysuru", taluk: "Mysuru Taluk", type: "commercial", lat: 12.3186, long: 76.6431 },
  { name: "KRS Road", district: "Mysuru", taluk: "Krishnarajanagara", type: "commercial", lat: 12.3685, long: 76.6431 },
  { name: "Bengaluru MG Road", district: "Bengaluru Urban", taluk: "Bangalore South", type: "commercial", lat: 12.9758, long: 77.6065 },
  { name: "Koramangala", district: "Bengaluru Urban", taluk: "Bangalore South", type: "residence", lat: 12.9352, long: 77.6245 },
  { name: "Whitefield", district: "Bengaluru Urban", taluk: "Bangalore East", type: "residence", lat: 12.9698, long: 77.7500 },
  { name: "HSR Layout", district: "Bengaluru Urban", taluk: "Bangalore South", type: "residence", lat: 12.9116, long: 77.6389 },
  { name: "Indiranagar", district: "Bengaluru Urban", taluk: "Bangalore East", type: "residence", lat: 12.9784, long: 77.6408 },
  { name: "Commercial Street", district: "Bengaluru Urban", taluk: "Bangalore North", type: "commercial", lat: 12.9830, long: 77.6060 },
  { name: "Hubli DCC Circle", district: "Hubli-Dharwad", taluk: "Hubli", type: "commercial", lat: 15.3647, long: 75.1240 },
  { name: "Dharwad Jubilee Circle", district: "Hubli-Dharwad", taluk: "Dharwad", type: "commercial", lat: 15.4589, long: 75.0078 },
  { name: "Mangaluru City Centre", district: "Mangaluru", taluk: "Mangaluru", type: "commercial", lat: 12.9141, long: 74.8560 },
  { name: "Hampankatta", district: "Mangaluru", taluk: "Mangaluru", type: "commercial", lat: 12.8785, long: 74.8430 },
  { name: "Kalaburagi Fort Road", district: "Kalaburagi", taluk: "Kalaburagi", type: "commercial", lat: 17.3297, long: 76.8343 },
  { name: "Belagavi Camp", district: "Belagavi", taluk: "Belagavi", type: "commercial", lat: 15.8497, long: 74.4977 },
  { name: "Tilakwadi", district: "Belagavi", taluk: "Belagavi", type: "residence", lat: 15.8566, long: 74.5085 },
];

const POLICE_STATIONS = [
  { ps_id: "PS_MSR_001", name: "Lakshmipuram PS", district: "Mysuru" },
  { ps_id: "PS_MSR_002", name: "Vani Vilas Mohalla PS", district: "Mysuru" },
  { ps_id: "PS_MSR_003", name: "Devaraja Mohalla PS", district: "Mysuru" },
  { ps_id: "PS_BLR_001", name: "Koramangala PS", district: "Bengaluru Urban" },
  { ps_id: "PS_BLR_002", name: "HSR Layout PS", district: "Bengaluru Urban" },
  { ps_id: "PS_BLR_003", name: "Whitefield PS", district: "Bengaluru Urban" },
  { ps_id: "PS_BLR_004", name: "Indiranagar PS", district: "Bengaluru Urban" },
  { ps_id: "PS_BLR_005", name: "Commercial Street PS", district: "Bengaluru Urban" },
  { ps_id: "PS_HUB_001", name: "DCC Circle PS", district: "Hubli-Dharwad" },
  { ps_id: "PS_HUB_002", name: "Jubilee Circle PS", district: "Hubli-Dharwad" },
  { ps_id: "PS_MNG_001", name: "City Centre PS", district: "Mangaluru" },
  { ps_id: "PS_MNG_002", name: "Hampankatta PS", district: "Mangaluru" },
  { ps_id: "PS_KLB_001", name: "Fort Road PS", district: "Kalaburagi" },
  { ps_id: "PS_BLG_001", name: "Camp PS", district: "Belagavi" },
  { ps_id: "PS_BLG_002", name: "Tilakwadi PS", district: "Belagavi" },
];

function generateAccused(count = 25) {
  const accused = [];
  const baseNames = ACCUSED_NAMES.slice(0, count);

  for (let i = 0; i < count; i++) {
    const base = baseNames[i % baseNames.length];
    const age = randomInt(18, 55);
    accused.push({
      accused_id: `ACC_${String(i + 1).padStart(3, "0")}`,
      name: base.name,
      aliases: base.aliases,
      age,
      gender: "male",
      address: `${randomInt(1, 200)}, ${pick(["Main Road", "Cross Street", "1st Main", "2nd Stage", "Colony"])}, ${base.district}`,
      district: base.district,
      prior_conviction_count: pick([0, 0, 0, 1, 1, 2, 3, 5]),
      created_at: new Date().toISOString(),
    });
  }
  return accused;
}

function generateVictims(count = 15) {
  return VICTIM_NAMES.slice(0, count).map((v, i) => ({
    victim_id: `VIC_${String(i + 1).padStart(3, "0")}`,
    name: v.name,
    age: v.age,
    gender: v.gender,
    address: `${randomInt(1, 100)}, ${pick(["Main Road", "Cross Street", "1st Main"])}, ${v.district}`,
    district: v.district,
    vulnerability_flag: v.vulnerable,
    created_at: new Date().toISOString(),
  }));
}

function generateLocations() {
  return LOCATIONS.map((l, i) => ({
    location_id: `LOC_${String(i + 1).padStart(3, "0")}`,
    lat: l.lat + (Math.random() - 0.5) * 0.01,
    long: l.long + (Math.random() - 0.5) * 0.01,
    type: l.type,
    name: l.name,
    taluk: l.taluk,
    district: l.district,
    state: "Karnataka",
    created_at: new Date().toISOString(),
  }));
}

function generatePhones(count = 20) {
  const phones = [];
  for (let i = 0; i < count; i++) {
    const imsi = `89${randomInt(1000000000, 9999999999)}`;
    phones.push({
      phone_id: `PHONE_${String(i + 1).padStart(3, "0")}`,
      imei: imsi.substring(0, 15),
      msisdn: `+91${randomInt(7000000000, 9999999999)}`,
      registration_name: null,
      owner_confidence: 0.0,
      created_at: new Date().toISOString(),
    });
  }
  return phones;
}

function generateVehicles(count = 10) {
  const vehicles = [];
  const types = ["motorcycle", "car", "auto_rickshaw"];
  const colors = ["black", "white", "red", "blue", "silver", "grey"];
  for (let i = 0; i < count; i++) {
    const state = "KA";
    const districtCode = randomInt(1, 99);
    const letters = `${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))}`;
    const num = randomInt(1000, 9999);
    vehicles.push({
      vehicle_id: `VEH_${String(i + 1).padStart(3, "0")}`,
      reg_no: `${state}-${String(districtCode).padStart(2, "0")}-${letters}-${num}`,
      type: pick(types),
      color: pick(colors),
      owner_name: null,
      created_at: new Date().toISOString(),
    });
  }
  return vehicles;
}

function generatePoliceStations() {
  return POLICE_STATIONS.map(ps => ({
    ...ps,
    taluk: ps.district === "Mysuru" ? "Mysuru Taluk" :
           ps.district === "Bengaluru Urban" ? "Bangalore South" :
           ps.district === "Hubli-Dharwad" ? "Hubli" :
           ps.district === "Mangaluru" ? "Mangaluru" :
           ps.district === "Kalaburagi" ? "Kalaburagi" : "Belagavi",
    lat: 12.9 + Math.random() * 4,
    long: 75.0 + Math.random() * 3,
    created_at: new Date().toISOString(),
  }));
}

function generateAllEntities() {
  return {
    accused: generateAccused(25),
    victims: generateVictims(15),
    locations: generateLocations(),
    phones: generatePhones(20),
    vehicles: generateVehicles(10),
    police_stations: generatePoliceStations(),
  };
}

module.exports = {
  generateAccused,
  generateVictims,
  generateLocations,
  generatePhones,
  generateVehicles,
  generatePoliceStations,
  generateAllEntities,
};

if (require.main === module) {
  const entities = generateAllEntities();
  console.log("Generated entities:");
  Object.entries(entities).forEach(([type, arr]) => console.log(`  ${type}: ${arr.length}`));
}
