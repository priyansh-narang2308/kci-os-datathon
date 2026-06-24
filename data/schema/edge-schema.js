/**
 * KCI-OS Graph Edge Schema
 * 
 * Defines all 8 core edge types, their direction, properties, and confidence scoring.
 * Task 1.2 — Define Graph Edge Schema
 */

const EDGE_SCHEMA = {
  // ============================================================
  // involved_in — Accused/Victim linked to FIR
  // ============================================================
  involved_in: {
    name: "involved_in",
    description: "Links an Accused or Victim to a FIR they are involved in",
    from: ["Accused", "Victim"],
    to: ["FIR"],
    properties: {
      role: {
        type: "string",
        required: true,
        enum: ["accused", "victim", "witness"],
        description: "Role of the person in this FIR",
      },
      arrest_date: {
        type: "date",
        required: false,
      },
    },
    confidence: {
      default: 0.95,
      source: "FIR record",
      description: "High confidence — directly from FIR registration",
    },
  },

  // ============================================================
  // arrested_with — Co-accused in same FIR
  // ============================================================
  arrested_with: {
    name: "arrested_with",
    description: "Links two Accused who were co-accused in the same FIR",
    from: ["Accused"],
    to: ["Accused"],
    properties: {
      fir_no: {
        type: "string",
        required: true,
        foreign_key: "FIR.fir_no",
      },
      arrest_date: {
        type: "date",
        required: false,
      },
    },
    confidence: {
      default: 0.95,
      source: "Arrest record",
      description: "High confidence — court/official arrest record",
    },
  },

  // ============================================================
  // linked_to — Generic link (investigator-asserted or AI-inferred)
  // ============================================================
  linked_to: {
    name: "linked_to",
    description:
      "Generic relationship between any two nodes. Used for investigator hunches and AI suggestions.",
    from: ["FIR", "Accused", "Victim", "Location", "Phone", "Vehicle"],
    to: ["FIR", "Accused", "Victim", "Location", "Phone", "Vehicle"],
    properties: {
      evidence_type: {
        type: "string",
        required: true,
        enum: [
          "phone_record",
          "location_proximity",
          "witness_statement",
          "financial_link",
          "ai_suggested",
          "investigator_asserted",
          "forensic_evidence",
        ],
      },
      weight: {
        type: "float",
        required: true,
        min: 0.0,
        max: 1.0,
        description: "Strength of the link (0 = weak, 1 = certain)",
      },
      is_hypothesis: {
        type: "boolean",
        required: true,
        default: true,
        description: "True if this is an AI inference, not a verified fact",
      },
      added_by: {
        type: "string",
        required: false,
        description: "Officer ID or 'system' for AI-generated links",
      },
    },
    confidence: {
      default: 0.5,
      source: "Variable — investigator or AI",
      description: "Variable confidence — must always be displayed with provenance",
    },
  },

  // ============================================================
  // called — Phone-to-phone call record
  // ============================================================
  called: {
    name: "called",
    description: "A phone call between two phones (CDR-derived)",
    from: ["Phone"],
    to: ["Phone"],
    properties: {
      timestamp: {
        type: "timestamp",
        required: true,
      },
      duration_seconds: {
        type: "integer",
        required: false,
      },
      frequency_count: {
        type: "integer",
        required: false,
        default: 1,
        description: "Number of calls in this relationship (aggregated)",
      },
      first_seen: {
        type: "timestamp",
        required: false,
      },
      last_seen: {
        type: "timestamp",
        required: false,
      },
    },
    confidence: {
      default: 0.9,
      source: "CDR (Call Detail Record)",
      description: "High confidence — carrier record",
    },
  },

  // ============================================================
  // visited — Accused/Phone at a Location
  // ============================================================
  visited: {
    name: "visited",
    description: "An Accused or Phone was present at a Location",
    from: ["Accused", "Phone"],
    to: ["Location"],
    properties: {
      timestamp: {
        type: "timestamp",
        required: false,
      },
      dwell_time_minutes: {
        type: "integer",
        required: false,
        description: "How long the entity was at this location",
      },
      visit_count: {
        type: "integer",
        required: false,
        default: 1,
        description: "Number of visits (aggregated)",
      },
    },
    confidence: {
      default: 0.7,
      source: "Cell tower / witness statement",
      description:
        "Variable confidence — cell tower triangulation is approximate; witness is subjective",
    },
  },

  // ============================================================
  // operates_at — Accused operates in a Location area
  // ============================================================
  operates_at: {
    name: "operates_at",
    description: "An Accused is known to operate in a Location area",
    from: ["Accused"],
    to: ["Location"],
    properties: {
      activity_type: {
        type: "string",
        required: true,
        enum: [
          "crime_scene",
          "hideout",
          "frequent_area",
          "residence",
          "workplace",
        ],
      },
      confidence: {
        type: "float",
        required: false,
        default: 0.6,
      },
      source: {
        type: "string",
        required: false,
        enum: ["intelligence_report", "pattern_detected", "witness", "ai_inferred"],
      },
    },
    confidence: {
      default: 0.6,
      source: "Intelligence report / pattern detection",
      description: "Variable confidence — intelligence-derived",
    },
  },

  // ============================================================
  // similar_MO_to — Algorithmically generated FIR similarity
  // ============================================================
  similar_MO_to: {
    name: "similar_MO_to",
    description:
      "Algorithmically generated edge: two FIRs share a similar Modus Operandi",
    from: ["FIR"],
    to: ["FIR"],
    properties: {
      similarity_score: {
        type: "float",
        required: true,
        min: 0.0,
        max: 1.0,
        description: "Cosine similarity of MO feature vectors",
      },
      shared_features: {
        type: "string[]",
        required: false,
        example: ["entry_method", "time_of_day", "weapon_type"],
        description: "Which MO features contributed to the match",
      },
      model_version: {
        type: "string",
        required: false,
        description: "Version of the MO similarity model used",
      },
    },
    confidence: {
      default: 0.7,
      source: "Algorithmic (Crime DNA Engine)",
      description:
        "Medium confidence — algorithmic match, requires investigator verification",
    },
  },

  // ============================================================
  // filed_at — FIR filed at a Police Station
  // ============================================================
  filed_at: {
    name: "filed_at",
    description: "A FIR was filed at a specific Police Station",
    from: ["FIR"],
    to: ["Police_Station"],
    properties: {},
    confidence: {
      default: 1.0,
      source: "System record",
      description: "Certain — FIR is registered at a specific station",
    },
  },

  // ============================================================
  // has_investigation — FIR has an Investigation case
  // ============================================================
  has_investigation: {
    name: "has_investigation",
    description: "Links a FIR to its Investigation case",
    from: ["FIR"],
    to: ["Investigation"],
    properties: {},
    confidence: {
      default: 1.0,
      source: "System record",
      description: "Certain — system-created link",
    },
  },
};

