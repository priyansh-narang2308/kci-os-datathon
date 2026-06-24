/**
 * GraphRAG Pipeline — Full Pipeline
 *
 * Query Planning → Graph Retrieval + Vector Retrieval → Merger →
 * Context Assembly → Grounded Generation → Reasoning Path
 *
 * Tasks 4.4 + 4.5 + 4.6 + 4.7
 */

const QueryPlanner = require("./query-planner");
const GraphRetriever = require("./retriever");
const VectorRetriever = require("./vector-retriever");

class GraphRAGPipeline {
  constructor(client) {
    this.client = client;
    this.planner = new QueryPlanner();
    this.graphRetriever = new GraphRetriever(client);
    this.vectorRetriever = new VectorRetriever();
    this.initialized = false;
  }

  async initialize(firs = []) {
    if (this.initialized) return;
    console.log("[GraphRAG] Building vector index...");
    const count = await this.vectorRetriever.buildIndex(firs);
    console.log(`[GraphRAG] Indexed ${count} FIRs`);
    this.initialized = true;
  }

  // ============================================================
  // Task 4.4 — Hybrid Retrieval Merger
  // ============================================================

  async hybridRetrieve(intent, slots) {
    const graphResults = await this.graphRetrieve(intent, slots);
    const vectorResults = await this.vectorRetrieve(intent, slots);

    const merged = this.mergeResults(graphResults, vectorResults);
    return merged;
  }

  async graphRetrieve(intent, slots) {
    const planned = this.planner.generateCypher(intent, slots);
    if (planned.error) {
      return { results: [], citations: [], error: planned.error };
    }
    return this.graphRetriever.execute(planned.cypher, planned.params);
  }

  async vectorRetrieve(intent, slots) {
    const queryText = this.slotsToQueryText(slots);
    if (!queryText) return { results: [], citations: [] };

    const results = await this.vectorRetriever.search(queryText, {
      crimeType: slots.crime_type,
      district: slots.district,
      topK: 5,
    });

    return {
      results: results.map((r) => ({
        ...r,
        _source: "vector",
        _citation: {
          type: "FIR",
          id: r.fir_no,
          source: "narrative similarity",
          confidence: r.score,
        },
      })),
      citations: results.map((r) => ({
        type: "FIR",
        id: r.fir_no,
        source: "narrative similarity",
        confidence: r.score,
      })),
    };
  }

