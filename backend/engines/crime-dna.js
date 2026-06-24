/**
 * Crime DNA Engine — MO Feature Extraction, Vector Building, Similarity Search
 * 
 * The killer feature: when a new FIR arrives, extract its DNA signature,
 * match against history, detect patterns, generate intelligence.
 * 
 * Tasks 5.1 + 5.2 + 5.3
 */

// ============================================================
// Task 5.1 — MO Feature Extractor
// ============================================================

const MO_FEATURES = {
  entry_method: {
    keywords: {
      "broke window": "window_break",
      "broke into": "forced_entry",
      "forced the lock": "lock_forcing",
      "climbing": "climbing",
      "duplicate key": "key_duplication",
      "door": "door_entry",
      "rear": "rear_entry",
      "window": "window_entry",
      "wall": "wall_climbing",
      "roof": "roof_entry",
    },
    default: "unknown",
  },
  time_of_day: {
    patterns: [
      { regex: /(\d{1,2})[:\s]*(\d{2})\s*(AM|am)/i, period: "early_morning" },
      { regex: /(\d{1,2})[:\s]*(\d{2})\s*(PM|pm)/i, period: "afternoon" },
      { regex: /night|ರಾತ್ರಿ|midnight|00:|01:|02:|03:/i, period: "night" },
      { regex: /morning|ಬೆಳಿಗ್ಗೆ|04:|05:|06:/i, period: "morning" },
      { regex: /evening|ಸಂಜೆ|07:|08:|09:|10:/i, period: "evening" },
    ],
    default: "unknown",
  },
  target_type: {
    keywords: {
      "jewelry": "jewelry_shop",
      "shop": "shop",
      "house": "residence",
      "residential": "residence",
      "commercial": "commercial",
      "vehicle": "vehicle",
      "person": "person",
      "chain": "chain_snatch_target",
      "mobile": "mobile_phone",
      "cash": "cash",
    },
    default: "unknown",
  },
  weapon_tool: {
    keywords: {
      "knife": "knife",
      "weapon": "weapon",
      "stick": "stick",
      "rod": "rod",
      "screwdriver": "screwdriver",
      "hammer": "hammer",
      "bare hands": "unarmed",
      "no weapon": "unarmed",
    },
    default: "unarmed",
  },
  escape_method: {
    keywords: {
      "motorcycle": "motorcycle",
      "bike": "motorcycle",
      "scooter": "motorcycle",
      "car": "car",
      "auto": "auto_rickshaw",
      "ran": "on_foot",
      "walked": "on_foot",
      "fled": "fled",
    },
    default: "unknown",
  },
  victim_profile: {
    keywords: {
      "elderly": "elderly",
      "old": "elderly",
      "woman": "female",
      "man": "male",
      "alone": "alone",
      "single": "single_occupant",
      "family": "family",
      "shopkeeper": "business_owner",
    },
    default: "general",
  },
  location_type: {
    keywords: {
      "market": "commercial_area",
      "road": "roadside",
      "lane": "narrow_lane",
      "colony": "residential_area",
      "station": "transit_point",
      "near": "near_landmark",
    },
    default: "unknown",
  },
};

function extractMOFeatures(fir) {
  const text = (fir.narrative_text || "").toLowerCase();
  const features = {};

  // Extract each MO feature from narrative
  for (const [feature, config] of Object.entries(MO_FEATURES)) {
    features[feature] = config.default;

    if (config.keywords) {
      for (const [keyword, value] of Object.entries(config.keywords)) {
        if (text.includes(keyword.toLowerCase())) {
          features[feature] = value;
          break;
        }
      }
    }

    if (config.patterns) {
      for (const pattern of config.patterns) {
        if (pattern.regex.test(text)) {
          features[feature] = pattern.period || pattern.value || "detected";
          break;
        }
      }
    }
  }

  // Add structured fields
  features.crime_type = fir.crime_type || "unknown";
  features.district = fir.district || "unknown";

  // Extract time if available
  const timeMatch = text.match(/(\d{1,2})[:\s]*(\d{2})/);
  if (timeMatch) {
    features.hour = parseInt(timeMatch[1]);
  }

  return features;
}

// ============================================================
// Task 5.2 — MO Feature Vector Builder
// ============================================================

const FEATURE_VOCABULARY = {};
let vocabIndex = 0;

function buildVocabulary() {
  const allValues = [];
  for (const [feature, config] of Object.entries(MO_FEATURES)) {
    if (config.keywords) {
      for (const value of Object.values(config.keywords)) {
        allValues.push(`${feature}:${value}`);
      }
    }
    allValues.push(`${feature}:unknown`);
  }

  // Add crime types
  const crimeTypes = ["theft", "chain_snatching", "burglary", "robbery",
    "cyber_fraud", "drug_offense", "assault", "cheating"];
  for (const ct of crimeTypes) {
    allValues.push(`crime_type:${ct}`);
  }

  // Build vocabulary
  for (const val of allValues) {
    if (!FEATURE_VOCABULARY[val]) {
      FEATURE_VOCABULARY[val] = vocabIndex++;
    }
  }
}