// ============================================================
// Schema validation helpers
// ============================================================

/**
 * Get all valid edge names.
 * @returns {string[]}
 */
function getEdgeNames() {
  return Object.keys(EDGE_SCHEMA);
}

/**
 * Get schema for a specific edge type.
 * @param {string} name - Edge name
 * @returns {object} Edge schema
 */
function getEdgeSchema(name) {
  if (!EDGE_SCHEMA[name]) {
    throw new Error(`Unknown edge name: ${name}`);
  }
  return EDGE_SCHEMA[name];
}

/**
 * Check if a node label can be used as source for a given edge.
 * @param {string} edgeName - Edge name
 * @param {string} label - Node label
 * @returns {boolean}
 */
function isValidSource(edgeName, label) {
  const edge = getEdgeSchema(edgeName);
  return edge.from.includes(label);
}

/**
 * Check if a node label can be used as target for a given edge.
 * @param {string} edgeName - Edge name
 * @param {string} label - Node label
 * @returns {boolean}
 */
function isValidTarget(edgeName, label) {
  const edge = getEdgeSchema(edgeName);
  return edge.to.includes(label);
}

/**
 * Check if an edge creation is valid (correct node types).
 * @param {string} edgeName - Edge name
 * @param {string} fromLabel - Source node label
 * @param {string} toLabel - Target node label
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateEdgeCreation(edgeName, fromLabel, toLabel) {
  const errors = [];

  if (!EDGE_SCHEMA[edgeName]) {
    errors.push(`Unknown edge type: ${edgeName}`);
    return { valid: false, errors };
  }

  if (!isValidSource(edgeName, fromLabel)) {
    errors.push(
      `Node type '${fromLabel}' cannot be source of edge '${edgeName}'. Valid sources: ${getEdgeSchema(edgeName).from.join(", ")}`
    );
  }

  if (!isValidTarget(edgeName, toLabel)) {
    errors.push(
      `Node type '${toLabel}' cannot be target of edge '${edgeName}'. Valid targets: ${getEdgeSchema(edgeName).to.join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get confidence defaults for an edge type.
 * @param {string} edgeName - Edge name
 * @returns {object} { default, source, description }
 */
function getConfidenceInfo(edgeName) {
  const edge = getEdgeSchema(edgeName);
  return edge.confidence;
}

/**
 * Get all edges where a given node label can participate (as source or target).
 * @param {string} label - Node label
 * @returns {string[]} Edge names
 */
function getEdgesForNode(label) {
  return Object.entries(EDGE_SCHEMA)
    .filter(
      ([, edge]) => edge.from.includes(label) || edge.to.includes(label)
    )
    .map(([name]) => name);
}

module.exports = {
  EDGE_SCHEMA,
  getEdgeNames,
  getEdgeSchema,
  isValidSource,
  isValidTarget,
  validateEdgeCreation,
  getConfidenceInfo,
  getEdgesForNode,
};
