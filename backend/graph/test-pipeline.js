/**
 * GraphRAG End-to-End Test
 *
 * Tests the full pipeline with representative queries.
 * Run: node backend/graph/test-pipeline.js
 *
 * Task 4.8
 */

const FalkorClient = require("./client");
const GraphRAGPipeline = require("./pipeline");
const fs = require("fs");
const path = require("path");

const TEST_QUERIES = [
  {
    name: "Single FIR retrieval",
    intent: "retrieve_fir",
    slots: { fir_number: "2024/MSR/0001" },
  },
  {
    name: "FIR by crime type + district",
    intent: "retrieve_fir",
    slots: { crime_type: "theft", district: "Mysuru" },
  },
  {
    name: "Repeat offenders",
    intent: "search_offender",
    slots: { district: "Mysuru", min_firs: 3 },
  },
  {
    name: "Crime trends",
    intent: "show_trend",
    slots: { crime_type: "chain_snatching", district: "Bengaluru Urban" },
  },
  {
    name: "Network around accused",
    intent: "show_network",
    slots: { target_entity: "ACC_001" },
  },
];

async function runTests() {
  console.log("=== GraphRAG Pipeline E2E Test ===\n");

  // Load synthetic data
  const firsPath = path.join(
    __dirname,
    "../../data/synthetic/output/firs.json",
  );
  const firs = JSON.parse(fs.readFileSync(firsPath, "utf8"));
  console.log(`Loaded ${firs.length} FIRs\n`);

  // Connect to FalkorDB
  const client = new FalkorClient();
  await client.connect();

  // Initialize pipeline
  const pipeline = new GraphRAGPipeline(client);
  await pipeline.initialize(firs);

  // Run tests
  let passed = 0;
  let failed = 0;

  for (const test of TEST_QUERIES) {
    console.log(`--- ${test.name} ---`);
    try {
      const result = await pipeline.processQuery(test.intent, test.slots);
      console.log(`  Status: OK`);
      console.log(`  Graph results: ${result.graphResults}`);
      console.log(`  Vector results: ${result.vectorResults}`);
      console.log(`  Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`  Reasoning steps: ${result.reasoningPath.length}`);
      console.log(
        `  Response preview: ${result.response.substring(0, 100)}...`,
      );
      passed++;
    } catch (err) {
      console.log(`  Status: FAILED`);
      console.log(`  Error: ${err.message}`);
      failed++;
    }
    console.log();
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

  await client.disconnect();
}

runTests().catch(console.error);
