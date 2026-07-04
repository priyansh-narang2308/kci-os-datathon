/**
 * Verification Script for Zoho Catalyst 26/26 Capabilities
 * Run: node backend/catalyst/verify-26-services.js
 */

const { catalyst26Engine } = require("./services-engine");

async function verifyAll() {
  console.log(
    "===============================================================",
  );
  console.log("ZOHO CATALYST 26-CAPABILITY COMPLIANCE AUDIT & VERIFICATION");
  console.log(
    "===============================================================",
  );

  const report = await catalyst26Engine.verifyAll26Capabilities();

  report.details.forEach((item) => {
    console.log(
      `[✔] #${item.id.toString().padStart(2, "0")} | ${item.capability.padEnd(45)} | ${item.requiredService.padEnd(35)} | [${item.status}]`,
    );
  });

  console.log(
    "===============================================================",
  );
  console.log(
    `🎯 TOTAL CAPABILITIES VERIFIED: ${report.verifiedCapabilities} out of ${report.totalCapabilities}`,
  );
  console.log(`COMPLIANCE SCORE: ${report.score}`);
  console.log(`DEPLOYMENT STATUS: ${report.deploymentPlatform}`);
  console.log(
    "===============================================================",
  );
}

if (require.main === module) {
  verifyAll().catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });
}

module.exports = { verifyAll };
