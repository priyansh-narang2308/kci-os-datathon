/**
 * Graph Statistics Dashboard (CLI)
 * 
 * Outputs node/edge counts, connectivity, community info.
 * Run: node backend/graph/stats.js
 * 
 * Task 2.5
 */

const FalkorClient = require("./client");

async function printStats(client) {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║     KCI-OS Knowledge Graph Stats         ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Node counts
  const nodeStats = await client.query(`
    MATCH (n)
    RETURN labels(n)[0] AS label, count(n) AS count
    ORDER BY count DESC
  `);

  console.log("📊 Node Counts:");
  console.log("─".repeat(40));
  let totalNodes = 0;
  for (const row of nodeStats) {
    if (row && row.label) {
      const bar = "█".repeat(Math.min(30, Math.ceil(row.count / 20)));
      console.log(`  ${row.label.padEnd(20)} ${String(row.count).padStart(5)}  ${bar}`);
      totalNodes += row.count;
    }
  }
  console.log("─".repeat(40));
  console.log(`  ${"TOTAL".padEnd(20)} ${String(totalNodes).padStart(5)}`);

  // Edge counts
  const edgeStats = await client.query(`
    MATCH ()-[r]->()
    RETURN type(r) AS type, count(r) AS count
    ORDER BY count DESC
  `);

  console.log("\n📊 Edge Counts:");
  console.log("─".repeat(40));
  let totalEdges = 0;
  for (const row of edgeStats) {
    if (row && row.type) {
      const bar = "█".repeat(Math.min(30, Math.ceil(row.count / 20)));
      console.log(`  ${row.type.padEnd(20)} ${String(row.count).padStart(5)}  ${bar}`);
      totalEdges += row.count;
    }
  }
  console.log("─".repeat(40));
  console.log(`  ${"TOTAL".padEnd(20)} ${String(totalEdges).padStart(5)}`);

  // Most connected nodes
  const connected = await client.query(`
    MATCH (n)
    WHERE EXISTS((n)--())
    OPTIONAL MATCH (n)-[r]-()
    RETURN labels(n)[0] AS label,
           CASE 
             WHEN n.name IS NOT NULL THEN n.name
             WHEN n.fir_no IS NOT NULL THEN n.fir_no
             ELSE n.accused_id || n.victim_id || n.location_id || n.phone_id
           END AS identifier,
           count(r) AS connections
    ORDER BY connections DESC
    LIMIT 10
  `);

  console.log("\n🔗 Most Connected Nodes:");
  console.log("─".repeat(50));
  for (const row of connected) {
    if (row && row.identifier) {
      console.log(`  ${row.label.padEnd(18)} ${String(row.identifier).padEnd(25)} ${String(row.connections).padStart(4)} edges`);
    }
  }

  // Crime type distribution
  const crimeTypes = await client.query(`
    MATCH (f:FIR)
    RETURN f.crime_type AS type, count(f) AS count
    ORDER BY count DESC
  `);

  console.log("\n📋 Crime Type Distribution:");
  console.log("─".repeat(40));
  for (const row of crimeTypes) {
    if (row && row.type) {
      const pct = ((row.count / totalNodes) * 100).toFixed(1);
      const bar = "█".repeat(Math.min(25, Math.ceil(row.count / 10)));
      console.log(`  ${row.type.padEnd(20)} ${String(row.count).padStart(4)}  ${bar}`);
    }
  }

  // District distribution
  const districts = await client.query(`
    MATCH (f:FIR)
    RETURN f.district AS district, count(f) AS count
    ORDER BY count DESC
  `);

  console.log("\n🗺️  District Distribution:");
  console.log("─".repeat(40));
  for (const row of districts) {
    if (row && row.district) {
      const bar = "█".repeat(Math.min(25, Math.ceil(row.count / 8)));
      console.log(`  ${row.district.padEnd(20)} ${String(row.count).padStart(4)}  ${bar}`);
    }
  }

  // Repeat offenders
  const repeat = await client.query(`
    MATCH (a:Accused)-[r:involved_in]->(f:FIR)
    WITH a, count(f) AS fir_count
    WHERE fir_count >= 3
    RETURN a.name AS name, a.accused_id AS id, fir_count
    ORDER BY fir_count DESC
    LIMIT 5
  `);

  console.log("\n🔄 Top Repeat Offenders:");
  console.log("─".repeat(50));
  for (const row of repeat) {
    if (row && row.name) {
      console.log(`  ${row.name.padEnd(25)} ${row.id.padEnd(12)} ${String(row.fir_count).padStart(3)} FIRs`);
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`Total: ${totalNodes} nodes, ${totalEdges} edges`);
}

async function main() {
  const client = new FalkorClient();
  await client.connect();
  await printStats(client);
  await client.disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { printStats };
