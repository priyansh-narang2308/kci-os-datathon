/**
 * Query Planner — Schema-Grounded Cypher Generation
 *
 * Given intent + slots, generates a Cypher traversal plan constrained
 * to the exact node/edge types in the schema. No freeform generation.
 *
 * Task 4.1
 */

const { NODE_SCHEMA, EDGE_SCHEMA } = require("../../data/schema");

const VALID_LABELS = Object.keys(NODE_SCHEMA);
const VALID_EDGES = Object.keys(EDGE_SCHEMA);

class QueryPlanner {
  constructor() {
    this.templates = this.buildTemplates();
  }

  buildTemplates() {
    return {
      retrieve_fir: {
        single_fir: `
          MATCH (f:FIR {fir_no: $fir_no})
          OPTIONAL MATCH (a:Accused)-[r1:involved_in]->(f)
          OPTIONAL MATCH (v:Victim)-[r2:involved_in]->(f)
          OPTIONAL MATCH (f)-[r3:filed_at]->(ps:Police_Station)
          RETURN f,
                 collect(DISTINCT {name: a.name, id: a.accused_id, role: r1.role}) AS accused,
                 collect(DISTINCT {name: v.name, id: v.victim_id}) AS victims,
                 ps.name AS station_name, ps.district AS station_district
        `,
        by_crime_type: `
          MATCH (f:FIR)
          WHERE f.crime_type = $crime_type
            ${"{district_filter}"}
            ${"{date_filter}"}
          OPTIONAL MATCH (a:Accused)-[:involved_in]->(f)
          RETURN f.fir_no AS fir_no, f.date_filed AS date_filed,
                 f.status AS status, f.district AS district,
                 collect(a.name) AS accused_names
          ORDER BY f.date_filed DESC
          LIMIT 20
        `,
        by_district: `
          MATCH (f:FIR)
          WHERE f.district = $district
            ${"{date_filter}"}
          OPTIONAL MATCH (a:Accused)-[:involved_in]->(f)
          RETURN f.fir_no AS fir_no, f.date_filed AS date_filed,
                 f.crime_type AS crime_type, f.status AS status,
                 collect(a.name) AS accused_names
          ORDER BY f.date_filed DESC
          LIMIT 20
        `,
      },

      show_network: `
        MATCH (target {accused_id: $target_id})
        OPTIONAL MATCH (target)-[r1:involved_in]->(f:FIR)
        OPTIONAL MATCH (target)-[r2:called|linked_to|arrested_with]-(connected)
        OPTIONAL MATCH (target)-[r3:operates_at]->(loc:Location)
        RETURN target.name AS target_name,
               collect(DISTINCT {fir_no: f.fir_no, crime_type: f.crime_type}) AS linked_firs,
               collect(DISTINCT {
                 name: connected.name, id: connected.accused_id,
                 relationship: type(r2), confidence: r2.confidence
               }) AS connections,
               collect(DISTINCT {location: loc.name, type: loc.type}) AS locations
      `,

      search_offender: `
        MATCH (a:Accused)-[r:involved_in]->(f:FIR)
        ${"{district_filter}"}
        WITH a, count(f) AS fir_count,
             collect(f.fir_no)[0..5] AS sample_firs,
             collect(DISTINCT f.crime_type) AS crime_types,
             max(f.date_filed) AS last_fir
        WHERE fir_count >= ${"{min_firs}"}
        RETURN a.accused_id AS accused_id, a.name AS name,
               a.district AS district, fir_count,
               sample_firs, crime_types, last_fir
        ORDER BY fir_count DESC
        LIMIT 10
      `,

      show_trend: `
        MATCH (f:FIR)
        WHERE 1=1
          ${"{crime_filter}"}
          ${"{district_filter}"}
          ${"{date_filter}"}
        RETURN f.crime_type AS crime_type,
               f.district AS district,
               substring(f.date_filed, 0, 7) AS month,
               count(*) AS count
        ORDER BY month DESC
      `,
    };
  }

  generateCypher(intent, slots) {
    const template = this.selectTemplate(intent, slots);
    if (!template) {
      return { error: `No template found for intent: ${intent}` };
    }

    const filled = this.fillTemplate(template, slots);
    const validation = this.validateCypher(filled);

    if (!validation.valid) {
      return {
        error: `Invalid Cypher: ${validation.errors.join("; ")}`,
        cypher: filled,
      };
    }

    return { cypher: filled, params: this.buildParams(intent, slots) };
  }

