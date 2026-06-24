/**
 * Data Seeding Script — Load Synthetic Data into FalkorDB
 * 
 * Reads output/*.json from seed.js and loads into the Knowledge Graph.
 * Idempotent: uses MERGE to avoid duplicates.
 * 
 * Run: node data/seeds/seed-graph.js
 * Task 1.7
 */

const FalkorClient = require("../../backend/graph/client");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "../synthetic/output");

async function seedNodes(client, entities) {
  console.log("Seeding nodes...");

  // Police Stations
  for (const ps of entities.police_stations) {
    await client.query(`
      MERGE (n:Police_Station {ps_id: $ps_id})
      SET n.name = $name, n.district = $district, n.taluk = $taluk,
          n.lat = $lat, n.long = $long
    `, ps);
  }
  console.log(`  Police_Station: ${entities.police_stations.length}`);

  // Locations
  for (const loc of entities.locations) {
    await client.query(`
      MERGE (n:Location {location_id: $location_id})
      SET n.name = $name, n.lat = $lat, n.long = $long,
          n.type = $type, n.taluk = $taluk, n.district = $district,
          n.state = $state
    `, loc);
  }
  console.log(`  Location: ${entities.locations.length}`);

  // Accused
  for (const acc of entities.accused) {
    await client.query(`
      MERGE (n:Accused {accused_id: $accused_id})
      SET n.name = $name, n.aliases = $aliases, n.age = $age,
          n.gender = $gender, n.address = $address, n.district = $district,
          n.prior_conviction_count = $prior_conviction_count
    `, { ...acc, aliases: JSON.stringify(acc.aliases) });
  }
  console.log(`  Accused: ${entities.accused.length}`);

  // Victims
  for (const vic of entities.victims) {
    await client.query(`
      MERGE (n:Victim {victim_id: $victim_id})
      SET n.name = $name, n.age = $age, n.gender = $gender,
          n.address = $address, n.district = $district,
          n.vulnerability_flag = $vulnerability_flag
    `, vic);
  }
  console.log(`  Victim: ${entities.victims.length}`);

  // Phones
  for (const ph of entities.phones) {
    await client.query(`
      MERGE (n:Phone {phone_id: $phone_id})
      SET n.imei = $imei, n.msisdn = $msisdn,
          n.registration_name = $registration_name,
          n.owner_confidence = $owner_confidence
    `, ph);
  }
  console.log(`  Phone: ${entities.phones.length}`);

  // Vehicles
  for (const v of entities.vehicles) {
    await client.query(`
      MERGE (n:Vehicle {vehicle_id: $vehicle_id})
      SET n.reg_no = $reg_no, n.type = $type, n.color = $color
    `, v);
  }
  console.log(`  Vehicle: ${entities.vehicles.length}`);

  // FIRs (created separately to handle volume)
  console.log("  FIRs: (see next step)");
}

async function seedFIRs(client, firs) {
  console.log(`\nSeeding ${firs.length} FIRs...`);

  const BATCH_SIZE = 50;
  let seeded = 0;

  for (let i = 0; i < firs.length; i += BATCH_SIZE) {
    const batch = firs.slice(i, i + BATCH_SIZE);
    const queries = batch.map(fir => ({
      cypher: `
        MERGE (n:FIR {fir_no: $fir_no})
        SET n.police_station_id = $police_station_id, n.date_filed = $date_filed,
            n.crime_type = $crime_type, n.sections_of_law = $sections_of_law,
            n.status = $status, n.narrative_text = $narrative_text,
            n.lat = $lat, n.long = $long,
            n.investigating_officer_id = $investigating_officer_id,
            n.district = $district, n.created_at = $created_at
      `,
      params: {
        ...fir,
        sections_of_law: JSON.stringify(fir.sections_of_law),
      },
    }));

    for (const q of queries) {
      await client.query(q.cypher, q.params);
    }

    seeded += batch.length;
    process.stdout.write(`\r  FIRs seeded: ${seeded}/${firs.length}`);
  }

  console.log("\n  FIRs done.");
}

