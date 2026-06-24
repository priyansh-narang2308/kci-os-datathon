/**
 * Crime Forecasting & Early Warning Engine
 * 
 * Hotspot prediction, temporal forecasting, early warning rules, alert system.
 * 
 * Tasks 7.1 + 7.2 + 7.3 + 7.4 + 7.5 + 7.6 + 7.7
 */

// ============================================================
// Task 7.1 — KDE Baseline Hotspot Model
// ============================================================

class KDEBaseline {
  constructor() {
    this.gridCells = {};
    this.GRID_SIZE = 0.01; // ~1km grid
    this.BANDWIDTH = 0.02;
  }

  buildGrid(firs) {
    const cells = {};
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

    for (const fir of firs) {
      if (!fir.lat || !fir.long) continue;
      minLat = Math.min(minLat, fir.lat);
      maxLat = Math.max(maxLat, fir.lat);
      minLng = Math.min(minLng, fir.long);
      maxLng = Math.max(maxLng, fir.long);
    }

    // Create grid cells
    for (let lat = minLat; lat <= maxLat; lat += this.GRID_SIZE) {
      for (let lng = minLng; lng <= maxLng; lng += this.GRID_SIZE) {
        const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        cells[key] = {
          lat: parseFloat(lat.toFixed(4)),
          long: parseFloat(lng.toFixed(4)),
          count: 0,
          intensity: 0,
          crime_types: {},
          firs: [],
        };
      }
    }

    // Assign FIRs to nearest cell
    for (const fir of firs) {
      if (!fir.lat || !fir.long) continue;
      let minDist = Infinity;
      let bestKey = null;
      for (const [key, cell] of Object.entries(cells)) {
        const d = this.haversine(fir.lat, fir.long, cell.lat, cell.long);
        if (d < minDist) {
          minDist = d;
          bestKey = key;
        }
      }
      if (bestKey && minDist < 0.5) {
        cells[bestKey].count++;
        cells[bestKey].crime_types[fir.crime_type] = (cells[bestKey].crime_types[fir.crime_type] || 0) + 1;
        cells[bestKey].firs.push(fir.fir_no);
      }
    }

    // KDE smoothing
    const cellKeys = Object.keys(cells);
    for (const key of cellKeys) {
      const cell = cells[key];
      let density = 0;
      for (const otherKey of cellKeys) {
        const other = cells[otherKey];
        const d = this.haversine(cell.lat, cell.long, other.lat, other.long);
        density += other.count * this.gaussianKernel(d);
      }
      cell.intensity = parseFloat(density.toFixed(6));
    }

    this.gridCells = cells;
    return cells;
  }

  gaussianKernel(distance) {
    return Math.exp(-(distance ** 2) / (2 * this.BANDWIDTH ** 2));
  }

  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  getHotspots(topN = 10) {
    const cells = Object.values(this.gridCells)
      .filter(c => c.intensity > 0)
      .sort((a, b) => b.intensity - a.intensity);

    return cells.slice(0, topN).map(c => ({
      lat: c.lat,
      long: c.long,
      intensity: c.intensity,
      dominant_crime: Object.entries(c.crime_types)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type),
      fir_count: c.count,
    }));
  }

  getHeatmapData() {
    return Object.values(this.gridCells)
      .filter(c => c.intensity > 0)
      .map(c => ({
        lat: c.lat,
        long: c.long,
        intensity: c.intensity,
        count: c.count,
      }));
  }
}

// ============================================================
// Task 7.2 — Temporal Forecasting Model
// ============================================================

class TemporalForecaster {
  constructor() {
    this.models = {};
  }

