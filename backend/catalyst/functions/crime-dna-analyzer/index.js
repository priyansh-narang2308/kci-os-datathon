const catalyst = require("@zmc/catalyst");
const FalkorClient = require("../../../graph/client");
const { CrimeDNAEngine } = require("../../../engines/crime-dna");

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();
    const firData = event.data;

    if (!firData || !firData.fir_no) {
      return { status: 400, content: { error: "Missing fir_no in event data" } };
    }

    const firTable = datastore.table("FIR");
    const allRows = await firTable.getAllRows();
    const historicalFirs = allRows.map(r => r.FIR).filter(f => f && f.fir_no !== firData.fir_no);

    const engine = new CrimeDNAEngine();
    await engine.initialize(historicalFirs);

    const analysis = await engine.analyzeNewFIR(firData);

    const analysisTable = datastore.table("Investigation");
    await analysisTable.insertRow({
      case_id: `dna-${firData.fir_no}-${Date.now()}`,
      fir_no: firData.fir_no,
      stage: "crime_dna_analysis",
      status: "completed",
      lead_officer_id: firData.investigating_officer_id || "system",
      opened_date: new Date(),
      created_at: new Date()
    });

    return {
      status: 200,
      content: {
        fir_no: analysis.fir_no,
        mo_features: analysis.features,
        matches: analysis.matches,
        match_count: analysis.match_count,
        pattern_detected: analysis.pattern?.pattern_detected || false,
        pattern_details: analysis.pattern,
        report: analysis.report,
        generated_at: analysis.generated_at
      }
    };
  } catch (err) {
    return {
      status: 500,
      content: {
        fir_no: event.data?.fir_no || "unknown",
        error: err.message
      }
    };
  }
};
