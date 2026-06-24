/**
 * English NLU Pipeline
 *
 * Intent classification + slot extraction for English queries.
 * Uses pattern matching + keyword scoring (no external ML dependency for MVP).
 *
 * Task 3.3
 */

const { INTENTS } = require("./intents");
const { extractSlots } = require("./slots");

const INTENT_KEYWORDS = {
  retrieve_fir: [
    "show",
    "get",
    "fetch",
    "display",
    "find",
    "open",
    "details",
    "status",
    "fir",
    "case",
    "report",
    "complaint",
  ],
  show_network: [
    "network",
    "connected",
    "linked",
    "association",
    "gang",
    "group",
    "related",
    "relationship",
    "who knows",
    "who is linked",
  ],
  find_similar: [
    "similar",
    "like",
    "match",
    "compare",
    "related cases",
    "same mo",
    "same pattern",
    " resembles",
  ],
  predict_hotspot: [
    "predict",
    "forecast",
    "future",
    "next",
    "will happen",
    "upcoming",
    "emerging",
    "hotspot",
    "where will",
  ],
  show_trend: [
    "trend",
    "pattern",
    "history",
    "statistics",
    "stats",
    "over time",
    "monthly",
    "yearly",
    "increase",
    "decrease",
    "change",
  ],
  search_offender: [
    "repeat",
    "offender",
    "criminal",
    "habitual",
    "history-sheeter",
    "rowdy",
    "active",
    "most wanted",
    "frequent",
  ],
  compare_cases: ["compare", "difference", "between", "vs", "versus", "differ"],
  crime_dna: [
    "crime dna",
    "analyze mo",
    "mo analysis",
    "signature",
    "pattern match",
    "gang signature",
    "crime pattern",
  ],
  export_pdf: ["export", "download", "save", "pdf", "document", "report"],
  general_query: [
    "hello",
    "hi",
    "help",
    "what can you do",
    "who are you",
    "thank",
    "thanks",
    "bye",
  ],
};

function classifyIntent(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    scores[intent] = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[intent] += 1;
      }
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topIntent = sorted[0][1] > 0 ? sorted[0][0] : "general_query";
  const confidence =
    sorted[0][1] > 0 ? Math.min(0.95, 0.5 + sorted[0][1] * 0.15) : 0.3;

  return {
    intent: topIntent,
    confidence,
    all_scores: Object.fromEntries(sorted),
  };
}

function processEnglishQuery(text) {
  const intentResult = classifyIntent(text);
  const slots = extractSlots(text);

  return {
    text,
    language: "en",
    intent: intentResult.intent,
    intent_confidence: intentResult.confidence,
    slots,
    engine: INTENTS[intentResult.intent]?.engine || "none",
  };
}

module.exports = { classifyIntent, processEnglishQuery, INTENT_KEYWORDS };

if (require.main === module) {
  const tests = [
    "show FIR 2024/MSR/1234",
    "show network around Ravi Kumar",
    "find similar cases last 30 days",
    "repeat offenders in Mysuru",
    "predict hotspots for next month",
    "hello, what can you do?",
  ];

  console.log("=== English NLU Tests ===\n");
  for (const q of tests) {
    const result = processEnglishQuery(q);
    console.log(`Q: "${q}"`);
    console.log(
      `  Intent: ${result.intent} (${result.intent_confidence.toFixed(2)})`,
    );
    console.log(`  Engine: ${result.engine}`);
    console.log(`  Slots: ${JSON.stringify(result.slots)}`);
    console.log();
  }
}
