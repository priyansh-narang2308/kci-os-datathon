/**
 * FalkorDB Client Test
 *
 * Quick smoke test to verify client connects and can run queries.
 * Run: node backend/graph/test.js
 */

const FalkorClient = require("./client");

async function test() {
  const client = new FalkorClient();

  try {
    // Test 1: Connect
    console.log("Test 1: Connecting to FalkorDB...");
    await client.connect();
    console.log("  ✓ Connected");

    // Test 2: Health check
    console.log("Test 2: Health check...");
    const healthy = await client.healthCheck();
    console.log(`  ✓ Health: ${healthy}`);

    // Test 3: Create a test node
    console.log("Test 3: Creating test node...");
    await client.query(
      "CREATE (n:TestNode {name: 'kci-test', created: timestamp()}) RETURN n",
    );
    console.log("  ✓ Node created");

    // Test 4: Query the node
    console.log("Test 4: Querying test node...");
    const result = await client.query(
      "MATCH (n:TestNode) RETURN n.name AS name",
    );
    console.log(`  ✓ Result: ${JSON.stringify(result)}`);

    // Test 5: Get stats
    console.log("Test 5: Graph stats...");
    const stats = await client.getStats();
    console.log(`  ✓ Stats: ${JSON.stringify(stats)}`);

    // Test 6: Cleanup
    console.log("Test 6: Cleaning up...");
    await client.query("MATCH (n:TestNode) DELETE n");
    console.log("  ✓ Cleaned up");

    // Test 7: Disconnect
    console.log("Test 7: Disconnecting...");
    await client.disconnect();
    console.log("  ✓ Disconnected");

    console.log("\n✅ All tests passed!");
  } catch (err) {
    console.error("\n❌ Test failed:", err.message);
    process.exit(1);
  }
}

test();
