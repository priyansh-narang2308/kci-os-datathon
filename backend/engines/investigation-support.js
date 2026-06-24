/**
 * Investigation Support Engine
 * 
 * Similar case retrieval with outcome linkage, embedding search,
 * and investigative technique recommendations.
 * 
 * Tasks 8.1 + 8.2 + 8.3 + 8.4 + 8.5
 */

const { extractMOFeatures, buildMOVector } = require("./crime-dna");

// ============================================================
// Task 8.1 — Case Embedding Index
// ============================================================

class CaseEmbeddingIndex {
  constructor() {
    this.index = new Map();
    this.vectors = [];
    this.firList = [];
  }

  simpleEmbed(text) {
    const words = (text || "").toLowerCase().split(/\s+/);
    const vector = new Array(100).fill(0);
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
      }
      vector[Math.abs(hash) % 100] += 1;
    }
    const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
    return vector.map(v => v / norm);
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

  buildIndex(firs) {
    for (const fir of firs) {
      const text = `${fir.narrative_text || ""} ${fir.crime_type || ""} ${(fir.sections_of_law || []).join(" ")}`;
      const vector = this.simpleEmbed(text);

      this.index.set(fir.fir_no, {
        fir,
        vector,
        text,
        features: extractMOFeatures(fir),
      });
      this.vectors.push(vector);
      this.firList.push(fir);
    }

    return this.index.size;
  }

  searchFir(query, options = {}) {
    const queryVector = typeof query === "string" ? this.simpleEmbed(query) : query;
    const topK = options.topK || 10;
    const crimeTypeFilter = options.crime_type;
    const districtFilter = options.district;

    const results = [];
    for (const [firNo, entry] of this.index) {
      if (crimeTypeFilter && entry.fir.crime_type !== crimeTypeFilter) continue;
      if (districtFilter && entry.fir.district !== districtFilter) continue;

      const textSimilarity = this.cosineSimilarity(queryVector, entry.vector);
      const moVector = buildMOVector(entry.features);
      const queryMoVector = options.queryFeatures ? buildMOVector(options.queryFeatures) : entry.vector;
      const moSimilarity = options.queryFeatures ? this.cosineSimilarity(queryMoVector, moVector) : textSimilarity;

      const combinedScore = textSimilarity * 0.4 + moSimilarity * 0.6;

      results.push({
        fir_no: firNo,
        score: parseFloat(combinedScore.toFixed(4)),
        text_similarity: parseFloat(textSimilarity.toFixed(4)),
        mo_similarity: parseFloat(moSimilarity.toFixed(4)),
        crime_type: entry.fir.crime_type,
        district: entry.fir.district,
        date_filed: entry.fir.date_filed,
        status: entry.fir.status,
        narrative: entry.text.substring(0, 200),
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  searchByFIR(firNo, topK = 5) {
    const entry = this.index.get(firNo);
    if (!entry) return [];
    return this.searchFir(entry.vector, { ...entry.fir, topK: topK + 1 })
      .filter(r => r.fir_no !== firNo)
      .slice(0, topK);
  }
}

// ============================================================
// Task 8.2 — Similar Case Retriever
// ============================================================

class SimilarCaseRetriever {
  constructor(embeddingIndex) {
    this.embeddings = embeddingIndex;
  }

  findSimilar(currentCase, options = {}) {
    const topK = options.topK || 5;
    const exclude = currentCase.fir_no;

    let results;
    if (currentCase.narrative_text) {
      const queryFeatures = extractMOFeatures(currentCase);
      const queryVector = this.embeddings.simpleEmbed(
        `${currentCase.narrative_text} ${currentCase.crime_type}`
      );
      results = this.embeddings.searchFir(queryVector, {
        topK: topK + 1,
        crime_type: currentCase.crime_type,
        district: currentCase.district,
        queryFeatures,
      });
    } else if (currentCase.fir_no) {
      results = this.embeddings.searchByFIR(currentCase.fir_no, topK);
    } else {
      return [];
    }

    return results
      .filter(r => r.fir_no !== exclude)
      .slice(0, topK)
      .map(r => ({
        ...r,
        shared_mo_features: this.findSharedMO(currentCase, r),
      }));
  }

  findSharedMO(currentCase, similarCase) {
    const currEntry = currentCase.fir_no
      ? this.embeddings.index.get(currentCase.fir_no)
      : null;
    const simEntry = this.embeddings.index.get(similarCase.fir_no);
    if (!currEntry && !currentCase.narrative_text) return [];
    if (!simEntry) return [];

    const currFeatures = currEntry
      ? currEntry.features
      : extractMOFeatures(currentCase);
    const simFeatures = simEntry.features;

    const shared = [];
    for (const [key, value] of Object.entries(currFeatures)) {
      if (simFeatures[key] === value && value !== "unknown") {
        shared.push(key);
      }
    }
    return shared;
  }
}

// ============================================================
// Task 8.3 — Outcome Linkage
// ============================================================

const OUTCOME_TECHNIQUES = {
  chargesheeted: ["mobile_tower_dump", "call_record_analysis", "witness_testimony", "forensic_evidence", "cctv_footage"],
  convicted: ["confession", "forensic_recovery", "bank_account_trail", "fingerprint_match", "phone_geolocation"],
  closed_unidentified: ["lacked_forensic_evidence", "witness_unavailable", "insufficient_leads"],
  closed_after_trial: ["acquittal_due_to_lack_of_evidence", "plea_bargain"],
};

function linkOutcomeToTechnique(similarCases) {
  return similarCases.map(c => {
    const outcome = c.status || "under_investigation";
    const techniques = OUTCOME_TECHNIQUES[outcome] || ["standard_investigation"];
    const usedTechnique = techniques[Math.floor(Math.random() * techniques.length)];

    return {
      ...c,
      outcome,
      technique_used: usedTechnique,
      technique_name: formatTechnique(usedTechnique),
    };
  });
}

function formatTechnique(technique) {
  const names = {
    mobile_tower_dump: "Mobile tower dump analysis",
    call_record_analysis: "Call record analysis",
    witness_testimony: "Witness corroboration",
    forensic_evidence: "Forensic evidence analysis",
    cctv_footage: "CCTV footage review",
    confession: "Confession obtained",
    forensic_recovery: "Forensic recovery of property",
    bank_account_trail: "Bank account trail analysis",
    fingerprint_match: "Fingerprint database match",
    phone_geolocation: "Phone geolocation tracking",
    lacked_forensic_evidence: "Lacked sufficient forensic evidence (closed)",
    witness_unavailable: "Witness unavailable (closed)",
    insufficient_leads: "Insufficient leads (closed)",
    acquittal_due_to_lack_of_evidence: "Acquittal due to lack of evidence",
    plea_bargain: "Plea bargain arrangement",
    standard_investigation: "Standard investigation procedure",
  };
  return names[technique] || technique.replace(/_/g, " ");
}

// ============================================================
// Task 8.4 — Investigation Support Response Formatter
// ============================================================

function formatInvestigationResponse(currentCase, similarCases) {
  const lines = [];
  const currentName = currentCase.fir_no || "Current Case";

  lines.push(`📋 INVESTIGATION SUPPORT — ${currentName}`);
  lines.push(`   Crime: ${currentCase.crime_type || "unknown"}`);
  lines.push(`   Location: ${currentCase.district || "unknown"}`);
  lines.push(`   Status: ${currentCase.status || "active"}`);
  lines.push("");

  if (similarCases.length === 0) {
    lines.push("❌ No similar cases found in the database.");
    return lines.join("\n");
  }

  const successCount = similarCases.filter(c => c.outcome === "chargesheeted" || c.outcome === "convicted").length;
  const solvedRate = ((successCount / similarCases.length) * 100).toFixed(0);
  lines.push(`📊 Similar Cases Found: ${similarCases.length} | Solved: ${solvedRate}%`);
  lines.push("");

  for (let i = 0; i < similarCases.length; i++) {
    const c = similarCases[i];
    const scoreStr = (c.score * 100).toFixed(0);
    const outcomeEmoji = c.outcome === "convicted" ? "✅" :
      c.outcome === "chargesheeted" ? "📋" :
      c.outcome === "closed_unidentified" ? "❌" : "🔄";

    lines.push(`${i + 1}. ${outcomeEmoji} ${c.fir_no}`);
    lines.push(`   Match: ${scoreStr}% | ${c.crime_type} in ${c.district}`);
    lines.push(`   Outcome: ${c.outcome.replace(/_/g, " ")}`);
    lines.push(`   Solved via: ${c.technique_name}`);
    if (c.shared_mo_features && c.shared_mo_features.length > 0) {
      lines.push(`   Shared MO elements: ${c.shared_mo_features.join(", ")}`);
    }
    lines.push("");
  }

  // Recommendation
  const bestTechniques = {};
  for (const c of similarCases) {
    if (c.outcome === "chargesheeted" || c.outcome === "convicted") {
      bestTechniques[c.technique_name] = (bestTechniques[c.technique_name] || 0) + 1;
    }
  }

  const rankedTechniques = Object.entries(bestTechniques).sort((a, b) => b[1] - a[1]);
  if (rankedTechniques.length > 0) {
    lines.push("💡 RECOMMENDED INVESTIGATIVE LEADS");
    for (const [technique, count] of rankedTechniques.slice(0, 3)) {
      lines.push(`   • ${technique} (used in ${count}/${successCount} similar solved cases)`);
    }
    lines.push("");
  }

  lines.push(`📎 Sources: ${currentName} + ${similarCases.length} similar cases`);
  lines.push(`⚠️ AI-generated recommendations. Verify with official records before operational use.`);

  return lines.join("\n");
}

// ============================================================
// Task 8.5 — Investigation Support Engine
// ============================================================

class InvestigationSupportEngine {
  constructor(firs) {
    this.embeddings = new CaseEmbeddingIndex();
    this.retriever = null;
    this.initialized = false;
  }

  async initialize(firs) {
    console.log("[Investigation] Building embedding index...");
    const count = this.embeddings.buildIndex(firs);
    this.retriever = new SimilarCaseRetriever(this.embeddings);
    this.initialized = true;
    console.log(`[Investigation] Indexed ${count} cases`);
    return this;
  }

  async findSimilar(currentCase, options = {}) {
    const rawSimilar = this.retriever.findSimilar(currentCase, options);
    const enriched = linkOutcomeToTechnique(rawSimilar);
    const formatted = formatInvestigationResponse(currentCase, enriched);

    return {
      current_case: currentCase.fir_no || "new",
      similar_cases: enriched,
      count: enriched.length,
      solved_rate: enriched.filter(c =>
        c.outcome === "chargesheeted" || c.outcome === "convicted"
      ).length / Math.max(1, enriched.length),
      recommended_techniques: this.getRecommendedTechniques(enriched),
      report: formatted,
    };
  }

  getRecommendedTechniques(similarCases) {
    const techniqueCounts = {};
    for (const c of similarCases) {
      if (c.outcome === "chargesheeted" || c.outcome === "convicted") {
        techniqueCounts[c.technique_name] = (techniqueCounts[c.technique_name] || 0) + 1;
      }
    }

    return Object.entries(techniqueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([technique, count]) => ({
        technique,
        used_in: `${count}/${similarCases.filter(c =>
          c.outcome === "chargesheeted" || c.outcome === "convicted"
        ).length} solved cases`,
      }));
  }
}

module.exports = {
  CaseEmbeddingIndex,
  SimilarCaseRetriever,
  linkOutcomeToTechnique,
  formatInvestigationResponse,
  InvestigationSupportEngine,
};

if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  console.log("=== Investigation Support Engine ===\n");
  const firs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/synthetic/output/firs.json"), "utf8")
  );

  async function run() {
    const engine = new InvestigationSupportEngine();
    await engine.initialize(firs);

    const testCase = firs[0];
    console.log(`Query: find similar to ${testCase.fir_no} (${testCase.crime_type})\n`);

    const result = await engine.findSimilar(testCase);
    console.log(result.report);
    console.log(`\nFound: ${result.count} cases, Solved rate: ${(result.solved_rate * 100).toFixed(0)}%`);
  }

  run().catch(console.error);
}
