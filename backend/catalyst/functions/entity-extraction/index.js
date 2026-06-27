const catalyst = require("@zmc/catalyst");
const FalkorClient = require("../../../graph/client");
const { extractMOFeatures } = require("../../../engines/crime-dna");
const { extractSlots } = require("../../../nlu/slots");

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();
    const firData = event.data;

    if (!firData || !firData.narrative_text) {
      return { status: 400, content: { error: "Missing fir_data or narrative_text" } };
    }

    const moFeatures = extractMOFeatures(firData);
    const slots = extractSlots(firData.narrative_text);

    const entities = {
      accused: slots.accused_name ? [{ name: slots.accused_name, role: "accused" }] : [],
      victims: slots.victim_name ? [{ name: slots.victim_name }] : [],
      locations: slots.location ? [{ name: slots.location }] : [],
      crime_type: moFeatures.crime_type || slots.crime_type || "",
      mo_features: moFeatures
    };

    const auditTable = datastore.table("AuditLog");
    await auditTable.insertRow({
      log_id: `ext-${firData.fir_no}-${Date.now()}`,
      timestamp: new Date(),
      officer_id: firData.investigating_officer_id || "system",
      query_text: `Entity extraction for FIR ${firData.fir_no}`,
      intent: "entity_extraction",
      engine_used: "entity-extraction",
      results_count: entities.accused.length + entities.victims.length,
      jurisdiction: firData.district || ""
    });

    return {
      status: 200,
      content: {
        fir_no: firData.fir_no,
        entities,
        extracted_at: new Date().toISOString()
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
