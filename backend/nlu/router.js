/**
 * NLU-to-Query Router
 *
 * Routes classified intent + extracted slots to the correct engine.
 * Handles edge cases: ambiguous intent, missing slots, out-of-scope.
 *
 * Task 3.6
 */

const { processEnglishQuery } = require("./english-nlu");
const { processKannadaQuery } = require("./kannada-nlu");
const { processCodeMixedQuery } = require("./code-mix");
const { INTENTS } = require("./intents");

const ENGINE_MAP = {
  graph_rag: "graph-rag-query",
  network_analysis: "graph-rag-query",
  investigation_support: "similar-cases",
  forecasting: "forecast-trigger",
  crime_dna: "crime-dna-analyzer",
  pdf_export: "pdf-export",
  none: null,
};

const REQUIRED_SLOTS = {
  retrieve_fir: [],
  show_network: ["target_entity"],
  find_similar: [],
  predict_hotspot: [],
  show_trend: [],
  search_offender: [],
  compare_cases: ["fir_numbers"],
  crime_dna: ["fir_number"],
  export_pdf: [],
  general_query: [],
};

function detectLanguage(text) {
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasEnglish = /[a-zA-Z]/.test(text);
  if (hasKannada && hasEnglish) return "mixed";
  if (hasKannada) return "kn";
  return "en";
}

