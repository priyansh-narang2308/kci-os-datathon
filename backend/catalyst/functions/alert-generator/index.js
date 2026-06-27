const catalyst = require("@zmc/catalyst");
const FalkorClient = require("../../../graph/client");
const { ForecastingEngine } = require("../../../engines/forecasting");

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();
    const { fir_data, dna_analysis } = event.data;

    const firTable = datastore.table("FIR");
    const allRows = await firTable.getAllRows();
    const firs = allRows.map(r => r.FIR).filter(Boolean);

    const client = new FalkorClient({
      host: process.env.FALKORDB_HOST || "localhost",
      port: parseInt(process.env.FALKORDB_PORT || "6380"),
      graph_name: "kci"
    });
    await client.connect();

    const engine = new ForecastingEngine();
    await engine.initialize(firs);

    const alerts = await engine.evaluateEarlyWarnings();

    const alertTable = datastore.table("Alert");
    for (const alert of alerts) {
      await alertTable.insertRow({
        alert_id: alert.alert_id,
        alert_type: alert.type,
        severity: alert.severity,
        affected_area: alert.data?.district || "",
        description: alert.description,
        linked_firs: alert.data?.firs ? JSON.stringify(alert.data.firs) : "[]",
        recommended_action: alert.data?.action || "",
        status: "new",
        created_at: new Date()
      });
    }

    await client.disconnect();

    return {
      status: 200,
      content: {
        alerts_generated: alerts.length,
        alerts: alerts.map(a => ({
          alert_id: a.alert_id,
          type: a.type,
          severity: a.severity,
          title: a.title,
          description: a.description
        }))
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