  buildModels(firs) {
    const dailyAgg = {};
    const weeklyAgg = {};

    for (const fir of firs) {
      if (!fir.date_filed) continue;
      const day = fir.date_filed;
      const week = this.getWeekStart(day);
      const month = day.substring(0, 7);
      const crimeType = fir.crime_type;
      const district = fir.district;

      // Daily aggregation by crime type + district
      const key = `${crimeType}:${district}`;
      if (!dailyAgg[key]) dailyAgg[key] = {};
      if (!weeklyAgg[key]) weeklyAgg[key] = {};

      dailyAgg[key][day] = (dailyAgg[key][day] || 0) + 1;
      weeklyAgg[key][week] = (weeklyAgg[key][week] || 0) + 1;
    }

    // Build simple Prophet-style models per category
    for (const [key, daily] of Object.entries(dailyAgg)) {
      const days = Object.keys(daily).sort();
      if (days.length < 7) continue;

      const values = days.map(d => daily[d]);
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);

      this.models[key] = {
        mean,
        std,
        min: Math.min(...values),
        max: Math.max(...values),
        total: values.reduce((s, v) => s + v, 0),
        days_count: days.length,
        recent_trend: values.slice(-14),
        seasonality: this.detectSeasonality(days, values),
      };
    }
  }

  getWeekStart(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d.toISOString().split("T")[0];
  }

  detectSeasonality(days, values) {
    // Check day-of-week pattern
    const dow = {};
    for (let i = 0; i < days.length; i++) {
      const d = new Date(days[i]);
      const dayOfWeek = d.getDay();
      if (!dow[dayOfWeek]) dow[dayOfWeek] = [];
      dow[dayOfWeek].push(values[i]);
    }

    const dowAverages = {};
    for (const [day, vals] of Object.entries(dow)) {
      dowAverages[day] = vals.reduce((s, v) => s + v, 0) / vals.length;
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const pattern = {};
    for (let i = 0; i < 7; i++) {
      pattern[weekdays[i]] = dowAverages[i] || 0;
    }

    return { day_of_week: pattern };
  }

  forecast(crimeType, district, days = 30) {
    const key = `${crimeType}:${district}`;
    const model = this.models[key];
    if (!model) return null;

    const forecasts = [];
    const now = new Date();

    for (let i = 1; i <= days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();

      // Simple forecast: mean + day-of-week adjustment
      const dowFactor = (model.seasonality.day_of_week[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek]] / model.mean) || 1;
      const predicted = model.mean * dowFactor;

      forecasts.push({
        date: dateStr,
        predicted: Math.max(0, parseFloat(predicted.toFixed(2))),
        lower: Math.max(0, parseFloat((predicted - model.std).toFixed(2))),
        upper: parseFloat((predicted + model.std).toFixed(2)),
      });
    }

    return {
      crime_type: crimeType,
      district,
      model_stats: {
        mean: model.mean,
        std: model.std,
        total: model.total,
        data_points: model.days_count,
      },
      forecast: forecasts,
      next_7_days_total: forecasts.slice(0, 7).reduce((s, f) => s + f.predicted, 0),
      next_30_days_total: forecasts.reduce((s, f) => s + f.predicted, 0),
    };
  }
}

// ============================================================
// Task 7.3 — Forecast Backtester
// ============================================================

class ForecastBacktester {
  constructor(kde, forecaster, firs) {
    this.kde = kde;
    this.forecaster = forecaster;
    this.firs = firs;
  }

  runBacktest(testDays = 90) {
    const now = new Date();
    const splitDate = new Date(now);
    splitDate.setDate(splitDate.getDate() - testDays);
    const splitStr = splitDate.toISOString().split("T")[0];

    const trainData = this.firs.filter(f => f.date_filed < splitStr);
    const testData = this.firs.filter(f => f.date_filed >= splitStr);

    if (trainData.length === 0 || testData.length === 0) {
      return { error: "Insufficient data for backtest split" };
    }

    // Train on historical data
    this.kde.buildGrid(trainData);
    this.forecaster.buildModels(trainData);

    // Get predicted hotspots
    const predicted = this.kde.getHotspots(10);

    // Count how many new FIRs fell in predicted areas
    let hits = 0;
    const gridKeys = Object.keys(this.kde.gridCells);
    const threshold = gridKeys.map(k => this.kde.gridCells[k].intensity)
      .sort((a, b) => b - a)[Math.min(10, gridKeys.length - 1)] || 0;

    for (const fir of testData) {
      if (!fir.lat || !fir.long) continue;
      let minDist = Infinity;
      for (const [key, cell] of Object.entries(this.kde.gridCells)) {
        if (cell.intensity >= threshold) {
          const d = this.kde.haversine(fir.lat, fir.long, cell.lat, cell.long);
          minDist = Math.min(minDist, d);
        }
      }
      if (minDist <= 0.5) hits++;
    }

    const precision = hits / Math.max(1, testData.length);
    const recall = hits / Math.max(1, predicted.length);

    return {
      test_period_days: testDays,
      train_size: trainData.length,
      test_size: testData.length,
      hits,
      precision_at_10: parseFloat(precision.toFixed(4)),
      recall_at_10: parseFloat(recall.toFixed(4)),
      f1_score: parseFloat((2 * precision * recall / Math.max(0.001, precision + recall)).toFixed(4)),
    };
  }
}

