/**
 * Synthetic FIR Data Generator
 * 
 * Generates 500 realistic FIR records across Karnataka districts.
 * Task 1.3 — Build Synthetic FIR Data Generator
 */

const CRIME_TYPES = [
  "theft", "chain_snatching", "burglary", "robbery",
  "cyber_fraud", "drug_offense", "assault", "cheating"
];

const SECTIONS_MAP = {
  theft: ["IPC_379", "IPC_380"],
  chain_snatching: ["IPC_392", "IPC_397"],
  burglary: ["IPC_380", "IPC_381"],
  robbery: ["IPC_392", "IPC_394"],
  cyber_fraud: ["IPC_420", "IT_66"],
  drug_offense: ["NDPS_20", "NDPS_21"],
  assault: ["IPC_323", "IPC_324"],
  cheating: ["IPC_420", "IPC_468"],
};

const DISTRICTS = [
  { name: "Bengaluru Urban", firs: 150, taluks: ["Bangalore North", "Bangalore South", "Bangalore East", "Yelahanka"], lat: 12.9716, long: 77.5946 },
  { name: "Mysuru", firs: 100, taluks: ["Mysuru Taluk", "Hunsur", "Krishnarajanagara", "Nanjangud"], lat: 12.2958, long: 76.6394 },
  { name: "Hubli-Dharwad", firs: 75, taluks: ["Hubli", "Dharwad", "Kalghatgi", "Annigeri"], lat: 15.3647, long: 75.1240 },
  { name: "Mangaluru", firs: 75, taluks: ["Mangaluru", "Surathkal", "Bantwal", "Puttur"], lat: 12.9141, long: 74.8560 },
  { name: "Kalaburagi", firs: 50, taluks: ["Kalaburagi", "Aland", "Chincholi", "Sedam"], lat: 17.3297, long: 76.8343 },
  { name: "Belagavi", firs: 50, taluks: ["Belagavi", "Hundry", "Ramdurg", "Gokak"], lat: 15.8497, long: 74.4977 },
];

const STATUSES = [
  "registered", "under_investigation", "chargesheeted",
  "convicted", "closed_unidentified", "closed_after_trial"
];

const STATUS_WEIGHTS = [0.15, 0.40, 0.20, 0.05, 0.10, 0.10];

const MONTHS = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
  "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"];

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(month) {
  const [year, m] = month.split("-").map(Number);
  const day = randomInt(1, 28);
  return `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function randomLatLong(district) {
  const jitter = 0.05;
  return {
    lat: district.lat + (Math.random() - 0.5) * jitter,
    long: district.long + (Math.random() - 0.5) * jitter,
  };
}

function generateFIR(index) {
  const crimeType = CRIME_TYPES[randomInt(0, CRIME_TYPES.length - 1)];
  const district = DISTRICTS[randomInt(0, DISTRICTS.length - 1)];
  const taluk = district.taluks[randomInt(0, district.taluks.length - 1)];
  const month = MONTHS[randomInt(0, MONTHS.length - 1)];
  const sections = SECTIONS_MAP[crimeType];
  const { lat, long } = randomLatLong(district);

  const psCode = `PS_${district.name.replace(/[\s-]/g, "_").substring(0, 3).toUpperCase()}_${String(randomInt(1, 99)).padStart(2, "0")}`;

  return {
    fir_no: `${month.replace("-", "/")}/${district.name.replace(/[\s-]/g, "").substring(0, 3).toUpperCase()}/${String(index + 1).padStart(4, "0")}`,
    police_station_id: psCode,
    date_filed: randomDate(month),
    crime_type: crimeType,
    sections_of_law: sections,
    status: weightedRandom(STATUSES, STATUS_WEIGHTS),
    narrative_text: "", // Filled by Task 1.4
    lat,
    long,
    investigating_officer_id: `OFF_${String(randomInt(1, 200)).padStart(3, "0")}`,
    district: district.name,
    taluk,
    created_at: new Date().toISOString(),
  };
}

function generateAllFIRs(count = 500) {
  const firs = [];
  let index = 0;

  for (const district of DISTRICTS) {
    for (let i = 0; i < district.firs; i++) {
      firs.push(generateFIR(index));
      index++;
    }
  }

  // Shuffle to mix districts
  for (let i = firs.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [firs[i], firs[j]] = [firs[j], firs[i]];
  }

  return firs;
}

module.exports = { generateAllFIRs, generateFIR, DISTRICTS, CRIME_TYPES };

if (require.main === module) {
  const firs = generateAllFIRs(500);
  console.log(`Generated ${firs.length} FIRs`);
  console.log("District distribution:");
  const distCounts = {};
  firs.forEach(f => { distCounts[f.district] = (distCounts[f.district] || 0) + 1; });
  Object.entries(distCounts).forEach(([d, c]) => console.log(`  ${d}: ${c}`));
  console.log("\nSample FIR:", JSON.stringify(firs[0], null, 2));
}
