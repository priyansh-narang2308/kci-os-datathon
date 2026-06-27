const catalyst = require("@zmc/catalyst");
const { ForecastingEngine } = require("../../../engines/forecasting");

exports.handler = async function(event) {
  try {
    const catalystApp = catalyst.initialize(event);
    const datastore = catalystApp.datastore();

    const firTable = datastore.table("FIR");
    const allRows = await firTable.getAllRows();
    const firs = allRows.map(r => r.FIR).filter(Boolean);

    if (firs.length === 0) {
      return { status: 200, content: { message: "No FIR data available for forecasting", forecast_updated: false } };
    }

    const engine = new ForecastingEngine();
    await engine.initialize(firs);

    const hotspots = engine.getHotspots(undefined, 10);
    const heatmap = engine.getHeatmapData();
    const backtest = engine.getBacktest(90);
    const alerts = await engine.evaluateEarlyWarnings();

    const alertTable = datastore.table("Alert");
    for (const alert of alerts) {
      await alertTable.insertRow({
        alert_id: alert.alert_id,
        alert_type: alert.type,
        severity: alert.severity,
        affected_area: alert.data?.district || "",
        description: alert.description,
        linked_firs: JSON.stringify(alert.data?.firs || []),
        recommended_action: alert.data?.action || "",
        status: "new",
        created_at: new Date()
      });
    }

    const crimeTypes = [...new Set(firs.map(f => f.crime_type).filter(Boolean))];
    const districts = [...new Set(firs.map(f => f.district).filter(Boolean))];
    const forecasts = [];
    for (const crimeType of crimeTypes.slice(0, 5)) {
      for (const district of districts.slice(0, 3)) {
        const forecast = engine.getForecast(crimeType, district, 30);
        if (forecast) forecasts.push(forecast);
      }
    }

    return {
      status: 200,
      content: {
        forecast_updated: true,
        hotspots_identified: hotspots.length,
        forecasts_generated: forecasts.length,
        alerts_generated: alerts.length,
        backtest_results: {
          precision: backtest.precision_at_10,
          recall: backtest.recall_at_10,
          f1_score: backtest.f1_score
        },
        top_hotspots: hotspots.slice(0, 5),
        alert_summary: alerts.map(a => ({
          alert_id: a.alert_id,
          type: a.type,
          severity: a.severity,
          title: a.title
        })),
        computed_at: new Date().toISOString()
      }
    };
  } catch (err) {
    return { status: 500, content: { error: err.message } };
  }
};
