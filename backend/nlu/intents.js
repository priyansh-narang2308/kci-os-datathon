/**
 * NLU Intent Taxonomy
 * 
 * Defines all supported intents, example queries, required slots,
 * and which engine handles each intent.
 * 
 * Task 3.1
 */

const INTENTS = {
  retrieve_fir: {
    description: "Retrieve information about a specific FIR or FIRs matching criteria",
    examples: [
      "show FIR 2024/MSR/1234",
      "details of FIR 2024/BLR/0056",
      "what is the status of my FIR?",
      "show all theft FIRs in Mysuru",
      "list FIRs from last month",
    ],
    required_slots: [],
    optional_slots: ["fir_number", "crime_type", "district", "time_range", "status"],
    engine: "graph_rag",
    complexity: "single-hop",
  },

  show_network: {
    description: "Show criminal network or associations around a person, phone, or location",
    examples: [
      "show network around Ravi Kumar",
      "who is connected to this accused?",
      "show the gang structure in Mysuru",
      "what phones is this person linked to?",
      "show associations for ACC_001",
    ],
    required_slots: ["target_entity"],
    optional_slots: ["hops", "edge_types", "district"],
    engine: "network_analysis",
    complexity: "multi-hop",
  },

  find_similar: {
    description: "Find similar past cases based on MO, crime type, or narrative",
    examples: [
      "find similar cases from the past 5 years",
      "show me cases like this one",
      "what other chain-snatching cases match this MO?",
      "find related cases in Mysuru",
    ],
    required_slots: [],
    optional_slots: ["crime_type", "district", "time_range", "fir_number"],
    engine: "investigation_support",
    complexity: "similarity",
  },

  predict_hotspot: {
    description: "Predict crime hotspots or forecast future crime patterns",
    examples: [
      "predict crime hotspots for next 30 days",
      "where will thefts increase?",
      "show emerging crime clusters",
      "forecast Mysuru crime trends",
    ],
    required_slots: [],
    optional_slots: ["crime_type", "district", "time_range"],
    engine: "forecasting",
    complexity: "prediction",
  },

  show_trend: {
    description: "Show historical crime trends across time, geography, or crime type",
    examples: [
      "show theft trends in Bengaluru",
      "how has crime changed over the last year?",
      "compare chain-snatching between Mysuru and Bengaluru",
      "monthly crime statistics",
    ],
    required_slots: [],
    optional_slots: ["crime_type", "district", "time_range"],
    engine: "graph_rag",
    complexity: "aggregation",
  },

  search_offender: {
    description: "Search for repeat offenders or habitual criminals",
    examples: [
      "show repeat offenders in Mysuru",
      "who are the active criminals in Bengaluru?",
      "list offenders with 3+ FIRs",
      "show history-sheeters in my jurisdiction",
    ],
    required_slots: [],
    optional_slots: ["min_firs", "district", "crime_type"],
    engine: "graph_rag",
    complexity: "aggregation",
  },

  compare_cases: {
    description: "Compare two or more cases side by side",
    examples: [
      "compare FIR 2024/MSR/1234 and 2024/MSR/5678",
      "how is this case different from the previous one?",
      "what's similar between these two robberies?",
    ],
    required_slots: ["fir_numbers"],
    optional_slots: [],
    engine: "graph_rag",
    complexity: "comparison",
  },

  crime_dna: {
    description: "Run Crime DNA analysis on a new or existing FIR",
    examples: [
      "analyze the MO of this FIR",
      "run Crime DNA on FIR 2024/MSR/1234",
      "check if this matches any existing patterns",
      "what gang signature does this match?",
    ],
    required_slots: ["fir_number"],
    optional_slots: [],
    engine: "crime_dna",
    complexity: "analysis",
  },

  export_pdf: {
    description: "Export conversation history or analysis as PDF",
    examples: [
      "save this conversation as PDF",
      "export the analysis report",
      "download this as a document",
    ],
    required_slots: [],
    optional_slots: [],
    engine: "pdf_export",
    complexity: "utility",
  },

  general_query: {
    description: "Fallback intent for queries that don't match specific intents",
    examples: [
      "hello",
      "help",
      "what can you do?",
      "who are you?",
    ],
    required_slots: [],
    optional_slots: [],
    engine: "none",
    complexity: "conversational",
  },
};

function getIntent(name) {
  return INTENTS[name] || INTENTS.general_query;
}

function getIntentNames() {
  return Object.keys(INTENTS);
}

function getEngineForIntent(intent) {
  return (INTENTS[intent] || INTENTS.general_query).engine;
}

function listIntents() {
  return Object.entries(INTENTS).map(([name, config]) => ({
    name,
    description: config.description,
    engine: config.engine,
    complexity: config.complexity,
  }));
}

module.exports = { INTENTS, getIntent, getIntentNames, getEngineForIntent, listIntents };

if (require.main === module) {
  console.log("=== NLU Intent Taxonomy ===\n");
  for (const intent of listIntents()) {
    console.log(`  ${intent.name.padEnd(20)} → ${intent.engine.padEnd(25)} [${intent.complexity}]`);
    console.log(`    ${intent.description}`);
    console.log();
  }
}