  mergeResults(graphResults, vectorResults) {
    const seen = new Set();
    const merged = [];

    // Graph results first (higher priority)
    for (const r of graphResults.results || []) {
      const key = r.fir_no || r.accused_id || JSON.stringify(r);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...r, _source: "graph", _priority: 1 });
      }
    }

    // Vector results (fill gaps)
    for (const r of vectorResults.results || []) {
      const key = r.fir_no || JSON.stringify(r);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...r, _source: "vector", _priority: 2 });
      }
    }

    const allCitations = [
      ...(graphResults.citations || []),
      ...(vectorResults.citations || []),
    ];

    return { results: merged, citations: allCitations };
  }

  slotsToQueryText(slots) {
    const parts = [];
    if (slots.crime_type) parts.push(slots.crime_type.replace(/_/g, " "));
    if (slots.district) parts.push(slots.district);
    if (slots.accused_name) parts.push(slots.accused_name);
    if (slots.fir_number) parts.push(`FIR ${slots.fir_number}`);
    return parts.join(" ");
  }

  // ============================================================
  // Task 4.5 — Context Assembler
  // ============================================================

  assembleContext(mergedResults, maxTokens = 3000) {
    const contextBlocks = [];
    let tokenEstimate = 0;

    for (const r of mergedResults.results) {
      const block = this.resultToContextBlock(r);
      const blockTokens = block.split(/\s+/).length;

      if (tokenEstimate + blockTokens > maxTokens) break;
      contextBlocks.push(block);
      tokenEstimate += blockTokens;
    }

    return {
      context: contextBlocks.join("\n\n"),
      blocks: contextBlocks,
      totalTokens: tokenEstimate,
      citations: mergedResults.citations,
    };
  }

  resultToContextBlock(result) {
    if (result.fir_no && result.narrative) {
      return [
        `[FIR ${result.fir_no}]`,
        `Crime: ${result.crime_type || "unknown"} | District: ${result.district || "unknown"}`,
        `Date: ${result.date_filed || "unknown"} | Status: ${result.status || "unknown"}`,
        result.accused_names
          ? `Accused: ${result.accused_names.join(", ")}`
          : "",
        `Narrative: ${(result.narrative || "").substring(0, 300)}`,
        `Source: ${result._citation?.source || "database"} | Confidence: ${result._citation?.confidence?.toFixed(2) || "N/A"}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    if (result.accused_id && result.name) {
      return [
        `[Accused: ${result.name} (${result.accused_id})]`,
        `District: ${result.district || "unknown"} | Age: ${result.age || "unknown"}`,
        `Prior convictions: ${result.priors || 0}`,
        result.fir_count ? `FIRs: ${result.fir_count}` : "",
        `Source: ${result._citation?.source || "database"} | Confidence: ${result._citation?.confidence?.toFixed(2) || "N/A"}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    if (result.target_name) {
      return [
        `[Network: ${result.target_name}]`,
        `Linked FIRs: ${(result.linked_firs || []).length}`,
        `Connections: ${(result.connections || []).length}`,
        `Locations: ${(result.locations || []).map((l) => l.location).join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    return JSON.stringify(result, null, 2).substring(0, 500);
  }

  // ============================================================
  // Task 4.6 — Grounded Response Generator
  // ============================================================

  generateResponse(query, context, intent) {
    const citations = context.citations || [];

    const header = this.getResponseHeader(intent, query);
    const body = this.generateBody(context, intent);
    const citationList = this.formatCitations(citations);
    const disclaimer = this.getDisclaimer(intent);

    return {
      text: [header, body, citationList, disclaimer]
        .filter(Boolean)
        .join("\n\n"),
      citations,
      confidence: this.calculateOverallConfidence(citations),
    };
  }

  getResponseHeader(intent, query) {
    const headers = {
      retrieve_fir: `🔍 FIR Details`,
      show_network: `🕸️ Criminal Network Analysis`,
      find_similar: `📋 Similar Cases`,
      search_offender: `⚠️ Repeat Offenders`,
      show_trend: `📊 Crime Trends`,
      predict_hotspot: `🗺️ Crime Forecast`,
      crime_dna: `🧬 Crime DNA Analysis`,
    };
    return headers[intent] || `📋 Query Results`;
  }

  generateBody(context, intent) {
    if (!context.blocks || context.blocks.length === 0) {
      return "No matching records found in the database for this query.";
    }

    const lines = context.blocks.map((block, i) => {
      const lines = block.split("\n");
      const title = lines[0] || "";
      const details = lines.slice(1).join("\n");
      return `${i + 1}. ${title}\n   ${details.replace(/\n/g, "\n   ")}`;
    });

    return `Found ${context.blocks.length} result(s):\n\n${lines.join("\n\n")}`;
  }

  formatCitations(citations) {
    if (!citations || citations.length === 0) return "";

    const lines = citations.map((c) => {
      const conf =
        typeof c.confidence === "number" ? c.confidence.toFixed(2) : "N/A";
      return `  • [${c.type} ${c.id}] — ${c.source} (confidence: ${conf})`;
    });

    return `📎 Sources:\n${lines.join("\n")}`;
  }

  getDisclaimer(intent) {
    if (["show_network", "find_similar", "crime_dna"].includes(intent)) {
      return "⚠️ Note: Results may include AI-inferred associations (marked as 'Investigative Lead'). Verify with official records before operational use.";
    }
    return "ℹ️ Data retrieved from KSP Crime Database. Verify with official records.";
  }

  calculateOverallConfidence(citations) {
    if (!citations || citations.length === 0) return 0.5;
    const confidences = citations
      .map((c) => c.confidence)
      .filter((c) => typeof c === "number");
    if (confidences.length === 0) return 0.5;
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }

  // ============================================================
  // Task 4.7 — Reasoning Path Extractor
  // ============================================================

  extractReasoningPath(graphResults, intent, slots) {
    const steps = [];

    steps.push({
      step: 1,
      action: "intent_classification",
      detail: `Classified as: ${intent}`,
      confidence: 0.9,
    });

    steps.push({
      step: 2,
      action: "slot_extraction",
      detail: `Extracted: ${JSON.stringify(slots)}`,
      confidence: 0.85,
    });

    const planned = this.planner.generateCypher(intent, slots);
    if (planned.cypher) {
      steps.push({
        step: 3,
        action: "query_planning",
        detail: `Generated Cypher traversal`,
        query: planned.cypher.substring(0, 200),
        confidence: 0.9,
      });
    }

    if (graphResults.results && graphResults.results.length > 0) {
      steps.push({
        step: 4,
        action: "graph_traversal",
        detail: `Found ${graphResults.results.length} matching records`,
        nodes_visited: graphResults.results.length,
        confidence: 0.85,
      });
    }

    steps.push({
      step: steps.length + 1,
      action: "response_generation",
      detail: "Generated grounded response with citations",
      confidence: 0.8,
    });

    return steps;
  }

  // ============================================================
  // Full Pipeline
  // ============================================================

  async processQuery(intent, slots) {
    const merged = await this.hybridRetrieve(intent, slots);
    const context = this.assembleContext(merged);
    const response = this.generateResponse({ intent, slots }, context, intent);
    const reasoningPath = this.extractReasoningPath(merged, intent, slots);

    return {
      response: response.text,
      citations: response.citations,
      confidence: response.confidence,
      reasoningPath,
      graphResults: merged.results.length,
      vectorResults: merged.results.filter((r) => r._source === "vector")
        .length,
    };
  }
}

module.exports = GraphRAGPipeline;
