/**
 * Cross-Link Synthetic Data Generator
 * 
 * Creates inter-entity relationships: gangs, repeat offenders, shared phones,
 * cross-district links, MO-matching FIRs.
 * Task 1.6 — Build Cross-Link Synthetic Data
 */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

// ============================================================
// Gang structures (3 crews of 4-6 members each)
// ============================================================
const GANGS = [
  {
    name: "Mysuru Chain-Snatching Gang",
    territory: "Mysuru",
    members: ["ACC_001", "ACC_008", "ACC_014", "ACC_021", "ACC_009"],
    shared_phones: ["PHONE_001", "PHONE_002"],
    crime_focus: "chain_snatching",
  },
  {
    name: "Bengaluru Burglary Ring",
    territory: "Bengaluru Urban",
    members: ["ACC_002", "ACC_006", "ACC_011", "ACC_015", "ACC_023", "ACC_018"],
    shared_phones: ["PHONE_003", "PHONE_004"],
    crime_focus: "burglary",
  },
  {
    name: "Hubli Theft Crew",
    territory: "Hubli-Dharwad",
    members: ["ACC_004", "ACC_010", "ACC_016", "ACC_024"],
    shared_phones: ["PHONE_005", "PHONE_006"],
    crime_focus: "theft",
  },
];

// ============================================================
// Repeat offenders (2 with 5+ FIRs)
// ============================================================
const REPEAT_OFFENDERS = [
  {
    accused_id: "ACC_001",  // Ravi Kumar — Mysuru Chain-Snatching Gang leader
    fir_count: 7,
    districts: ["Mysuru"],
    crime_types: ["chain_snatching", "theft"],
  },
  {
    accused_id: "ACC_006",  // Darshan Raj — Bengaluru Burglary Ring
    fir_count: 5,
    districts: ["Bengaluru Urban"],
    crime_types: ["burglary", "theft"],
  },
];

// ============================================================
// Financial trail (shared bank account)
// ============================================================
const FINANCIAL_LINK = {
  accused_ids: ["ACC_002", "ACC_006"],  // Suresh Babu and Darshan Raj
  description: "Shared bank account used for receiving stolen goods proceeds",
};