async function seedEdges(client, edges) {
  console.log("\nSeeding edges...");

  // FIR-Accused edges (involved_in)
  let count = 0;
  for (const edge of edges.fir_accused) {
    await client.query(`
      MATCH (a:Accused {accused_id: $from_id})
      MATCH (f:FIR {fir_no: $to_id})
      MERGE (a)-[r:involved_in]->(f)
      SET r.role = $role, r.confidence = $confidence, r.source = $source
    `, {
      from_id: edge.from,
      to_id: edge.to,
      role: edge.properties.role,
      confidence: edge.confidence,
      source: edge.source,
    });
    count++;
    if (count % 100 === 0) process.stdout.write(`\r  involved_in: ${count}`);
  }
  console.log(`\r  involved_in: ${count}`);

  // FIR-Victim edges (involved_in)
  count = 0;
  for (const edge of edges.fir_victim) {
    await client.query(`
      MATCH (v:Victim {victim_id: $from_id})
      MATCH (f:FIR {fir_no: $to_id})
      MERGE (v)-[r:involved_in]->(f)
      SET r.role = $role, r.confidence = $confidence, r.source = $source
    `, {
      from_id: edge.from,
      to_id: edge.to,
      role: edge.properties.role,
      confidence: edge.confidence,
      source: edge.source,
    });
    count++;
  }
  console.log(`  involved_in (victim): ${count}`);

  // Phone-Accused edges (linked_to)
  count = 0;
  for (const edge of edges.phone_accused) {
    await client.query(`
      MATCH (a:Accused {accused_id: $from_id})
      MATCH (p:Phone {phone_id: $to_id})
      MERGE (a)-[r:linked_to]->(p)
      SET r.evidence_type = $evidence_type, r.weight = $weight,
          r.is_hypothesis = $is_hypothesis, r.confidence = $confidence,
          r.source = $source
    `, {
      from_id: edge.from,
      to_id: edge.to,
      evidence_type: edge.properties.evidence_type,
      weight: edge.properties.weight,
      is_hypothesis: edge.properties.is_hypothesis,
      confidence: edge.confidence,
      source: edge.source,
    });
    count++;
  }
  console.log(`  linked_to (phone): ${count}`);

  // Cross-link edges
  count = 0;
  for (const edge of edges.cross_links) {
    const fromLabel = edge.from.startsWith("ACC") ? "Accused" :
                      edge.from.startsWith("PHONE") ? "Phone" : "FIR";
    const toLabel = edge.to.startsWith("ACC") ? "Accused" :
                    edge.to.startsWith("PHONE") ? "Phone" :
                    edge.to.startsWith("LOC") ? "Location" : "FIR";
    const idField = fromLabel === "Accused" ? "accused_id" :
                    fromLabel === "Phone" ? "phone_id" : "fir_no";
    const toIdField = toLabel === "Accused" ? "accused_id" :
                      toLabel === "Phone" ? "phone_id" :
                      toLabel === "Location" ? "location_id" : "fir_no";

    let edgeCypher;
    if (edge.type === "called") {
      edgeCypher = `
        MATCH (a:Phone {phone_id: $from_id})
        MATCH (b:Phone {phone_id: $to_id})
        MERGE (a)-[r:called]->(b)
        SET r.timestamp = $timestamp, r.duration_seconds = $duration_seconds,
            r.frequency_count = $frequency_count, r.confidence = $confidence
      `;
    } else if (edge.type === "arrested_with") {
      edgeCypher = `
        MATCH (a:Accused {accused_id: $from_id})
        MATCH (b:Accused {accused_id: $to_id})
        MERGE (a)-[r:arrested_with]->(b)
        SET r.fir_no = $fir_no, r.confidence = $confidence
      `;
    } else if (edge.type === "operates_at") {
      const locId = edge.to.startsWith("LOC") ? edge.to : "LOC_001";
      edgeCypher = `
        MATCH (a:Accused {accused_id: $from_id})
        MATCH (l:Location {location_id: $to_id})
        MERGE (a)-[r:operates_at]->(l)
        SET r.activity_type = $activity_type, r.source = $source,
            r.confidence = $confidence
      `;
      await client.query(edgeCypher, {
        from_id: edge.from,
        to_id: locId,
        activity_type: edge.properties.activity_type,
        source: edge.source,
        confidence: edge.confidence,
      });
      count++;
      continue;
    } else if (edge.type === "similar_MO_to") {
      edgeCypher = `
        MATCH (a:FIR {fir_no: $from_id})
        MATCH (b:FIR {fir_no: $to_id})
        MERGE (a)-[r:similar_MO_to]->(b)
        SET r.similarity_score = $similarity_score, r.shared_features = $shared_features,
            r.model_version = $model_version, r.confidence = $confidence
      `;
    } else {
      edgeCypher = `
        MATCH (a {${idField}: $from_id})
        MATCH (b {${toIdField}: $to_id})
        MERGE (a)-[r:linked_to]->(b)
        SET r.evidence_type = $evidence_type, r.weight = $weight,
            r.is_hypothesis = $is_hypothesis, r.confidence = $confidence
      `;
    }

    const params = {
      from_id: edge.from,
      to_id: edge.to,
      confidence: edge.confidence,
    };

    if (edge.type === "called") {
      Object.assign(params, edge.properties);
    } else if (edge.type === "arrested_with") {
      params.fir_no = edge.properties.fir_no;
    } else if (edge.type === "similar_MO_to") {
      params.similarity_score = edge.properties.similarity_score;
      params.shared_features = JSON.stringify(edge.properties.shared_features);
      params.model_version = edge.properties.model_version;
    } else if (edge.properties) {
      Object.assign(params, edge.properties);
    }

    await client.query(edgeCypher, params);
    count++;
    if (count % 50 === 0) process.stdout.write(`\r  cross-links: ${count}`);
  }
  console.log(`\r  cross-links: ${count}`);

  // filed_at edges (FIR → Police_Station)
  count = 0;
  for (const fir of require(path.join(OUTPUT_DIR, "firs.json"))) {
    if (fir.filed_at_ps) {
      await client.query(`
        MATCH (f:FIR {fir_no: $fir_no})
        MATCH (ps:Police_Station {ps_id: $ps_id})
        MERGE (f)-[r:filed_at]->(ps)
        SET r.confidence = 1.0
      `, { fir_no: fir.fir_no, ps_id: fir.filed_at_ps });
      count++;
    }
  }
  console.log(`  filed_at: ${count}`);
}

async function main() {
  console.log("=== KCI-OS Graph Seeding ===\n");

  const client = new FalkorClient();
  await client.connect();

  // Load data
  const entities = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "entities.json"), "utf8"));
  const firs = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "firs.json"), "utf8"));
  const edges = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "edges.json"), "utf8"));

  // Seed
  await seedNodes(client, entities);
  await seedFIRs(client, firs);
  await seedEdges(client, edges);

  // Stats
  const stats = await client.getStats();
  console.log("\n=== Seeding Complete ===");
  console.log(`Nodes: ${stats.nodes}`);
  console.log(`Edges: ${stats.edges}`);
  console.log(`Labels: ${stats.labels}`);

  await client.disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedNodes, seedFIRs, seedEdges };
