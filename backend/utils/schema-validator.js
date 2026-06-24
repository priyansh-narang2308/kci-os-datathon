/**
 * Graph Schema Validator
 * 
 * Validates Cypher queries against the schema, checks node/edge properties,
 * and identifies orphan nodes.
 * 
 * Task 2.4
 */

const { NODE_SCHEMA, EDGE_SCHEMA } = require("../../data/schema");

class SchemaValidator {
  constructor(client) {
    this.client = client;
    this.validLabels = Object.keys(NODE_SCHEMA);
    this.validEdgeTypes = Object.keys(EDGE_SCHEMA);
  }

  validateCypherQuery(cypher) {
    const errors = [];
    const warnings = [];

    // Check for node labels used in query
    const labelPattern = /MATCH\s*\((\w+)?:(\w+)/gi;
    let match;
    while ((match = labelPattern.exec(cypher)) !== null) {
      const label = match[2];
      if (!this.validLabels.includes(label)) {
        errors.push(`Invalid node label: ${label}. Valid: ${this.validLabels.join(", ")}`);
      }
    }

    // Check for edge types used in query
    const edgePattern = /\[(\w+)?:(\w+)/gi;
    while ((match = edgePattern.exec(cypher)) !== null) {
      const edgeType = match[2];
      if (!this.validEdgeTypes.includes(edgeType)) {
        errors.push(`Invalid edge type: ${edgeType}. Valid: ${this.validEdgeTypes.join(", ")}`);
      }
    }

    // Check for potentially dangerous patterns
    if (cypher.includes("DELETE") && !cypher.includes("DETACH DELETE")) {
      warnings.push("DELETE without DETACH may fail if node has relationships");
    }

    if (cypher.includes("SET") && cypher.includes("$")) {
      // Parameterized SET is fine
    } else if (cypher.includes("SET") && /SET\s+\w+\.\w+\s*=\s*['"]/i.test(cypher)) {
      warnings.push("String interpolation in SET — use parameters instead");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateNodeProperties(label, properties) {
    const schema = NODE_SCHEMA[label];
    if (!schema) {
      return { valid: false, errors: [`Unknown node label: ${label}`] };
    }

    const errors = [];

    for (const [name, config] of Object.entries(schema.properties)) {
      if (config.required && !(name in properties)) {
        errors.push(`Missing required property: ${name}`);
      }
      if (name in properties && config.enum && !config.enum.includes(properties[name])) {
        errors.push(`Invalid value for ${name}: ${properties[name]}. Must be one of: ${config.enum.join(", ")}`);
      }
    }

    for (const name of Object.keys(properties)) {
      if (!(name in schema.properties) && name !== "created_at") {
        warnings.push(`Unknown property: ${name}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async findOrphanNodes() {
    const orphans = [];

    for (const label of this.validLabels) {
      const result = await this.client.query(`
        MATCH (n:${label})
        WHERE NOT (n)--()
        RETURN n.${NODE_SCHEMA[label].properties[Object.keys(NODE_SCHEMA[label].properties)[0]].type === "string" ?
          Object.keys(NODE_SCHEMA[label].properties)[0] : "name"} AS identifier
        LIMIT 10
      `);

      if (result.length > 0) {
        orphans.push({
          label,
          count: result.length,
          samples: result.map(r => r.identifier),
        });
      }
    }

    return orphans;
  }

  async validateGraphIntegrity() {
    const issues = [];

    // Check for FIRs without filed_at edges
    const firsWithoutPS = await this.client.query(`
      MATCH (f:FIR)
      WHERE NOT (f)-[:filed_at]->(:Police_Station)
      RETURN count(f) AS count
    `);
    if (firsWithoutPS[0]?.count > 0) {
      issues.push({
        type: "missing_filed_at",
        count: firsWithoutPS[0].count,
        description: "FIRs without filed_at edge to Police_Station",
      });
    }

    // Check for edges with null confidence
    const nullConfidence = await this.client.query(`
      MATCH ()-[r]->()
      WHERE r.confidence IS NULL
      RETURN type(r) AS edge_type, count(r) AS count
    `);
    for (const row of nullConfidence) {
      issues.push({
        type: "null_confidence",
        edge_type: row.edge_type,
        count: row.count,
        description: `${row.edge_type} edges with null confidence score`,
      });
    }

    // Check for accused without any FIR involvement
    const accusedNoFIR = await this.client.query(`
      MATCH (a:Accused)
      WHERE NOT (a)-[:involved_in]->(:FIR)
      RETURN a.accused_id AS id, a.name AS name
      LIMIT 10
    `);
    if (accusedNoFIR.length > 0) {
      issues.push({
        type: "accused_no_fir",
        count: accusedNoFIR.length,
        samples: accusedNoFIR,
        description: "Accused nodes not linked to any FIR",
      });
    }

    return issues;
  }

  async runFullValidation() {
    console.log("=== Graph Schema Validation ===\n");

    console.log("1. Node label validation...");
    const validLabels = this.validLabels;
    console.log(`   Valid labels: ${validLabels.join(", ")}`);

    console.log("\n2. Edge type validation...");
    const validEdges = this.validEdgeTypes;
    console.log(`   Valid edges: ${validEdges.join(", ")}`);

    console.log("\n3. Checking for orphan nodes...");
    const orphans = await this.findOrphanNodes();
    if (orphans.length === 0) {
      console.log("   No orphan nodes found");
    } else {
      for (const o of orphans) {
        console.log(`   ${o.label}: ${o.count} orphans`);
      }
    }

    console.log("\n4. Checking graph integrity...");
    const issues = await this.validateGraphIntegrity();
    if (issues.length === 0) {
      console.log("   Graph integrity OK");
    } else {
      for (const issue of issues) {
        console.log(`   ${issue.type}: ${issue.description}`);
      }
    }

    return { orphans, issues };
  }
}

module.exports = SchemaValidator;