function buildMOVector(features) {
  if (Object.keys(FEATURE_VOCABULARY).length === 0) {
    buildVocabulary();
  }

  const vector = new Array(vocabIndex).fill(0);

  for (const [feature, value] of Object.entries(features)) {
    const key = `${feature}:${value}`;
    if (FEATURE_VOCABULARY[key] !== undefined) {
      vector[FEATURE_VOCABULARY[key]] = 1;
    }
  }

  // Normalize
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map(v => v / norm);
}

// ============================================================
// Task 5.3 — MO Similarity Search
// ============================================================

class MOSimilaritySearch {
  constructor() {
    this.index = new Map();
    this.vectors = [];
    this.firs = [];
  }

  async buildIndex(firs) {
    buildVocabulary();
    this.firs = firs;
    this.vectors = [];

    for (const fir of firs) {
      const features = extractMOFeatures(fir);
      const vector = buildMOVector(features);
      this.vectors.push(vector);
      this.index.set(fir.fir_no, {
        features,
        vector,
        fir,
      });
    }

    return this.vectors.length;
  }

  cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  geographicProximity(fir1, fir2, maxDistanceKm = 50) {
    if (!fir1.lat || !fir1.long || !fir2.lat || !fir2.long) return true;

    const R = 6371;
    const dLat = (fir2.lat - fir1.lat) * Math.PI / 180;
    const dLon = (fir2.long - fir1.long) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(fir1.lat * Math.PI / 180) * Math.cos(fir2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= maxDistanceKm;
  }

  timeDecay(dateStr, halfLifeDays = 365) {
    if (!dateStr) return 1;
    const now = new Date();
    const date = new Date(dateStr);
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    return Math.pow(0.5, daysDiff / halfLifeDays);
  }

  async search(firNo, options = {}) {
    const { topK = 10, maxDistanceKm = 50, applyTimeDecay = true } = options;
    const entry = this.index.get(firNo);
    if (!entry) return [];

    const sourceFir = entry.fir;
    const results = [];

    for (let i = 0; i < this.firs.length; i++) {
      const other = this.firs[i];
      if (other.fir_no === firNo) continue;

      // Geographic filter
      if (!this.geographicProximity(sourceFir, other, maxDistanceKm)) continue;

      const otherEntry = this.index.get(other.fir_no);
      if (!otherEntry) continue;

      let score = this.cosineSimilarity(entry.vector, otherEntry.vector);

      // Time decay
      if (applyTimeDecay) {
        score *= this.timeDecay(other.date_filed);
      }

      // Shared features
      const sharedFeatures = [];
      for (const [key, value] of Object.entries(entry.features)) {
        if (otherEntry.features[key] === value && value !== "unknown") {
          sharedFeatures.push(key);
        }
      }

      results.push({
        fir_no: other.fir_no,
        score: parseFloat(score.toFixed(4)),
        crime_type: other.crime_type,
        district: other.district,
        date_filed: other.date_filed,
        shared_features: sharedFeatures,
        status: other.status,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async searchNewFIR(fir, options = {}) {
    const features = extractMOFeatures(fir);
    const vector = buildMOVector(features);

    const tempFir = { ...fir, _tempVector: vector };
    const results = [];

    for (let i = 0; i < this.firs.length; i++) {
      const other = this.firs[i];
      if (!this.geographicProximity(fir, other, options.maxDistanceKm || 50)) continue;

      const otherEntry = this.index.get(other.fir_no);
      if (!otherEntry) continue;

      let score = this.cosineSimilarity(vector, otherEntry.vector);
      if (options.applyTimeDecay !== false) {
        score *= this.timeDecay(other.date_filed);
      }

      const sharedFeatures = [];
      for (const [key, value] of Object.entries(features)) {
        if (otherEntry.features[key] === value && value !== "unknown") {
          sharedFeatures.push(key);
        }
      }

      results.push({
        fir_no: other.fir_no,
        score: parseFloat(score.toFixed(4)),
        crime_type: other.crime_type,
        district: other.district,
        date_filed: other.date_filed,
        shared_features: sharedFeatures,
        status: other.status,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, options.topK || 10);
  }
}

module.exports = {
  extractMOFeatures,
  buildMOVector,
  MOSimilaritySearch,
  MO_FEATURES,
  FEATURE_VOCABULARY,
};

if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  const firs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/synthetic/output/firs.json"), "utf8")
  );

  console.log("=== Crime DNA Engine Test ===\n");

  // Extract MO features for first FIR
  const testFir = firs[0];
  console.log(`FIR: ${testFir.fir_no} (${testFir.crime_type})`);
  const features = extractMOFeatures(testFir);
  console.log("Features:", JSON.stringify(features, null, 2));

  // Build vector
  const vector = buildMOVector(features);
  console.log(`\nVector dimension: ${vector.length}`);
  console.log(`Non-zero: ${vector.filter(v => v > 0).length}`);

  // Build index and search
  const searcher = new MOSimilaritySearch();
  searcher.buildIndex(firs).then(async () => {
    console.log(`\nIndexed ${firs.length} FIRs`);

    const results = await searcher.search(testFir.fir_no, { topK: 5 });
    console.log(`\nTop 5 similar to ${testFir.fir_no}:`);
    for (const r of results) {
      console.log(`  ${r.fir_no} (score: ${r.score}) — ${r.crime_type} in ${r.district}`);
      console.log(`    Shared: ${r.shared_features.join(", ")}`);
    }
  });
}