function extractSlotsFromHistory(history, missingSlots) {
  if (!history || !Array.isArray(history) || history.length === 0) return {};
  const filled = {};
  const userMessages = history.filter(m => m.role === "user").map(m => m.content);
  for (const slot of missingSlots) {
    for (const msg of userMessages) {
      const lower = msg.toLowerCase();
      // Target entity: look for names, IDs
      if (slot === "target_entity") {
        const idMatch = msg.match(/ACC_\d{4}|FIR_\d{4}_\d{4}/);
        if (idMatch) { filled[slot] = idMatch[0]; break; }
        // Check for name patterns (2-3 word names)
        const nameMatch = msg.match(/(?:around|for|about|investigate)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
        if (nameMatch) { filled[slot] = nameMatch[1]; break; }
      }
      // District: extract from user messages
      if (slot === "district") {
        const districts = ["Bengaluru Urban","Bengaluru","Belagavi","Kalaburagi","Mysuru","Mangaluru","Hubli-Dharwad","Hubli","Dharwad"];
        for (const d of districts) {
          if (lower.includes(d.toLowerCase())) { filled[slot] = d; break; }
        }
        if (filled[slot]) break;
      }
      // Crime type
      if (slot === "crime_type") {
        const types = ["theft","burglary","robbery","assault","cheating","cyber_fraud","chain_snatching","drug_offense","chain-snatching"];
        for (const t of types) {
          if (lower.includes(t.replace(/_/g, " ").replace(/-/g, " "))) { filled[slot] = t; break; }
        }
        if (filled[slot]) break;
      }
    }
  }
  return filled;
}

function processQuery(text, history) {
  const lang = detectLanguage(text);

  let result;
  switch (lang) {
    case "kn":
      result = processKannadaQuery(text);
      break;
    case "mixed":
      result = processCodeMixedQuery(text);
      break;
    default:
      result = processEnglishQuery(text);
  }

  // Validate required slots
  const required = REQUIRED_SLOTS[result.intent] || [];
  let missingSlots = required.filter((slot) => !result.slots[slot]);

  // Try to fill missing slots from conversation history (multi-turn context)
  if (missingSlots.length > 0 && history) {
    const contextSlots = extractSlotsFromHistory(history, missingSlots);
    for (const [key, val] of Object.entries(contextSlots)) {
      if (!result.slots[key] && val) {
        result.slots[key] = val;
        result.context_resolved = result.context_resolved || [];
        result.context_resolved.push(key);
      }
    }
    missingSlots = required.filter((slot) => !result.slots[slot]);
  }

  // Handle missing slots
  if (missingSlots.length > 0) {
    result.status = "needs_clarification";
    result.missing_slots = missingSlots;
    result.clarification_prompt = generateClarification(
      result.intent,
      missingSlots,
    );
    return result;
  }

  // Map intent to engine
  result.engine = ENGINE_MAP[result.engine] || null;
  result.status = "ready";

  return result;
}

function generateClarification(intent, missingSlots) {
  const prompts = {
    target_entity:
      "Please specify who you want to investigate (name, accused ID, or phone number).",
    fir_numbers:
      "Please provide the FIR numbers you want to compare (e.g., 2024/MSR/1234 and 2024/MSR/5678).",
    fir_number: "Please provide the FIR number to analyze.",
    district: "Which district are you interested in? (e.g., Bengaluru Urban, Mysuru, Belagavi)",
    crime_type: "Which crime type? (e.g., theft, burglary, cyber_fraud, chain_snatching)",
  };

  for (const slot of missingSlots) {
    if (prompts[slot]) return prompts[slot];
  }

  return "Could you provide more details about your query?";
}

function routeToEngine(processedQuery) {
  if (processedQuery.status !== "ready") {
    return {
      type: "clarification",
      message: processedQuery.clarification_prompt,
    };
  }

  if (processedQuery.intent === "general_query") {
    return {
      type: "response",
      message: getGeneralResponse(processedQuery.text),
    };
  }

  return {
    type: "engine_call",
    engine: processedQuery.engine,
    function_name: ENGINE_MAP[processedQuery.engine] || processedQuery.engine,
    intent: processedQuery.intent,
    slots: processedQuery.slots,
    original_query: processedQuery.text,
    language: processedQuery.language,
  };
}

function getGeneralResponse(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("ನಮಸ್ಕಾರ")
  ) {
    return "Hello! I'm KCI-OS, the Karnataka Crime Intelligence System. I can help you query crime records, analyze criminal networks, find similar cases, and predict crime hotspots. What would you like to know?";
  }

  if (lower.includes("help") || lower.includes("ಸಹಾಯ")) {
    return "I can help you with:\n• **Show FIR** — Retrieve FIR details\n• **Show Network** — Visualize criminal connections\n• **Find Similar** — Find related cases\n• **Predict Hotspots** — Forecast crime patterns\n• **Show Trends** — Analyze crime statistics\n• **Search Offenders** — Find repeat offenders\n• **Crime DNA** — Analyze crime signatures\n• **Export PDF** — Save conversation as PDF\n\nAsk me in English, Kannada, or a mix of both!";
  }

  if (lower.includes("who are you") || lower.includes("what are you")) {
    return "I'm KCI-OS — Karnataka Crime Intelligence Operating System. I'm an AI assistant built for Karnataka State Police to help investigators query crime data, discover criminal networks, and generate intelligence insights. Built for Datathon 2026.";
  }

  return "I'm here to help with crime intelligence queries. Try asking me to 'show FIR 2024/MSR/1234' or 'find similar cases in Mysuru'. You can ask in English, Kannada, or code-mixed!";
}

module.exports = {
  processQuery,
  routeToEngine,
  detectLanguage,
  ENGINE_MAP,
  REQUIRED_SLOTS,
};

if (require.main === module) {
  const tests = [
    "show FIR 2024/MSR/1234",
    "ಈ accused ಗೆ prior cases ಇದೆಯಾ?",
    "show network around Ravi Kumar",
    "hello",
    "find similar cases last 30 days in Mysuru",
    "compare 2024/MSR/1234 and 2024/MSR/5678",
  ];

  console.log("=== NLU Router Tests ===\n");
  for (const q of tests) {
    const processed = processQuery(q);
    const routed = routeToEngine(processed);
    console.log(`Q: "${q}"`);
    console.log(`  Status: ${processed.status}`);
    console.log(`  Intent: ${processed.intent}`);
    console.log(`  Route: ${routed.type}`);
    if (routed.type === "engine_call") {
      console.log(`  Engine: ${routed.engine} → ${routed.function_name}`);
    } else if (routed.type === "response") {
      console.log(`  Response: ${routed.message.substring(0, 80)}...`);
    } else {
      console.log(`  Clarification: ${routed.message}`);
    }
    console.log();
  }
}
