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

// ============================================================
// Task 5.4 — Pattern Detection Engine
// ============================================================

class PatternDetector {
  constructor(searcher) {
    this.searcher = searcher;
    this.PATTERN_THRESHOLD = 0.65;
    this.MIN_CLUSTER_SIZE = 3;
    this.CLUSTER_RADIUS_KM = 5;
  }

  async detectPatterns(firNo, options = {}) {
    const threshold = options.threshold || this.PATTERN_THRESHOLD;
    const minCluster = options.minCluster || this.MIN_CLUSTER_SIZE;

    const similar = await this.searcher.search(firNo, {
      topK: 20,
      applyTimeDecay: false,
    });

    const highMatch = similar.filter(r => r.score >= threshold);
    if (highMatch.length < minCluster) {
      return { pattern_detected: false, matches: highMatch };
    }

    const clusters = this.clusterByGeography(highMatch);
    const detectedClusters = clusters.filter(c => c.members.length >= minCluster);

    return {
      pattern_detected: detectedClusters.length > 0,
      matches: highMatch,
      clusters: detectedClusters.map(c => ({
        center_lat: c.center.lat,
        center_long: c.center.long,
        radius_km: c.radius,
        members: c.members,
        size: c.members.length,
      })),
    };
  }

  async detectNewFIRPattern(fir, options = {}) {
    const threshold = options.threshold || this.PATTERN_THRESHOLD;
    const minCluster = options.minCluster || this.MIN_CLUSTER_SIZE;

    const similar = await this.searcher.searchNewFIR(fir, {
      topK: 20,
      applyTimeDecay: false,
    });

    const highMatch = similar.filter(r => r.score >= threshold);
    if (highMatch.length < minCluster) {
      return { pattern_detected: false, matches: highMatch };
    }

    const clusters = this.clusterByGeography(highMatch);
    const detectedClusters = clusters.filter(c => c.members.length >= minCluster);

    return {
      pattern_detected: detectedClusters.length > 0,
      matches: highMatch,
      clusters: detectedClusters.map(c => ({
        center_lat: c.center.lat,
        center_long: c.center.long,
        radius_km: c.radius,
        members: c.members,
        size: c.members.length,
      })),
    };
  }

  clusterByGeography(results) {
    const clusters = [];

    for (const r of results) {
      let added = false;
      for (const cluster of clusters) {
        const dist = this.haversine(
          cluster.center.lat, cluster.center.long,
          parseFloat(r.lat || 0), parseFloat(r.long || r.lat || 0)
        );
        if (dist <= this.CLUSTER_RADIUS_KM) {
          cluster.members.push(r);
          cluster.center.lat = cluster.members.reduce((s, m) => s + parseFloat(m.lat || 0), 0) / cluster.members.length;
          cluster.center.long = cluster.members.reduce((s, m) => s + parseFloat(m.long || 0), 0) / cluster.members.length;
          added = true;
          break;
        }
      }
      if (!added) {
        clusters.push({
          center: {
            lat: parseFloat(r.lat || 0),
            long: parseFloat(r.long || 0),
          },
          radius: this.CLUSTER_RADIUS_KM,
          members: [r],
        });
      }
    }

    return clusters;
  }

  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

// ============================================================
// Task 5.5 — Crime DNA Analysis Output
// ============================================================

function formatCrimeDNAReport(fir, patternResult, matches) {
  const firNo = fir.fir_no || "NEW_FIR";
  const report = [];

  report.push(`🧬 CRIME DNA ANALYSIS — ${firNo}`);
  report.push(`   Crime: ${fir.crime_type || "unknown"}`);
  report.push(`   Location: ${fir.district || "unknown"}, ${fir.taluk || ""}`);
  report.push(`   Date: ${fir.date_filed || "new"}`);
  report.push("");

  // MO Signature
  report.push(`📋 MO SIGNATURE`);
  const features = extractMOFeatures(fir);
  for (const [key, val] of Object.entries(features)) {
    if (val !== "unknown") {
      const displayVal = typeof val === 'string' ? val.replace(/_/g, " ") : Array.isArray(val) ? val.join(", ") : String(val);
      report.push(`   ${key.replace(/_/g, " ")}: ${displayVal}`);
    }
  }
  report.push("");

  // Best matches
  const topMatches = (matches || []).slice(0, 5);
  if (topMatches.length > 0) {
    report.push(`🔍 TOP MATCHES`);
    for (const m of topMatches) {
      const linkStatus = m.linked ? "LINKED" : "NO LINK";
      report.push(`   ${m.fir_no} (${(m.score * 100).toFixed(0)}%) — ${m.crime_type}, ${m.district} [${linkStatus}]`);
      if (m.shared_features && m.shared_features.length > 0) {
        report.push(`      Shared: ${m.shared_features.slice(0, 4).join(", ")}`);
      }
    }
    report.push("");
  }

  // Pattern detection
  if (patternResult.pattern_detected) {
    report.push(`⚠️ PATTERN ALERT`);
    report.push(`   Detected ${patternResult.clusters.length} cluster(s) with similar MO`);
    for (const c of patternResult.clusters) {
      report.push(`   Cluster: ${c.members.length} FIRs in ${c.radius_km}km radius`);
      report.push(`   Members: ${c.members.map(m => m.fir_no).join(", ")}`);
    }
  } else {
    report.push(`✅ No active pattern detected`);
  }
  report.push("");

  // Recommendations
  report.push(`💡 INVESTIGATIVE LEADS`);
  if (topMatches.length > 0) {
    const topMatch = topMatches[0];
    report.push(`   • Review FIR ${topMatch.fir_no} for case parallels`);
    if (topMatch.shared_features && topMatch.shared_features.length > 0) {
      report.push(`   • Focus on shared MO elements: ${topMatch.shared_features.slice(0, 3).join(", ")}`);
    }
  }
  report.push("");

  report.push(`📎 Sources: ${firNo} + ${topMatches.length} matched FIRs`);
  report.push(`⚠️ Disclaimer: AI-generated leads. Verify with official records.`);

  return report.join("\n");
}

// ============================================================
// Task 5.6 — Crime DNA Catalyst Function Handler
// ============================================================

class CrimeDNAEngine {
  constructor() {
    this.searcher = new MOSimilaritySearch();
    this.detector = null;
    this.initialized = false;
  }

