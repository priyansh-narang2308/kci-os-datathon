const NODE_SCHEMA = {
  // ============================================================
  // FIR — First Information Report
  // ============================================================
  FIR: {
    label: "FIR",
    description: "A registered First Information Report",
    properties: {
      fir_no: {
        type: "string",
        required: true,
        unique: true,
        example: "2024/MSR/1234",
        description: "Unique FIR number across Karnataka",
      },
      police_station_id: {
        type: "string",
        required: true,
        foreign_key: "Police_Station.ps_id",
        example: "PS_MSR_042",
      },
      date_filed: {
        type: "date",
        required: true,
        example: "2024-03-15",
      },
      crime_type: {
        type: "string",
        required: true,
        enum: [
          "theft",
          "chain_snatching",
          "burglary",
          "robbery",
          "cyber_fraud",
          "drug_offense",
          "assault",
          "murder",
          "cheating",
          "criminal_intimidation",
        ],
        example: "theft",
      },
      sections_of_law: {
        type: "string[]",
        required: true,
        example: ["IPC_379", "IPC_34"],
        description: "IPC or BNS section codes",
      },
      status: {
        type: "string",
        required: true,
        enum: [
          "registered",
          "under_investigation",
          "chargesheeted",
          "convicted",
          "closed_unidentified",
          "closed_after_trial",
        ],
        example: "under_investigation",
      },
      narrative_text: {
        type: "string",
        required: true,
        example:
          "On 15th March 2024, at approximately 2:30 AM, accused broke into the jewelry shop...",
        description: "Free-text description of the crime",
      },
      lat: {
        type: "float",
        required: false,
        example: 12.2958,
        description: "Latitude of crime scene",
      },
      long: {
        type: "float",
        required: false,
        example: 76.6394,
        description: "Longitude of crime scene",
      },
      investigating_officer_id: {
        type: "string",
        required: false,
        example: "OFF_001",
      },
      case_master_id: {
        type: "integer",
        required: false,
        description: "CCTNS CaseMasterID PK",
      },
      crime_no: {
        type: "string",
        required: false,
        description: "CCTNS CrimeNo (18 digits)",
      },
      case_no: {
        type: "string",
        required: false,
        description: "CCTNS CaseNo (YYYY + 5 digits)",
      },
      crime_registered_date: { type: "date", required: false },
      incident_from_date: { type: "timestamp", required: false },
      incident_to_date: { type: "timestamp", required: false },
      info_received_ps_date: { type: "timestamp", required: false },
      brief_facts: {
        type: "string",
        required: false,
        description: "CCTNS BriefFacts summary",
      },
      case_category_id: {
        type: "integer",
        required: false,
        foreign_key: "CaseCategory.CaseCategoryID",
      },
      gravity_offence_id: {
        type: "integer",
        required: false,
        foreign_key: "GravityOffence.GravityOffenceID",
      },
      crime_major_head_id: {
        type: "integer",
        required: false,
        foreign_key: "CrimeHead.CrimeHeadID",
      },
      crime_minor_head_id: {
        type: "integer",
        required: false,
        foreign_key: "CrimeSubHead.CrimeSubHeadID",
      },
      case_status_id: {
        type: "integer",
        required: false,
        foreign_key: "CaseStatusMaster.CaseStatusID",
      },
      court_id: {
        type: "integer",
        required: false,
        foreign_key: "Court.CourtID",
      },
      complainant_details: {
        type: "json",
        required: false,
        description: "ComplainantDetails ER table mapping",
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: [
      "fir_no",
      "crime_type",
      "date_filed",
      "status",
      "case_master_id",
      "crime_no",
    ],
  },

  // ============================================================
  // Accused — Suspect / Accused person
  // ============================================================
  Accused: {
    label: "Accused",
    description: "A suspect or accused person in one or more FIRs",
    properties: {
      accused_id: {
        type: "string",
        required: true,
        unique: true,
        example: "ACC_001",
      },
      name: {
        type: "string",
        required: true,
        example: "Ravi Kumar",
      },
      aliases: {
        type: "string[]",
        required: false,
        example: ["Ravi K", "R. Kumar"],
        description: "Known aliases or name variants",
      },
      age: {
        type: "integer",
        required: false,
        example: 28,
      },
      gender: {
        type: "string",
        required: false,
        enum: ["male", "female", "other"],
      },
      address: {
        type: "string",
        required: false,
        example: "123 Main St, Mysuru",
      },
      district: {
        type: "string",
        required: false,
        example: "Mysuru",
      },
      prior_conviction_count: {
        type: "integer",
        required: false,
        default: 0,
        example: 2,
      },
      fingerprint_ref: {
        type: "string",
        required: false,
        description: "Reference to fingerprint database",
      },
      accused_master_id: {
        type: "integer",
        required: false,
        description: "CCTNS AccusedMasterID PK",
      },
      case_master_id: {
        type: "integer",
        required: false,
        foreign_key: "CaseMaster.CaseMasterID",
      },
      person_id: {
        type: "string",
        required: false,
        description: "Accused sorting like A1, A2, A3",
      },
      is_accused: { type: "boolean", required: false, default: true },
      is_complainant_accused: {
        type: "boolean",
        required: false,
        default: false,
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["accused_id", "name", "district", "accused_master_id"],
  },

  // ============================================================
  // Victim — Crime victim
  // ============================================================
  Victim: {
    label: "Victim",
    description: "A victim of a crime",
    properties: {
      victim_id: {
        type: "string",
        required: true,
        unique: true,
        example: "VIC_001",
      },
      name: {
        type: "string",
        required: true,
        example: "Lakshmi Devi",
      },
      age: {
        type: "integer",
        required: false,
        example: 65,
      },
      gender: {
        type: "string",
        required: false,
        enum: ["male", "female", "other"],
      },
      address: {
        type: "string",
        required: false,
      },
      district: {
        type: "string",
        required: false,
      },
      vulnerability_flag: {
        type: "boolean",
        required: false,
        default: false,
        description:
          "True if victim is elderly, minor, or otherwise vulnerable",
      },
      victim_master_id: {
        type: "integer",
        required: false,
        description: "CCTNS VictimMasterID PK",
      },
      case_master_id: {
        type: "integer",
        required: false,
        foreign_key: "CaseMaster.CaseMasterID",
      },
      victim_police: {
        type: "string",
        required: false,
        description: "If Victim is police then 1 else 0",
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["victim_id", "name", "district", "victim_master_id"],
  },

  // ============================================================
  // Location — Geographic location
  // ============================================================
  Location: {
    label: "Location",
    description: "A geographic location (crime scene, residence, hotspot)",
    properties: {
      location_id: {
        type: "string",
        required: true,
        unique: true,
        example: "LOC_001",
      },
      lat: {
        type: "float",
        required: true,
        example: 12.2958,
      },
      long: {
        type: "float",
        required: true,
        example: 76.6394,
      },
      type: {
        type: "string",
        required: true,
        enum: [
          "crime_scene",
          "residence",
          "hideout",
          "hotspot_cell",
          "police_station",
          "commercial",
        ],
      },
      name: {
        type: "string",
        required: false,
        example: "Mysuru Central Market",
      },
      taluk: {
        type: "string",
        required: false,
        example: "Mysuru Taluk",
      },
      district: {
        type: "string",
        required: true,
        example: "Mysuru",
      },
      state: {
        type: "string",
        required: true,
        default: "Karnataka",
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["location_id", "district", "type"],
  },

  // ============================================================
  // Phone — Mobile phone / IMEI record
  // ============================================================
  Phone: {
    label: "Phone",
    description: "A mobile phone identified by IMEI or MSISDN",
    properties: {
      phone_id: {
        type: "string",
        required: true,
        unique: true,
        example: "PHONE_001",
      },
      imei: {
        type: "string",
        required: false,
        example: "890123456789012",
      },
      msisdn: {
        type: "string",
        required: false,
        example: "+919876543210",
        description: "Phone number",
      },
      registration_name: {
        type: "string",
        required: false,
        example: "Ravi Kumar",
      },
      owner_confidence: {
        type: "float",
        required: false,
        example: 0.85,
        description: "Confidence that registration_name is the actual owner",
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["phone_id", "imei", "msisdn"],
  },

  // ============================================================
  // Vehicle — Vehicle registration
  // ============================================================
  Vehicle: {
    label: "Vehicle",
    description: "A vehicle involved in or linked to a crime",
    properties: {
      vehicle_id: {
        type: "string",
        required: true,
        unique: true,
        example: "VEH_001",
      },
      reg_no: {
        type: "string",
        required: true,
        example: "KA-09-AB-1234",
      },
      type: {
        type: "string",
        required: false,
        enum: [
          "car",
          "motorcycle",
          "truck",
          "auto_rickshaw",
          "bicycle",
          "other",
        ],
      },
      color: {
        type: "string",
        required: false,
      },
      owner_name: {
        type: "string",
        required: false,
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["vehicle_id", "reg_no"],
  },

  // ============================================================
  // Police_Station — Police station jurisdiction
  // ============================================================
  Police_Station: {
    label: "Police_Station",
    description: "A police station with its jurisdiction",
    properties: {
      ps_id: {
        type: "string",
        required: true,
        unique: true,
        example: "PS_MSR_042",
      },
      name: {
        type: "string",
        required: true,
        example: "Mysuru City Police Station",
      },
      district: {
        type: "string",
        required: true,
        example: "Mysuru",
      },
      taluk: {
        type: "string",
        required: false,
        example: "Mysuru Taluk",
      },
      lat: {
        type: "float",
        required: false,
      },
      long: {
        type: "float",
        required: false,
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["ps_id", "district"],
  },

  // ============================================================
  // Investigation — Case investigation record
  // ============================================================
  Investigation: {
    label: "Investigation",
    description: "An investigation case linked to an FIR",
    properties: {
      case_id: {
        type: "string",
        required: true,
        unique: true,
        example: "INV_2024_001",
      },
      fir_no: {
        type: "string",
        required: true,
        foreign_key: "FIR.fir_no",
        example: "2024/MSR/1234",
      },
      stage: {
        type: "string",
        required: true,
        enum: [
          "initial",
          "evidence_collection",
          "witness_interview",
          "charge_sheet",
          "trial",
          "closed",
        ],
      },
      status: {
        type: "string",
        required: true,
        enum: ["active", "pending_review", "completed", "transferred"],
      },
      lead_officer_id: {
        type: "string",
        required: false,
        example: "OFF_001",
      },
      opened_date: {
        type: "date",
        required: true,
      },
      closed_date: {
        type: "date",
        required: false,
      },
      created_at: {
        type: "timestamp",
        required: true,
        auto: true,
      },
    },
    indexes: ["case_id", "fir_no", "status"],
  },
};

// ============================================================
// Schema validation helpers
// ============================================================

/**
 * Get all valid node labels.
 * @returns {string[]}
 */
function getNodeLabels() {
  return Object.keys(NODE_SCHEMA);
}

/**
 * Get schema for a specific node type.
 * @param {string} label - Node label
 * @returns {object} Node schema
 */
function getNodeSchema(label) {
  if (!NODE_SCHEMA[label]) {
    throw new Error(`Unknown node label: ${label}`);
  }
  return NODE_SCHEMA[label];
}

/**
 * Get all required properties for a node type.
 * @param {string} label - Node label
 * @returns {string[]} Required property names
 */
function getRequiredProperties(label) {
  const schema = getNodeSchema(label);
  return Object.entries(schema.properties)
    .filter(([, config]) => config.required)
    .map(([name]) => name);
}

/**
 * Validate a node's properties against the schema.
 * @param {string} label - Node label
 * @param {object} properties - Node properties to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateNode(label, properties) {
  const schema = getNodeSchema(label);
  const errors = [];

  // Check required properties
  for (const [name, config] of Object.entries(schema.properties)) {
    if (config.required && !(name in properties)) {
      errors.push(`Missing required property: ${name}`);
    }
  }

  // Check for unknown properties
  for (const name of Object.keys(properties)) {
    if (!(name in schema.properties)) {
      errors.push(`Unknown property: ${name}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  NODE_SCHEMA,
  getNodeLabels,
  getNodeSchema,
  getRequiredProperties,
  validateNode,
};
