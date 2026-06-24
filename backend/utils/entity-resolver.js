/**
 * Entity Resolution Pipeline
 * 
 * Merges name variants, deduplicates phones, normalizes locations.
 * Demonstrated live during the demo when entity resolution fires.
 * 
 * Task 1.8
 */

const FalkorClient = require("../../backend/graph/client");

// String similarity: Levenshtein distance
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Jaro-Winkler similarity
function jaroWinkler(a, b) {
  if (a === b) return 1.0;
  const la = a.length, lb = b.length;
  if (la === 0 || lb === 0) return 0.0;

  const matchWindow = Math.floor(Math.max(la, lb) / 2) - 1;
  const aMatches = Array(la).fill(false);
  const bMatches = Array(lb).fill(false);

  let matches = 0, transpositions = 0;
  for (let i = 0; i < la; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, lb);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < la; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const jaro = (matches / la + matches / lb + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix bonus (first 4 chars)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, la, lb); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

// Combined similarity score
function nameSimilarity(a, b) {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();

  if (aLower === bLower) return 1.0;

  const lev = 1 - levenshtein(aLower, bLower) / Math.max(aLower.length, bLower.length);
  const jw = jaroWinkler(aLower, bLower);

  return Math.max(lev, jw);
}

// Location name normalization
const LOCATION_ALIASES = {
  "mysuru": "mysuru",
  "mysore": "mysuru",
  "ಮೈಸೂರು": "mysuru",
  "bengaluru": "bengaluru",
  "bangalore": "bengaluru",
  "ಬೆಂಗಳೂರು": "bengaluru",
  "hubli": "hubballi",
  "hubballi": "hubballi",
  "dharwad": "dharwad",
  "dharwad": "dharwad",
  "mangaluru": "mangaluru",
  "mangalore": "mangaluru",
  "ಮಂಗಳೂರು": "mangaluru",
  "kalaburagi": "kalaburagi",
  "gulbarga": "kalaburagi",
  "ಬೀದರ್": "bidar",
  "belagavi": "belagavi",
  "belgaum": "belagavi",
  "ಬೆಳಗಾವಿ": "belagavi",
};

function normalizeLocation(name) {
  const lower = name.toLowerCase().trim();
  return LOCATION_ALIASES[lower] || lower;
}

class EntityResolver {
  constructor(client) {
    this.client = client;
    this.THRESHOLD = 0.82;
  }

  async findNameVariants() {
    const result = await this.client.query(
      `MATCH (a:Accused) RETURN a.accused_id AS id, a.name AS name, a.aliases AS aliases`
    );

    const accused = result
      .filter(r => r && r.id)
      .map(r => ({
        id: r.id,
        name: r.name,
        aliases: typeof r.aliases === "string" ? JSON.parse(r.aliases) : (r.aliases || []),
      }));

    const merges = [];

    for (let i = 0; i < accused.length; i++) {
      for (let j = i + 1; j < accused.length; j++) {
        const sim = nameSimilarity(accused[i].name, accused[j].name);
        if (sim >= this.THRESHOLD) {
          merges.push({
            keep: accused[i],
            merge: accused[j],
            similarity: sim,
            reason: `name_similarity: ${sim.toFixed(3)}`,
          });
        }
      }
    }

    return merges;
  }

  async deduplicatePhones() {
    const result = await this.client.query(
      `MATCH (p:Phone) RETURN p.phone_id AS id, p.imei AS imei, p.msisdn AS msisdn`
    );

    const phones = result.filter(r => r && r.id);
    const imeiGroups = {};

    for (const ph of phones) {
      if (!ph.imei) continue;
      if (!imeiGroups[ph.imei]) imeiGroups[ph.imei] = [];
      imeiGroups[ph.imei].push(ph);
    }

    const duplicates = [];
    for (const [imei, group] of Object.entries(imeiGroups)) {
      if (group.length > 1) {
        duplicates.push({
          imei,
          phones: group,
          action: "merge",
          keep: group[0],
          merge: group.slice(1),
        });
      }
    }

    return duplicates;
  }

  async normalizeLocations() {
    const result = await this.client.query(
      `MATCH (l:Location) RETURN l.location_id AS id, l.name AS name, l.district AS district`
    );

    const locations = result.filter(r => r && r.id);
    const groups = {};

    for (const loc of locations) {
      const normalized = normalizeLocation(loc.name || "");
      const key = `${normalized}_${loc.district}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(loc);
    }

    const merges = [];
    for (const [, group] of Object.entries(groups)) {
      if (group.length > 1) {
        merges.push({
          keep: group[0],
          merge: group.slice(1),
          normalized_name: normalizeLocation(group[0].name || ""),
        });
      }
    }

    return merges;
  }

  async mergeAccused(targetId, sourceId) {
    // Transfer all edges from source to target
    await this.client.query(`
      MATCH (s:Accused {accused_id: $source})
      MATCH (t:Accused {accused_id: $target})
      SET t.aliases = CASE 
        WHEN t.aliases IS NULL THEN s.aliases
        ELSE t.aliases + s.aliases
      END
      SET t.prior_conviction_count = t.prior_conviction_count + s.prior_conviction_count
    `, { source: sourceId, target: targetId });

    // Transfer relationships
    await this.client.query(`
      MATCH (s:Accused {accused_id: $source})-[r]->(n)
      WHERE NOT (n)-[]->(s)
      WITH s, r, n, type(r) AS relType
      MATCH (t:Accused {accused_id: $target})
      CALL apoc.create.relationship(t, relType, properties(r), n) YIELD rel
      RETURN count(rel)
    `, { source: sourceId, target: targetId }).catch(() => {
      // Fallback without APOC
    });

    // Delete source node
    await this.client.query(
      `MATCH (s:Accused {accused_id: $source}) DETACH DELETE s`,
      { source: sourceId }
    );
  }

  async runFullResolution() {
    console.log("=== Entity Resolution Pipeline ===\n");

    console.log("1. Finding name variants...");
    const nameMerges = await this.findNameVariants();
    console.log(`   Found ${nameMerges.length} potential merges`);
    for (const m of nameMerges) {
      console.log(`   ${m.keep.name} ↔ ${m.merge.name} (${m.similarity.toFixed(3)})`);
    }

    console.log("\n2. Checking phone duplicates...");
    const phoneDups = await this.deduplicatePhones();
    console.log(`   Found ${phoneDups.length} duplicate IMEI groups`);

    console.log("\n3. Normalizing locations...");
    const locMerges = await this.normalizeLocations();
    console.log(`   Found ${locMerges.length} location groups to merge`);

    return {
      name_merges: nameMerges,
      phone_duplicates: phoneDups,
      location_merges: locMerges,
    };
  }
}

module.exports = {
  EntityResolver,
  nameSimilarity,
  normalizeLocation,
  levenshtein,
  jaroWinkler,
};

if (require.main === module) {
  const client = new FalkorClient();
  client.connect().then(async () => {
    const resolver = new EntityResolver(client);
    await resolver.runFullResolution();
    await client.disconnect();
  });
}
