const catalyst = require("@zmc/catalyst");
const { InvestigationSupportEngine } = require("../../../engines/investigation-support");

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();
    const { fir_no, crime_type, district, limit } = event.data;

    const firTable = datastore.table("FIR");
    const allRows = await firTable.getAllRows();
    const firs = allRows.map(r => r.FIR).filter(Boolean);

    const engine = new InvestigationSupportEngine();
    await engine.initialize(firs);

    let currentCase;
    if (fir_no) {
      currentCase = firs.find(f => f.fir_no === fir_no);
      if (!currentCase) {
        return { status: 404, content: { error: `FIR ${fir_no} not found` } };
      }
    } else {
      currentCase = {
        fir_no: "query",
        narrative_text: "",
        crime_type: crime_type || "unknown",
        district: district || "unknown"
      };
    }

    const result = await engine.findSimilar(currentCase, { topK: limit || 5 });

    return {
      status: 200,
      content: {
        current_case: {
          fir_no: result.current_case?.fir_no || currentCase.fir_no,
          crime_type: currentCase.crime_type,
          district: currentCase.district
        },
        similar_cases: result.similar_cases,
        count: result.count,
        solved_rate: result.solved_rate,
        recommended_techniques: result.recommended_techniques,
        report: result.report
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