  async initialize(firs) {
    if (this.initialized) return this;
    const count = await this.searcher.buildIndex(firs);
    this.detector = new PatternDetector(this.searcher);
    this.initialized = true;
    return this;
  }

  async analyzeNewFIR(fir) {
    const features = extractMOFeatures(fir);
    const matches = await this.searcher.searchNewFIR(fir, { topK: 10 });
    const patternResult = await this.detector.detectNewFIRPattern(fir);
    const report = formatCrimeDNAReport(fir, patternResult, matches);

    return {
      fir_no: fir.fir_no || "NEW_FIR",
      features,
      matches: matches.slice(0, 5),
      match_count: matches.length,
      pattern: patternResult,
      report,
      generated_at: new Date().toISOString(),
    };
  }

  async analyzeExistingFIR(firNo) {
    const entry = this.searcher.index.get(firNo);
    if (!entry) throw new Error(`FIR not found in index: ${firNo}`);

    const matches = await this.searcher.search(firNo, { topK: 10 });
    const patternResult = await this.detector.detectPatterns(firNo);
    const report = formatCrimeDNAReport(entry.fir, patternResult, matches);

    return {
      fir_no: firNo,
      features: entry.features,
      matches: matches.slice(0, 5),
      match_count: matches.length,
      pattern: patternResult,
      report,
      generated_at: new Date().toISOString(),
    };
  }
}

module.exports = {
  extractMOFeatures,
  buildMOVector,
  MOSimilaritySearch,
  PatternDetector,
  CrimeDNAEngine,
  formatCrimeDNAReport,
  MO_FEATURES,
  FEATURE_VOCABULARY,
};

if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  const firs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/synthetic/output/firs.json"), "utf8")
  );

  console.log("=== Crime DNA Engine E2E Test (Task 5.7) ===\n");

  async function run() {
    const engine = new CrimeDNAEngine();
    await engine.initialize(firs);

    const testFir = firs[0];
    console.log(`Testing with FIR: ${testFir.fir_no} (${testFir.crime_type})\n`);

    const result = await engine.analyzeExistingFIR(testFir.fir_no);
    console.log(result.report);
    console.log(`\nMatches found: ${result.match_count}`);
    console.log(`Pattern detected: ${result.pattern.pattern_detected}`);
  }

  run().catch(console.error);
}