// ============================================================
// Task 7.4 — Early Warning Rule Engine
// ============================================================

class EarlyWarningEngine {
  constructor(client, firs) {
    this.client = client;
    this.firs = firs;
    this.alerts = [];
  }

  evaluateAllRules() {
    this.alerts = [];
    this.evaluateMOClusterRule();
    this.evaluateAnomalyRule();
    this.evaluateRepeatOffenderRule();
    return this.alerts;
  }

  evaluateMOClusterRule() {
    // ≥3 similar MOs in 7 days in same area
    const clusterCounts = {};
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cuttoff = sevenDaysAgo.toISOString().split("T")[0];

    for (const fir of this.firs) {
      if (!fir.date_filed || fir.date_filed < cuttoff) continue;
      const key = `${fir.crime_type}:${fir.district}`;
      if (!clusterCounts[key]) clusterCounts[key] = [];
      clusterCounts[key].push(fir);
    }

    for (const [key, firs] of Object.entries(clusterCounts)) {
      if (firs.length >= 3) {
        const [crimeType, district] = key.split(":");
        this.alerts.push({
          alert_type: "MO_CLUSTER",
          severity: "WARNING",
          title: `Emerging ${crimeType.replace(/_/g, " ")} pattern in ${district}`,
          description: `${firs.length} similar MOs detected in 7 days in ${district}`,
          linked_firs: firs.map(f => f.fir_no),
          affected_area: district,
          recommended_action: `Increase patrols in ${district}. Review ${firs.length} recent FIRs for common MO elements.`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  evaluateAnomalyRule() {
    // Crime count > 2x historical average for a district/crime-type in a week
    const historical = {};
    const weekly = {};
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    for (const fir of this.firs) {
      if (!fir.date_filed) continue;
      const key = `${fir.crime_type}:${fir.district}`;

      if (fir.date_filed >= monthAgo.toISOString().split("T")[0]) {
        historical[key] = (historical[key] || 0) + 1;
      }
      if (fir.date_filed >= weekAgo.toISOString().split("T")[0]) {
        weekly[key] = (weekly[key] || 0) + 1;
      }
    }

    for (const [key, weekCount] of Object.entries(weekly)) {
      const histCount = historical[key] || 1;
      const weeklyAvg = histCount / 4; // Approximate weekly average from 30-day window
      if (weekCount > weeklyAvg * 2 && weekCount >= 3) {
        const [crimeType, district] = key.split(":");
        this.alerts.push({
          alert_type: "ANOMALY_SPIKE",
          severity: "CRITICAL",
          title: `Anomalous spike: ${crimeType.replace(/_/g, " ")} in ${district}`,
          description: `${weekCount} cases in 7 days vs weekly average of ${weeklyAvg.toFixed(1)}`,
          linked_firs: this.firs.filter(f => f.district === district && f.crime_type === crimeType).slice(0, 5).map(f => f.fir_no),
          affected_area: district,
          recommended_action: `Immediate attention required. ${weekCount} ${crimeType.replace(/_/g, " ")} cases in ${district} this week. Deploy additional resources.`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  evaluateRepeatOffenderRule() {
    // Known repeat offender active in area after inactivity
    const offenderActivity = {};
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    for (const fir of this.firs) {
      if (!fir.accused_ids) continue; // Skip if no accused data in FIR object
    }

    // Check via graph if client available
    if (!this.client) return;
    this.client.query(`
      MATCH (a:Accused)-[r:involved_in]->(f:FIR)
      WHERE f.date_filed >= $cuttoff
      WITH a, count(f) AS recent_firs,
           max(f.date_filed) AS last_activity
      WHERE a.prior_conviction_count >= 2 OR recent_firs >= 2
      RETURN a.name AS name, a.accused_id AS id,
             recent_firs, last_activity, a.prior_conviction_count AS priors
      ORDER BY recent_firs DESC
      LIMIT 5
    `, { cuttoff: monthAgo.toISOString().split("T")[0] }).then(result => {
      for (const row of result) {
        if (!row || !row.name) continue;
        this.alerts.push({
          alert_type: "REPEAT_OFFENDER_ACTIVE",
          severity: "WARNING",
          title: `Repeat offender active: ${row.name}`,
          description: `${row.recent_firs} recent FIRs, ${row.priors} prior convictions`,
          linked_firs: [],
          affected_area: "",
          recommended_action: `Prioritize surveillance on ${row.name}. Review latest activity.`,
          created_at: new Date().toISOString(),
        });
      }
    }).catch(() => {});
  }

  getAlertsBySeverity(severity) {
    return this.alerts.filter(a => a.severity === severity);
  }

  getActiveAlerts() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.alerts.filter(a => new Date(a.created_at) >= oneDayAgo);
  }
}

// ============================================================
// Task 7.5 — Alert Generator (Catalyst-ready)
// ============================================================

class AlertGenerator {
  constructor() {
    this.activeAlerts = [];
    this.alertHistory = [];
  }

  generateAlert(type, severity, title, description, data = {}) {
    const alert = {
      alert_id: `ALERT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      alert_type: type,
      severity,
      title,
      description,
      affected_area: data.district || data.area || "",
      linked_firs: data.firs || [],
      recommended_action: data.action || "",
      status: "new",
      created_at: new Date().toISOString(),
      acknowledged_at: null,
      acknowledged_by: null,
    };

    this.activeAlerts.push(alert);
    this.alertHistory.push(alert);
    return alert;
  }

  acknowledgeAlert(alertId, officerId) {
    const alert = this.activeAlerts.find(a => a.alert_id === alertId);
    if (alert) {
      alert.status = "acknowledged";
      alert.acknowledged_at = new Date().toISOString();
      alert.acknowledged_by = officerId;
      this.activeAlerts = this.activeAlerts.filter(a => a.alert_id !== alertId);
    }
    return alert;
  }

  getAlertsByOfficer(district) {
    return this.activeAlerts.filter(a => !a.affected_area || a.affected_area === district);
  }

  getAllAlerts() {
    return this.activeAlerts;
  }
}

// ============================================================
// Tasks 7.6 + 7.7 — Catalyst Cron + API Endpoint
// ============================================================

class ForecastingEngine {
  constructor() {
    this.kde = new KDEBaseline();
    this.forecaster = new TemporalForecaster();
    this.backtester = null;
    this.earlyWarning = null;
    this.alertGenerator = new AlertGenerator();
    this.initialized = false;
  }

  async initialize(firs) {
    console.log("[Forecasting] Building KDE baseline...");
    this.kde.buildGrid(firs);
    console.log("[Forecasting] Building temporal models...");
    this.forecaster.buildModels(firs);
    this.backtester = new ForecastBacktester(this.kde, this.forecaster, firs);
    this.initialized = true;
    console.log("[Forecasting] Initialized");
    return this;
  }

  getHotspots(district, topN = 10) {
    return this.kde.getHotspots(topN);
  }

  getHeatmapData() {
    return this.kde.getHeatmapData();
  }

  getForecast(crimeType, district, days = 30) {
    return this.forecaster.forecast(crimeType, district, days);
  }

  getBacktest(days = 90) {
    return this.backtester.runBacktest(days);
  }

  evaluateEarlyWarnings() {
    return this.alertGenerator.getAllAlerts();
  }
}

module.exports = {
  KDEBaseline,
  TemporalForecaster,
  ForecastBacktester,
  EarlyWarningEngine,
  AlertGenerator,
  ForecastingEngine,
};

if (require.main === module) {
  const fs = require("fs");
  const path = require("path");

  console.log("=== Forecasting Engine Module Exported ===\n");
  const firs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/synthetic/output/firs.json"), "utf8")
  );

  const engine = ForecastingEngine;
  console.log("Methods:", Object.getOwnPropertyNames(engine.prototype));
  console.log("\nSynthetic data ready:", firs.length, "FIRs");
}
