/**
 * Catalyst Data Store Schema
 * 
 * Defines collections and indexes for Catalyst Data Store.
 * This is the relational/document layer beneath the graph abstraction.
 * 
 * Task 1.9
 */

const CATALYST_COLLECTIONS = {
  FIR: {
    name: "FIR",
    description: "First Information Reports",
    fields: {
      fir_no: { type: "string", required: true, unique: true },
      police_station_id: { type: "string", required: true },
      date_filed: { type: "date", required: true },
      crime_type: { type: "string", required: true },
      sections_of_law: { type: "json", required: true },
      status: { type: "string", required: true },
      narrative_text: { type: "text", required: true },
      lat: { type: "float" },
      long: { type: "float" },
      investigating_officer_id: { type: "string" },
      district: { type: "string" },
      taluk: { type: "string" },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["fir_no", "crime_type", "date_filed", "status", "district"],
  },

  Accused: {
    name: "Accused",
    description: "Accused / suspect records",
    fields: {
      accused_id: { type: "string", required: true, unique: true },
      name: { type: "string", required: true },
      aliases: { type: "json" },
      age: { type: "integer" },
      gender: { type: "string" },
      address: { type: "string" },
      district: { type: "string" },
      prior_conviction_count: { type: "integer", default: 0 },
      fingerprint_ref: { type: "string" },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["accused_id", "name", "district"],
  },

  Victim: {
    name: "Victim",
    description: "Victim records",
    fields: {
      victim_id: { type: "string", required: true, unique: true },
      name: { type: "string", required: true },
      age: { type: "integer" },
      gender: { type: "string" },
      address: { type: "string" },
      district: { type: "string" },
      vulnerability_flag: { type: "boolean", default: false },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["victim_id", "name", "district"],
  },

  Location: {
    name: "Location",
    description: "Geographic locations",
    fields: {
      location_id: { type: "string", required: true, unique: true },
      lat: { type: "float", required: true },
      long: { type: "float", required: true },
      type: { type: "string", required: true },
      name: { type: "string" },
      taluk: { type: "string" },
      district: { type: "string", required: true },
      state: { type: "string", default: "Karnataka" },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["location_id", "district", "type"],
  },

  Phone: {
    name: "Phone",
    description: "Phone records",
    fields: {
      phone_id: { type: "string", required: true, unique: true },
      imei: { type: "string" },
      msisdn: { type: "string" },
      registration_name: { type: "string" },
      owner_confidence: { type: "float" },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["phone_id", "imei", "msisdn"],
  },

  Investigation: {
    name: "Investigation",
    description: "Investigation case records",
    fields: {
      case_id: { type: "string", required: true, unique: true },
      fir_no: { type: "string", required: true },
      stage: { type: "string", required: true },
      status: { type: "string", required: true },
      lead_officer_id: { type: "string" },
      opened_date: { type: "date", required: true },
      closed_date: { type: "date" },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["case_id", "fir_no", "status"],
  },

  Officer: {
    name: "Officer",
    description: "Police officer records",
    fields: {
      officer_id: { type: "string", required: true, unique: true },
      name: { type: "string", required: true },
      rank: { type: "string" },
      ps_id: { type: "string" },
      role: { type: "string", required: true },
      district: { type: "string" },
      created_at: { type: "timestamp", required: true },
    },
    indexes: ["officer_id", "ps_id", "role"],
  },

  AuditLog: {
    name: "AuditLog",
    description: "Immutable audit log of all queries and actions",
    fields: {
      log_id: { type: "string", required: true, unique: true },
      timestamp: { type: "timestamp", required: true },
      officer_id: { type: "string", required: true },
      query_text: { type: "text" },
      intent: { type: "string" },
      engine_used: { type: "string" },
      results_count: { type: "integer" },
      response_time_ms: { type: "integer" },
      jurisdiction: { type: "string" },
    },
    indexes: ["log_id", "officer_id", "timestamp", "intent"],
  },

  Alert: {
    name: "Alert",
    description: "Early warning alerts",
    fields: {
      alert_id: { type: "string", required: true, unique: true },
      alert_type: { type: "string", required: true },
      severity: { type: "string", required: true },
      affected_area: { type: "string" },
      description: { type: "text" },
      linked_firs: { type: "json" },
      recommended_action: { type: "text" },
      status: { type: "string", default: "new" },
      created_at: { type: "timestamp", required: true },
      acknowledged_at: { type: "timestamp" },
      acknowledged_by: { type: "string" },
    },
    indexes: ["alert_id", "severity", "status", "created_at"],
  },

  Conversation: {
    name: "Conversation",
    description: "Chat conversation history",
    fields: {
      conversation_id: { type: "string", required: true, unique: true },
      officer_id: { type: "string", required: true },
      messages: { type: "json", required: true },
      created_at: { type: "timestamp", required: true },
      updated_at: { type: "timestamp" },
      exported_pdf_url: { type: "string" },
    },
    indexes: ["conversation_id", "officer_id"],
  },
};

function getCollections() {
  return Object.values(CATALYST_COLLECTIONS);
}

function getCollection(name) {
  if (!CATALYST_COLLECTIONS[name]) {
    throw new Error(`Unknown collection: ${name}`);
  }
  return CATALYST_COLLECTIONS[name];
}

function generateCreateTableSQL(name) {
  const col = getCollection(name);
  const fields = Object.entries(col.fields)
    .map(([field, config]) => {
      let sql = `  ${field}`;
      if (config.type === "string") sql += " VARCHAR(255)";
      else if (config.type === "text") sql += " TEXT";
      else if (config.type === "integer") sql += " INTEGER";
      else if (config.type === "float") sql += " FLOAT";
      else if (config.type === "boolean") sql += " BOOLEAN";
      else if (config.type === "date") sql += " DATE";
      else if (config.type === "timestamp") sql += " TIMESTAMP";
      else if (config.type === "json") sql += " JSON";
      if (config.required) sql += " NOT NULL";
      if (config.unique) sql += " UNIQUE";
      if (config.default !== undefined) sql += ` DEFAULT ${JSON.stringify(config.default)}`;
      return sql;
    })
    .join(",\n");

  return `CREATE TABLE IF NOT EXISTS ${name} (\n${fields}\n);`;
}

module.exports = {
  CATALYST_COLLECTIONS,
  getCollections,
  getCollection,
  generateCreateTableSQL,
};

if (require.main === module) {
  console.log("=== Catalyst Data Store Schema ===\n");
  for (const name of Object.keys(CATALYST_COLLECTIONS)) {
    console.log(`--- ${name} ---`);
    console.log(generateCreateTableSQL(name));
    console.log();
  }
}
