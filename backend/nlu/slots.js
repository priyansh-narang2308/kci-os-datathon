/**
 * NLU Slot / Entity Taxonomy
 * 
 * Defines all slot types, extraction patterns, and entity normalization.
 * 
 * Task 3.2
 */

const SLOTS = {
  fir_number: {
    description: "FIR number in standard format",
    type: "string",
    patterns: [
      /\b(\d{4}\/[A-Z]{3}\/\d{4})\b/i,
      /\b(FIR\s*#?\s*\d{4}\/[A-Z]{3}\/\d{4})\b/i,
    ],
    examples: ["2024/MSR/1234", "FIR 2024/BLR/0056", "fir#2024/HUB/0089"],
    normalize: (match) => match.toUpperCase().replace(/\s+/g, ""),
  },

  accused_name: {
    description: "Name of an accused person",
    type: "person_name",
    patterns: [
      /(?:accused|suspect|criminal|gangster)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is|was|has|linked|connected)/i,
    ],
    examples: ["Ravi Kumar", "Suresh Babu", "Mustafa Khan"],
    Kannada_patterns: [
      /ಆರೋಪಿ\s+([\u0C80-\u0CFF]+)/,
      /(?:ಅವನು|ಅವಳು)\s+([\u0C80-\u0CFF]+)/,
    ],
    normalize: (name) => name.trim(),
  },

  victim_name: {
    description: "Name of a victim",
    type: "person_name",
    patterns: [
      /(?:victim|complainant|person(?:\s+who)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ],
    examples: ["Lakshmi Devi", "Rajesh Kumar"],
    normalize: (name) => name.trim(),
  },

  crime_type: {
    description: "Type of crime",
    type: "enum",
    values: [
      "theft", "chain_snatching", "burglary", "robbery",
      "cyber_fraud", "drug_offense", "assault", "murder",
      "cheating", "criminal_intimidation",
    ],
    aliases: {
      "stealing": "theft",
      "stolen": "theft",
      "chain snatching": "chain_snatching",
      "chain-snatching": "chain_snatching",
      "house break": "burglary",
      "break-in": "burglary",
      "dacoity": "robbery",
      "online fraud": "cyber_fraud",
      "cybercrime": "cyber_fraud",
      "ndps": "drug_offense",
      "drugs": "drug_offense",
      "physically assaulted": "assault",
      "beating": "assault",
      "scam": "cheating",
      "fraud": "cheating",
    },
    Kannada_aliases: {
      "ಕಳ್ಳತನ": "theft",
      "ಸರಳು ಕಳ್ಳತನ": "chain_snatching",
      "ಮನೆ ಒಡೆದು ಕಳ್ಳತನ": "burglary",
      "ದರೋಡೆ": "robbery",
      "ಸೈಬರ್ ಮೋಸ": "cyber_fraud",
      "ಮಾದಕ ವಸ್ತು": "drug_offense",
      "ಹಲ್ಲೆ": "assault",
    },
    normalize: (input) => {
      const lower = input.toLowerCase().trim();
      if (SLOTS.crime_type.aliases[lower]) return SLOTS.crime_type.aliases[lower];
      if (SLOTS.crime_type.values.includes(lower)) return lower;
      return lower;
    },
  },

  location: {
    description: "Geographic location (district, city, area)",
    type: "location",
    patterns: [
      /(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:district|city|area)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ],
    examples: ["Mysuru", "Bengaluru", "Hubli-Dharwad", "Koramangala"],
    Kannada_patterns: [
      /(?:ನಲ್ಲಿ|ಬಳಿ|ದಲ್ಲಿ)\s+([\u0C80-\u0CFF]+)/,
    ],
    districts: [
      "Bengaluru Urban", "Mysuru", "Hubli-Dharwad", "Mangaluru",
      "Kalaburagi", "Belagavi", "Ballari", "Vijayapura",
      "Davangere", "Shivamogga", "Tumakuru", "Kolar",
    ],
    normalize: (input) => {
      const normalized = input.trim();
      const match = SLOTS.location.districts.find(
        d => d.toLowerCase() === normalized.toLowerCase()
      );
      return match || normalized;
    },
  },

  district: {
    description: "Karnataka district name",
    type: "enum",
    values: [
      "Bengaluru Urban", "Mysuru", "Hubli-Dharwad", "Mangaluru",
      "Kalaburagi", "Belagavi", "Ballari", "Vijayapura",
      "Davangere", "Shivamogga", "Tumakuru", "Kolar",
    ],
    normalize: (input) => {
      const match = SLOTS.district.values.find(
        d => d.toLowerCase() === input.trim().toLowerCase()
      );
      return match || input.trim();
    },
  },

  time_range: {
    description: "Time range for filtering",
    type: "time_range",
    patterns: [
      /(?:last|past)\s+(\d+)\s+(days?|months?|years?)/i,
      /(?:in|during)\s+(\d{4})/i,
      /(?:since|from)\s+(\w+\s+\d{4})/i,
      /(?:between)\s+(.+?)\s+and\s+(.+?)/i,
      /(today|yesterday|this week|this month|this year)/i,
    ],
    examples: ["last 30 days", "last 6 months", "2024", "since January", "this month"],
    normalize: (input) => {
      const now = new Date();
      const lower = input.toLowerCase().trim();

      if (lower === "today") return { start: now.toISOString().split("T")[0], end: now.toISOString().split("T")[0] };
      if (lower === "yesterday") {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return { start: y.toISOString().split("T")[0], end: y.toISOString().split("T")[0] };
      }
      if (lower === "this week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        return { start: start.toISOString().split("T")[0], end: now.toISOString().split("T")[0] };
      }
      if (lower === "this month") {
        return { start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, end: now.toISOString().split("T")[0] };
      }
      if (lower === "this year") {
        return { start: `${now.getFullYear()}-01-01`, end: now.toISOString().split("T")[0] };
      }

      const lastN = lower.match(/(?:last|past)\s+(\d+)\s+(day|month|year)/);
      if (lastN) {
        const n = parseInt(lastN[1]);
        const unit = lastN[2];
        const start = new Date(now);
        if (unit.startsWith("day")) start.setDate(start.getDate() - n);
        else if (unit.startsWith("month")) start.setMonth(start.getMonth() - n);
        else if (unit.startsWith("year")) start.setFullYear(start.getFullYear() - n);
        return { start: start.toISOString().split("T")[0], end: now.toISOString().split("T")[0] };
      }

      return { start: null, end: null };
    },
  },

  section_of_law: {
    description: "IPC or BNS section code",
    type: "string",
    patterns: [
      /\b(IPC|BNS|BNSS)\s*(\d+[A-Z]?)\b/i,
      /\bsection\s+(\d+[A-Z]?)\b/i,
    ],
    examples: ["IPC 379", "BNS 303", "section 420"],
    normalize: (match) => match.toUpperCase().replace(/\s+/g, "_"),
  },

  min_firs: {
    description: "Minimum number of FIRs for repeat offender search",
    type: "integer",
    patterns: [
      /(\d+)\+?\s*(?:FIR|case|incident)/i,
      /(?:at least|minimum|min)\s+(\d+)/i,
    ],
    examples: ["3+", "at least 3", "minimum 5"],
    normalize: (match) => parseInt(match),
  },

  target_entity: {
    description: "Generic target entity (name, ID, phone, location)",
    type: "string",
    patterns: [
      /(?:around|of|for|connected to|linked to)\s+(.+?)(?:\s|$)/i,
    ],
    examples: ["Ravi Kumar", "ACC_001", "PHONE_001", "Mysuru Central Market"],
  },

  hops: {
    description: "Number of graph hops for network traversal",
    type: "integer",
    patterns: [
      /(\d+)\s*hops?/i,
      /(\d+)\s*levels?/i,
    ],
    examples: ["2 hops", "3 levels"],
    normalize: (match) => Math.min(5, Math.max(1, parseInt(match))),
  },

  language: {
    description: "Language hint for the query",
    type: "enum",
    values: ["en", "kn", "mixed"],
    detect: (text) => {
      const kannadaRegex = /[\u0C80-\u0CFF]/;
      const hasKannada = kannadaRegex.test(text);
      const hasEnglish = /[a-zA-Z]/.test(text);
      if (hasKannada && hasEnglish) return "mixed";
      if (hasKannada) return "kn";
      return "en";
    },
  },
};

function extractSlots(text) {
  const slots = {};
  const lang = SLOTS.language.detect(text);
  slots.language = lang;

  for (const [slotName, config] of Object.entries(SLOTS)) {
    if (slotName === "language") continue;

    if (config.patterns) {
      for (const pattern of config.patterns) {
        const match = text.match(pattern);
        if (match) {
          slots[slotName] = config.normalize ? config.normalize(match[1] || match[0]) : match[1] || match[0];
          break;
        }
      }
    }
  }

  // Apply Kannada aliases for crime type
  if (lang === "kn" || lang === "mixed") {
    for (const [kannada, english] of Object.entries(SLOTS.crime_type.Kannada_aliases)) {
      if (text.includes(kannada)) {
        slots.crime_type = english;
        break;
      }
    }
  }

  return slots;
}

module.exports = { SLOTS, extractSlots };

if (require.main === module) {
  const testQueries = [
    "show FIR 2024/MSR/1234",
    "repeat offenders in Mysuru with 3+ FIRs",
    "show theft trends last 30 days in Bengaluru",
    "ಈ accused ಗೆ prior cases ಇದೆಯಾ?",
    "find similar cases from 2024",
  ];

  console.log("=== Slot Extraction Tests ===\n");
  for (const q of testQueries) {
    console.log(`Query: "${q}"`);
    const slots = extractSlots(q);
    console.log(`Slots: ${JSON.stringify(slots, null, 2)}`);
    console.log();
  }
}