  selectTemplate(intent, slots) {
    switch (intent) {
      case "retrieve_fir":
        if (slots.fir_number) return this.templates.retrieve_fir.single_fir;
        if (slots.crime_type && slots.district)
          return this.templates.retrieve_fir.by_crime_type;
        if (slots.district) return this.templates.retrieve_fir.by_district;
        if (slots.crime_type) return this.templates.retrieve_fir.by_crime_type;
        return this.templates.retrieve_fir.by_district;

      case "show_network":
        return this.templates.show_network;

      case "search_offender":
        return this.templates.search_offender;

      case "show_trend":
        return this.templates.show_trend;

      default:
        return null;
    }
  }

  fillTemplate(template, slots) {
    let cypher = template;

    // District filter
    if (slots.district) {
      cypher = cypher.replace(
        "${district_filter}",
        `AND f.district = "${slots.district}"`,
      );
    } else {
      cypher = cypher.replace("${district_filter}", "");
    }

    // Crime type filter
    if (slots.crime_type) {
      cypher = cypher.replace(
        "${crime_filter}",
        `AND f.crime_type = "${slots.crime_type}"`,
      );
    } else {
      cypher = cypher.replace("${crime_filter}", "");
    }

    // Date filter
    if (slots.time_range && slots.time_range.start) {
      cypher = cypher.replace(
        "${date_filter}",
        `AND f.date_filed >= "${slots.time_range.start}"`,
      );
    } else if (slots.time_range && slots.time_range.end) {
      cypher = cypher.replace(
        "${date_filter}",
        `AND f.date_filed <= "${slots.time_range.end}"`,
      );
    } else {
      cypher = cypher.replace("${date_filter}", "");
    }

    // Min FIRs
    cypher = cypher.replace("${min_firs}", String(slots.min_firs || 2));

    // Clean up multiple spaces and empty lines
    cypher = cypher
      .replace(/\n\s*\n/g, "\n")
      .replace(/  +/g, " ")
      .trim();

    return cypher;
  }

  buildParams(intent, slots) {
    const params = {};

    if (slots.fir_number) params.fir_no = slots.fir_number;
    if (slots.accused_name) params.target_id = slots.accused_name;
    if (slots.target_entity) {
      // Try to resolve as accused_id or name
      if (slots.target_entity.startsWith("ACC_")) {
        params.target_id = slots.target_entity;
      } else {
        params.target_name = slots.target_entity;
      }
    }

    return params;
  }

  validateCypher(cypher) {
    const errors = [];

    // Check for valid labels
    const labelPattern = /MATCH\s*\((\w+)?:(\w+)/gi;
    let match;
    while ((match = labelPattern.exec(cypher)) !== null) {
      if (!VALID_LABELS.includes(match[2])) {
        errors.push(`Invalid label: ${match[2]}`);
      }
    }

    // Check for valid edge types
    const edgePattern = /\[(\w+)?:(\w+)/gi;
    while ((match = edgePattern.exec(cypher)) !== null) {
      if (
        !VALID_EDGES.includes(match[2]) &&
        match[2] !== "r" &&
        !match[2].includes("|")
      ) {
        // Allow variable names like r1, r2
        const edgeType = match[2].replace(/\d+$/, "");
        if (!VALID_EDGES.includes(edgeType) && !match[2].includes("|")) {
          errors.push(`Invalid edge type: ${match[2]}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

module.exports = QueryPlanner;

if (require.main === module) {
  const planner = new QueryPlanner();

  const tests = [
    { intent: "retrieve_fir", slots: { fir_number: "2024/MSR/1234" } },
    {
      intent: "retrieve_fir",
      slots: { crime_type: "theft", district: "Mysuru" },
    },
    { intent: "show_network", slots: { target_entity: "ACC_001" } },
    { intent: "search_offender", slots: { district: "Mysuru", min_firs: 3 } },
    {
      intent: "show_trend",
      slots: { crime_type: "chain_snatching", district: "Bengaluru Urban" },
    },
  ];

  console.log("=== Query Planner Tests ===\n");
  for (const test of tests) {
    console.log(`Intent: ${test.intent}, Slots: ${JSON.stringify(test.slots)}`);
    const result = planner.generateCypher(test.intent, test.slots);
    if (result.error) {
      console.log(`  ERROR: ${result.error}`);
    } else {
      console.log(`  Cypher: ${result.cypher.substring(0, 100)}...`);
      console.log(`  Params: ${JSON.stringify(result.params)}`);
    }
    console.log();
  }
}
