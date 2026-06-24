/**
 * Master Data Seeding Script
 * 
 * Combines all generators and produces the full synthetic dataset.
 * Run: node data/synthetic/seed.js
 * 
 * Tasks 1.3 + 1.4 + 1.5 + 1.6
 */

const { generateAllFIRs } = require("./fir-generator");
const { enrichAllFIRs } = require("./narrative-generator");
const { generateAllEntities } = require("./entity-generator");
const { generateAllCrossLinks } = require("./crosslink-generator");
const fs = require("fs");
const path = require("path");

function main() {
  console.log("=== KCI-OS Synthetic Data Generator ===\n");

  // 1. Generate FIRs
  console.log("1. Generating FIRs...");
  const rawFirs = generateAllFIRs(500);
  const firs = enrichAllFIRs(rawFirs);
  console.log(`   Generated ${firs.length} FIRs\n`);

  // 2. Generate entities
  console.log("2. Generating entities...");
  const entities = generateAllEntities();
  Object.entries(entities).forEach(([type, arr]) => {
    console.log(`   ${type}: ${arr.length}`);
  });
  console.log();

  // 3. Generate cross-links
  console.log("3. Generating cross-links...");
  const crossLinks = generateAllCrossLinks(firs);
  console.log();

  // 4. Assign FIRs to accused and victims
  console.log("4. Assigning FIR-Accused and FIR-Victim links...");
  const firAccusedEdges = [];
  const firVictimEdges = [];

  for (const fir of firs) {
    // Each FIR has 1-3 accused
    const accusedCount = Math.random() < 0.3 ? 2 : Math.random() < 0.1 ? 3 : 1;
    const accusedIds = [];
    for (let i = 0; i < accusedCount; i++) {
      const accused = pick(entities.accused);
      accusedIds.push(accused.accused_id);
      firAccusedEdges.push({
        type: "involved_in",
        from: accused.accused_id,
        to: fir.fir_no,
        properties: { role: "accused" },
        source: "FIR_record",
        confidence: 0.95,
      });
    }

    // Each FIR has 1-2 victims
    const victimCount = Math.random() < 0.2 ? 2 : 1;
    for (let i = 0; i < victimCount; i++) {
      const victim = pick(entities.victims);
      firVictimEdges.push({
        type: "involved_in",
        from: victim.victim_id,
        to: fir.fir_no,
        properties: { role: "victim" },
        source: "FIR_record",
        confidence: 0.95,
      });
    }

    // Link FIR to police station
    const ps = entities.police_stations.find(p => p.district === fir.district) || pick(entities.police_stations);
    fir.filed_at_ps = ps.ps_id;
  }

  console.log(`   FIR-Accused links: ${firAccusedEdges.length}`);
  console.log(`   FIR-Victim links: ${firVictimEdges.length}`);
  console.log();

  // 5. Assign phones to accused
  console.log("5. Assigning phones to accused...");
  const phoneAccusedEdges = [];
  entities.accused.forEach((accused, i) => {
    if (i < entities.phones.length) {
      const phone = entities.phones[i];
      phone.registration_name = accused.name;
      phone.owner_confidence = 0.85 + Math.random() * 0.15;

      phoneAccusedEdges.push({
        type: "linked_to",
        from: accused.accused_id,
        to: phone.phone_id,
        properties: {
          evidence_type: "phone_record",
          weight: phone.owner_confidence,
          is_hypothesis: false,
          added_by: "system",
        },
        source: "registration_record",
        confidence: phone.owner_confidence,
      });
    }
  });
  console.log(`   Phone-Accused links: ${phoneAccusedEdges.length}`);
  console.log();

  // 6. Compile full dataset
  const dataset = {
    metadata: {
      generated_at: new Date().toISOString(),
      firs: firs.length,
      entities: Object.fromEntries(Object.entries(entities).map(([k, v]) => [k, v.length])),
      total_edges: firAccusedEdges.length + firVictimEdges.length + crossLinks.length + phoneAccusedEdges.length,
    },
    firs,
    entities,
    edges: {
      fir_accused: firAccusedEdges,
      fir_victim: firVictimEdges,
      phone_accused: phoneAccusedEdges,
      cross_links: crossLinks,
    },
  };

  // 7. Write to files
  const outDir = path.join(__dirname, "output");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  fs.writeFileSync(path.join(outDir, "firs.json"), JSON.stringify(firs, null, 2));
  fs.writeFileSync(path.join(outDir, "entities.json"), JSON.stringify(entities, null, 2));
  fs.writeFileSync(path.join(outDir, "edges.json"), JSON.stringify(dataset.edges, null, 2));
  fs.writeFileSync(path.join(outDir, "metadata.json"), JSON.stringify(dataset.metadata, null, 2));

  console.log("=== Summary ===");
  console.log(JSON.stringify(dataset.metadata, null, 2));
  console.log(`\nOutput written to: ${outDir}/`);
  console.log("  firs.json");
  console.log("  entities.json");
  console.log("  edges.json");
  console.log("  metadata.json");

  return dataset;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

if (require.main === module) {
  main();
}

module.exports = { main };
