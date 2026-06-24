/**
 * Code-Mix Handler
 * 
 * Token-level language detection for Kannada-English code-mixed queries.
 * Segments input into language-tagged runs.
 * 
 * Task 3.5
 */

const { classifyIntent } = require("./english-nlu");
const { classifyIntentKannada, extractSlotsKannada } = require("./kannada-nlu");
const { extractSlots } = require("./slots");
const { INTENTS } = require("./intents");

const KANNADA_RANGE = /[\u0C80-\u0CFF]/;
const ENGLISH_RANGE = /[a-zA-Z]/;

function detectTokenLanguage(token) {
  if (KANNADA_RANGE.test(token)) return "kn";
  if (ENGLISH_RANGE.test(token)) return "en";
  return "other";
}

function segmentLanguages(text) {
  const tokens = text.split(/(\s+)/);
  const segments = [];
  let currentLang = null;
  let currentTokens = [];

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      currentTokens.push(token);
      continue;
    }

    const lang = detectTokenLanguage(token);
    if (lang === currentLang) {
      currentTokens.push(token);
    } else {
      if (currentTokens.length > 0) {
        segments.push({ lang: currentLang, text: currentTokens.join("") });
      }
      currentLang = lang;
      currentTokens = [token];
    }
  }

  if (currentTokens.length > 0) {
    segments.push({ lang: currentLang, text: currentTokens.join("") });
  }

  return segments;
}

const KANNADA_INTENT_MAP = {
  "ತೋರಿಸು": "retrieve_fir",
  "ತೋರಿಸಿ": "retrieve_fir",
  "ಮಾಹಿತಿ": "retrieve_fir",
  "ವಿವರ": "retrieve_fir",
  "ಸಂಬಂಧ": "show_network",
  "ನೆಟ್‌ವರ್ಕ್": "show_network",
  "ಗ್ಯಾಂಗ್": "show_network",
  "ಹೋಲುವ": "find_similar",
  "ಹೋಲಿಸು": "find_similar",
  "ಭವಿಷ್ಯ": "predict_hotspot",
  "ಪ್ರವೃತ್ತಿ": "show_trend",
  "ಪುನರಾವರ್ತಿತ": "search_offender",
  "ಅಪರಾಧಿ": "search_offender",
  "ಫೈಲ್": "export_pdf",
  "ನಮಸ್ಕಾರ": "general_query",
  "ಸಹಾಯ": "general_query",
};

const KANNADA_CRIME_MAP = {
  "ಕಳ್ಳತನ": "theft",
  "ಸರಳು": "chain_snatching",
  "ದರೋಡೆ": "robbery",
  "ಮೋಸ": "cheating",
  "ಹಲ್ಲೆ": "assault",
  "ಮಾದಕ": "drug_offense",
};

const KANNADA_DISTRICT_MAP = {
  "ಮೈಸೂರು": "Mysuru",
  "ಬೆಂಗಳೂರು": "Bengaluru Urban",
  "ಹುಬ್ಬಳ್ಳಿ": "Hubli-Dharwad",
  "ಮಂಗಳೂರು": "Mangaluru",
  "ಕಲಬುರಗಿ": "Kalaburagi",
  "ಬೆಳಗಾವಿ": "Belagavi",
};

function classifyIntentCodeMixed(text) {
  // Try English first
  const enResult = classifyIntent(text);

  // Try Kannada
  const knResult = classifyIntentKannada(text);

  // Merge scores
  const mergedScores = {};
  for (const [intent, score] of Object.entries(enResult.all_scores)) {
    mergedScores[intent] = (mergedScores[intent] || 0) + score * 0.6;
  }
  for (const [intent, score] of Object.entries(knResult.all_scores)) {
    mergedScores[intent] = (mergedScores[intent] || 0) + score * 0.4;
  }

  // Also check for Kannada intent keywords directly in the text
  for (const [kannada, intent] of Object.entries(KANNADA_INTENT_MAP)) {
    if (text.includes(kannada)) {
      mergedScores[intent] = (mergedScores[intent] || 0) + 1;
    }
  }

  const sorted = Object.entries(mergedScores).sort((a, b) => b[1] - a[1]);
  const topIntent = sorted[0][1] > 0 ? sorted[0][0] : "general_query";
  const confidence = sorted[0][1] > 0
    ? Math.min(0.9, 0.4 + sorted[0][1] * 0.12)
    : 0.3;

  return { intent: topIntent, confidence };
}

function extractSlotsCodeMixed(text) {
  // Combine English and Kannada slot extraction
  const enSlots = extractSlots(text);
  const knSlots = extractSlotsKannada(text);

  // Merge: prefer English if both have same slot
  const merged = { ...knSlots, ...enSlots };
  merged.language = "mixed";

  // Check for Kannada crime types directly
  for (const [kannada, english] of Object.entries(KANNADA_CRIME_MAP)) {
    if (text.includes(kannada)) {
      merged.crime_type = english;
      break;
    }
  }

  // Check for Kannada districts directly
  for (const [kannada, english] of Object.entries(KANNADA_DISTRICT_MAP)) {
    if (text.includes(kannada)) {
      merged.district = english;
      break;
    }
  }

  // Extract English person names from code-mixed text
  const nameMatch = text.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/);
  if (nameMatch) {
    merged.accused_name = nameMatch[1];
  }

  // Extract FIR number
  const firMatch = text.match(/(\d{4}\/[A-Z]{3}\/\d{4})/i);
  if (firMatch) {
    merged.fir_number = firMatch[1].toUpperCase();
  }

  return merged;
}

function processCodeMixedQuery(text) {
  const segments = segmentLanguages(text);
  const intentResult = classifyIntentCodeMixed(text);
  const slots = extractSlotsCodeMixed(text);

  return {
    text,
    language: "mixed",
    segments,
    intent: intentResult.intent,
    intent_confidence: intentResult.confidence,
    slots,
    engine: INTENTS[intentResult.intent]?.engine || "none",
  };
}

module.exports = {
  detectTokenLanguage,
  segmentLanguages,
  classifyIntentCodeMixed,
  extractSlotsCodeMixed,
  processCodeMixedQuery,
};

if (require.main === module) {
  const tests = [
    "ಈ accused ಗೆ prior cases ಇದೆಯಾ?",
    "show FIR 2024/MSR/1234 ಮೈಸೂರಿನಲ್ಲಿ",
    "Ravi Kumar ನೆಟ್‌ವರ್ಕ್ ತೋರಿಸು",
    "ಚಳ್ಳ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ Bengaluru",
    "hello ಸರ್, help ಮಾಡಿ",
  ];

  console.log("=== Code-Mix NLU Tests ===\n");
  for (const q of tests) {
    const result = processCodeMixedQuery(q);
    console.log(`Q: "${q}"`);
    console.log(`  Segments: ${JSON.stringify(result.segments)}`);
    console.log(`  Intent: ${result.intent} (${result.intent_confidence.toFixed(2)})`);
    console.log(`  Engine: ${result.engine}`);
    console.log(`  Slots: ${JSON.stringify(result.slots)}`);
    console.log();
  }
}