function generateGangEdges(accusedList) {
  const edges = [];

  for (const gang of GANGS) {
    // Co-accused edges within gang
    for (let i = 0; i < gang.members.length; i++) {
      for (let j = i + 1; j < gang.members.length; j++) {
        edges.push({
          type: "arrested_with",
          from: gang.members[i],
          to: gang.members[j],
          properties: {
            fir_no: `SHARED_GANG_${gang.name.replace(/\s/g, "_").substring(0, 10)}`,
            arrest_date: `2024-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
          },
          source: "gang_membership",
          confidence: 0.85,
        });
      }
    }

    // Shared phone edges
    if (gang.shared_phones.length >= 2) {
      for (let i = 0; i < gang.shared_phones.length; i++) {
        for (let j = i + 1; j < gang.shared_phones.length; j++) {
          edges.push({
            type: "called",
            from: gang.shared_phones[i],
            to: gang.shared_phones[j],
            properties: {
              timestamp: new Date().toISOString(),
              duration_seconds: randomInt(30, 600),
              frequency_count: randomInt(10, 200),
              first_seen: `2024-01-01T00:00:00Z`,
              last_seen: `2024-12-01T00:00:00Z`,
            },
            source: "CDR",
            confidence: 0.9,
          });
        }
      }
    }

    // Gang operates in territory
    edges.push({
      type: "operates_at",
      from: gang.members[0], // Leader
      to: `LOC_${randomInt(1, 20)}`,
      properties: {
        activity_type: "hideout",
        confidence: 0.8,
        source: "intelligence_report",
      },
      source: "intelligence_report",
      confidence: 0.8,
    });
  }

  return edges;
}

function generateRepeatOffenderEdges(firs) {
  const edges = [];

  for (const offender of REPEAT_OFFENDERS) {
    // These accused appear in many FIRs — already handled by FIR generation
    // Add operates_at edges for their territory
    for (const district of offender.districts) {
      edges.push({
        type: "operates_at",
        from: offender.accused_id,
        to: `LOC_${randomInt(1, 20)}`,
        properties: {
          activity_type: "frequent_area",
          confidence: 0.75,
          source: "pattern_detected",
        },
        source: "pattern_detected",
        confidence: 0.75,
      });
    }
  }

  return edges;
}

function generateFinancialEdges() {
  return [
    {
      type: "linked_to",
      from: FINANCIAL_LINK.accused_ids[0],
      to: FINANCIAL_LINK.accused_ids[1],
      properties: {
        evidence_type: "financial_link",
        weight: 0.8,
        is_hypothesis: false,
        added_by: "system",
      },
      source: "financial_analysis",
      confidence: 0.8,
    },
  ];
}

function generateMOEdges(firs) {
  const edges = [];
  const moGroups = {};

  // Group FIRs by crime_type + similar MO features
  for (const fir of firs) {
    const key = `${fir.crime_type}_${fir.district}`;
    if (!moGroups[key]) moGroups[key] = [];
    moGroups[key].push(fir.fir_no);
  }

  // Create similar_MO_to edges within groups
  for (const [key, firNos] of Object.entries(moGroups)) {
    if (firNos.length < 2) continue;

    // Only link a subset to avoid too many edges
    const subset = firNos.slice(0, Math.min(5, firNos.length));
    for (let i = 0; i < subset.length; i++) {
      for (let j = i + 1; j < subset.length; j++) {
        const similarity = 0.6 + Math.random() * 0.35; // 0.60 to 0.95
        if (similarity > 0.7) {
          edges.push({
            type: "similar_MO_to",
            from: subset[i],
            to: subset[j],
            properties: {
              similarity_score: parseFloat(similarity.toFixed(2)),
              shared_features: pick([
                ["entry_method", "time_of_day"],
                ["weapon_type", "target_type"],
                ["time_of_day", "location_type"],
                ["entry_method", "escape_method"],
              ]),
              model_version: "v1.0",
            },
            source: "algorithmic",
            confidence: similarity,
          });
        }
      }
    }
  }

  return edges;
}

function generateCrossDistrictLinks() {
  const edges = [];

  // 8% of accused have cross-district phone links
  const crossDistrictPairs = [
    { from: "ACC_001", to: "ACC_006", reason: "shared_phone" },
    { from: "ACC_002", to: "ACC_010", reason: "shared_phone" },
    { from: "ACC_004", to: "ACC_018", reason: "shared_phone" },
  ];

  for (const pair of crossDistrictPairs) {
    edges.push({
      type: "linked_to",
      from: pair.from,
      to: pair.to,
      properties: {
        evidence_type: "phone_record",
        weight: 0.7,
        is_hypothesis: false,
        added_by: "system",
      },
      source: "CDR_analysis",
      confidence: 0.7,
    });
  }

  return edges;
}

function generateAllCrossLinks(firs) {
  const gangEdges = generateGangEdges();
  const repeatEdges = generateRepeatOffenderEdges(firs);
  const financialEdges = generateFinancialEdges();
  const moEdges = generateMOEdges(firs);
  const crossDistrictEdges = generateCrossDistrictLinks();

  const allEdges = [
    ...gangEdges,
    ...repeatEdges,
    ...financialEdges,
    ...moEdges,
    ...crossDistrictEdges,
  ];

  console.log(`Generated ${allEdges.length} cross-link edges:`);
  const typeCounts = {};
  allEdges.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  Object.entries(typeCounts).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

  return allEdges;
}

module.exports = {
  GANGS,
  REPEAT_OFFENDERS,
  FINANCIAL_LINK,
  generateGangEdges,
  generateRepeatOffenderEdges,
  generateFinancialEdges,
  generateMOEdges,
  generateCrossDistrictLinks,
  generateAllCrossLinks,
};

if (require.main === module) {
  const { generateAllFIRs } = require("./fir-generator");
  const firs = generateAllFIRs(500);
  generateAllCrossLinks(firs);
}
