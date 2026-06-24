/**
 * Kannada NLU Pipeline
 *
 * Intent classification + slot extraction for Kannada queries.
 * Keyword-based with Kannada-specific patterns.
 *
 * Task 3.4
 */

const { INTENTS } = require("./intents");

const KANNADA_INTENT_KEYWORDS = {
  retrieve_fir: [
    "ತೋರಿಸು",
    "ತೋರಿಸಿ",
    "ಮಾಹಿತಿ",
    "ವಿವರ",
    "ಎಫ್ಐಆರ್",
    "ಕೇಸ್",
    "ದೂರು",
    "ಸ್ಥಿತಿ",
    "ಹೇಗಿದೆ",
    "ಏನಿದೆ",
  ],
  show_network: [
    "ನೆಟ್‌ವರ್ಕ್",
    "ಸಂಬಂಧ",
    "ಲಿಂಕ್",
    "ಗ್ಯಾಂಗ್",
    "ಜೊತೆ",
    "ಸೇರಿ",
    "ಯಾರು",
    "ಯಾರನ್ನು",
    "ಸಂಪರ್ಕ",
  ],
  find_similar: [
    "ಹೋಲುವ",
    "ಹೋಲಿಸು",
    "ಹೋಲಾಟ",
    "ಒಂದೇ",
    "ಒತ್ತಿ",
    "ಸಮಾನ",
    "ಮಾದರಿ",
    "MO",
  ],
  predict_hotspot: [
    "ಭವಿಷ್ಯ",
    "ಮುಂದೆ",
    "ಯಾವಾಗ",
    "ಎಲ್ಲಿ",
    "ಆಗುತ್ತದೆ",
    "ಹೆಚ್ಚಾಗುತ್ತದೆ",
    "ಮುನ್ಸೂಚನೆ",
    "ಎಚ್ಚರಿಕೆ",
  ],
  show_trend: [
    "ಪ್ರವೃತ್ತಿ",
    "ಟ್ರೆಂಡ್",
    "ಇತಿಹಾಸ",
    "ಅಂಕಿಅಂಶ",
    "ಎಷ್ಟು",
    "ಹೆಚ್ಚಳ",
    "ಕಡಿಮೆ",
    "ಬದಲಾವಣೆ",
  ],
  search_offender: [
    "ಪುನರಾವರ್ತಿತ",
    "ಅಪರಾಧಿ",
    "ಚಳ್ಳ",
    "ಸರದಿ",
    "ಹಳೆಯ",
    "ಪಟ್ಟಿ",
    "ಶಂಕಿತ",
  ],
  compare_cases: ["ಹೋಲಿಸು", "ವ್ಯತ್ಯಾಸ", "ನಡುವೆ", "ಎರಡು"],
  crime_dna: ["ಕ್ರೈಮ್ DNA", "MO ವಿಶ್ಲೇಷಣೆ", "ಸಹಿ", "ಮಾದರಿ", "ಗುರುತು"],
  export_pdf: ["ಫೈಲ್", "ಡೌನ್‌ಲೋಡ್", "ಉಳಿಸು", "PDF", "ವರದಿ"],
  general_query: ["ನಮಸ್ಕಾರ", "ಹಾಯ್", "ಸಹಾಯ", "ಧನ್ಯವಾದ", "ಬೈ"],
};

const KANNADA_CRIME_ALIASES = {
  ಕಳ್ಳತನ: "theft",
  "ಸರಳು ಕಳ್ಳತನ": "chain_snatching",
  "ಮನೆ ಒಡೆದು ಕಳ್ಳತನ": "burglary",
  ದರೋಡೆ: "robbery",
  "ಸೈಬರ್ ಮೋಸ": "cyber_fraud",
  "ಮಾದಕ ವಸ್ತು": "drug_offense",
  ಹಲ್ಲೆ: "assault",
  ಕೊಲೆ: "murder",
  ಮೋಸ: "cheating",
};

const KANNADA_DISTRICT_ALIASES = {
  ಬೆಂಗಳೂರು: "Bengaluru Urban",
  ಮೈಸೂರು: "Mysuru",
  ಹುಬ್ಬಳ್ಳಿ: "Hubli-Dharwad",
  ಧಾರವಾಡ: "Hubli-Dharwad",
  ಮಂಗಳೂರು: "Mangaluru",
  ಕಲಬುರಗಿ: "Kalaburagi",
  ಬೆಳಗಾವಿ: "Belagavi",
};

function classifyIntentKannada(text) {
  const scores = {};

  for (const [intent, keywords] of Object.entries(KANNADA_INTENT_KEYWORDS)) {
    scores[intent] = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[intent] += 1;
      }
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topIntent = sorted[0][1] > 0 ? sorted[0][0] : "general_query";
  const confidence =
    sorted[0][1] > 0 ? Math.min(0.9, 0.5 + sorted[0][1] * 0.12) : 0.3;

  return {
    intent: topIntent,
    confidence,
    all_scores: Object.fromEntries(sorted),
  };
}

function extractSlotsKannada(text) {
  const slots = { language: "kn" };

  // Extract crime type
  for (const [kannada, english] of Object.entries(KANNADA_CRIME_ALIASES)) {
    if (text.includes(kannada)) {
      slots.crime_type = english;
      break;
    }
  }

  // Extract district
  for (const [kannada, english] of Object.entries(KANNADA_DISTRICT_ALIASES)) {
    if (text.includes(kannada)) {
      slots.district = english;
      break;
    }
  }

  // Extract FIR number
  const firMatch = text.match(/(\d{4}\/[A-Z]{3}\/\d{4})/i);
  if (firMatch) {
    slots.fir_number = firMatch[1].toUpperCase();
  }

  // Extract numbers (for min_firs, hops)
  const numMatch = text.match(/(\d+)/);
  if (numMatch) {
    const n = parseInt(numMatch[1]);
    if (n >= 1 && n <= 20) {
      slots.min_firs = n;
    }
  }

  return slots;
}

function processKannadaQuery(text) {
  const intentResult = classifyIntentKannada(text);
  const slots = extractSlotsKannada(text);

  return {
    text,
    language: "kn",
    intent: intentResult.intent,
    intent_confidence: intentResult.confidence,
    slots,
    engine: INTENTS[intentResult.intent]?.engine || "none",
  };
}

module.exports = {
  classifyIntentKannada,
  extractSlotsKannada,
  processKannadaQuery,
  KANNADA_CRIME_ALIASES,
  KANNADA_DISTRICT_ALIASES,
};

if (require.main === module) {
  const tests = [
    "ಎಫ್ಐಆರ್ 2024/MSR/1234 ತೋರಿಸು",
    "ಮೈಸೂರಿನಲ್ಲಿ ಕಳ್ಳತನ ಪ್ರವೃತ್ತಿ",
    "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು ಯಾರು?",
    "ಹೋಲುವ ಕೇಸ್ ಹುಡುಕು",
    "ನಮಸ್ಕಾರ, ಸಹಾಯ ಮಾಡು",
  ];

  console.log("=== Kannada NLU Tests ===\n");
  for (const q of tests) {
    const result = processKannadaQuery(q);
    console.log(`Q: "${q}"`);
    console.log(
      `  Intent: ${result.intent} (${result.intent_confidence.toFixed(2)})`,
    );
    console.log(`  Engine: ${result.engine}`);
    console.log(`  Slots: ${JSON.stringify(result.slots)}`);
    console.log();
  }
}
