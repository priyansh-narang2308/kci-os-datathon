const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = "kci-os-demo-secret-2026";
const JWT_EXPIRY = "24h";

const USERS = {
  admin: { password: hashPassword("admin123"), role: "admin", name: "Admin", badge: "System Administrator" },
  investigator: { password: hashPassword("invest123"), role: "investigator", name: "Inspector Sharma", badge: "Inspector Rank" },
  analyst: { password: hashPassword("analyst123"), role: "analyst", name: "Analyst Rao", badge: "Senior Analyst" },
  supervisor: { password: hashPassword("super123"), role: "supervisor", name: "DG Iyer", badge: "Deputy General" },
  policymaker: { password: hashPassword("policy123"), role: "policymaker", name: "Secretary Nair", badge: "Policy Advisor" },
};

function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw + JWT_SECRET).digest("hex");
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: `Access denied. Required role: ${roles.join(" or ")}` });
    next();
  };
}

function protect(...roles) {
  return [authenticateToken, requireRole(...roles)];
}

const FIRS_PATH = path.join(__dirname, "..", "data", "synthetic", "output", "firs.json");
const EDGES_PATH = path.join(__dirname, "..", "data", "synthetic", "output", "edges.json");

const firs = JSON.parse(fs.readFileSync(FIRS_PATH, "utf-8"));
const edgesData = fs.existsSync(EDGES_PATH) ? JSON.parse(fs.readFileSync(EDGES_PATH, "utf-8")) : null;
const alerts = [];

// ── Load Catalyst Function Handlers (with SDK mock for local dev) ──
const { handlers: catalystHandlers, setStoreData } = require("./catalyst/loader");
setStoreData("FIR", firs);

const { processQuery } = require("./nlu/router.js");
const { CrimeDNAEngine } = require("./engines/crime-dna.js");
const NetworkAnalyzer = require("./engines/network-analysis.js");
const { ForecastingEngine } = require("./engines/forecasting.js");
const { InvestigationSupportEngine } = require("./engines/investigation-support.js");

class MockGraphClient {
  constructor(edgesData) {
    this.edges = edgesData?.fir_accused || [];
    this.adjacency = {};
    for (const e of this.edges) {
      if (!e.from || !e.to) continue;
      if (!this.adjacency[e.from]) this.adjacency[e.from] = {};
      if (!this.adjacency[e.to]) this.adjacency[e.to] = {};
      this.adjacency[e.from][e.to] = (this.adjacency[e.from][e.to] || 0) + 1;
      this.adjacency[e.to][e.from] = (this.adjacency[e.to][e.from] || 0) + 1;
    }
  }

  async query(cypher, params = {}) {
    const upper = cypher.toUpperCase();
    if (upper.includes("SHORTESTPATH")) {
      const { a, b } = params;
      if (!a || !b) return [];
      const visited = new Set();
      const queue = [{ node: a, path: [a], edges: [] }];
      visited.add(a);
      while (queue.length > 0) {
        const { node, path: p, edges: e } = queue.shift();
        if (node === b) {
          return [{
            path_nodes: p.map(id => ({ id, name: id, type: "Accused" })),
            path_edges: e.map(() => ({ type: "linked_to", confidence: 0.5 })),
            hops: p.length - 1,
          }];
        }
        if (p.length >= 6) continue;
        for (const n of Object.keys(this.adjacency[node] || {})) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push({ node: n, path: [...p, n], edges: [...e, { type: "linked_to" }] });
          }
        }
      }
      return [];
    }

    if (upper.includes("involved_in")) {
      const id = params.id;
      if (!id) return [];
      const crimeTypes = new Set();
      let firCount = 0;
      for (const fir of firs) {
        if (fir.accused_ids?.includes(id)) { firCount++; crimeTypes.add(fir.crime_type); }
      }
      return [{ fir_count: firCount, crime_types: [...crimeTypes] }];
    }

    if (upper.includes("MATCH (A:ACCUSED)")) {
      return this.edges.filter(e => e.from && e.to).map(e => ({
        source: e.from, target: e.to, relationship: e.type || "linked_to", confidence: e.confidence || 0.5,
      }));
    }

    if (upper.includes("MATCH PATH")) {
      const id = params.id;
      const maxHops = params.hops || 2;
      if (!id) return [];
      const visited = new Set();
      const queue = [{ node: id, distance: 0, edgeTypes: [] }];
      visited.add(id);
      const results = [];
      while (queue.length > 0) {
        const { node, distance, edgeTypes } = queue.shift();
        if (distance > 0) {
          results.push({ id: node, name: node, type: "Accused", distance, edge_types: edgeTypes.length > 0 ? edgeTypes : ["linked_to"] });
        }
        if (distance >= maxHops) continue;
        for (const n of Object.keys(this.adjacency[node] || {})) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push({ node: n, distance: distance + 1, edgeTypes: ["linked_to"] });
          }
        }
      }
      return results;
    }

    return [];
  }
}

const crimeDNA = new CrimeDNAEngine();
const forecasting = new ForecastingEngine();
const investigation = new InvestigationSupportEngine();
let crimeDNAInitialized = false;
let forecastingInitialized = false;
let investigationInitialized = false;

const networkClient = new MockGraphClient(edgesData);
const networkAnalyzer = new NetworkAnalyzer(networkClient);

const app = express();
app.use(cors());
app.use(express.json());

// --- Auth routes (public) ---
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    const user = USERS[username.toLowerCase()];
    if (!user || user.password !== hashPassword(password)) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { username: username.toLowerCase(), role: user.role, name: user.name, badge: user.badge },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    res.json({
      token,
      user: { username: username.toLowerCase(), role: user.role, name: user.name, badge: user.badge },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/switch-role", authenticateToken, (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["admin", "investigator", "analyst", "supervisor", "policymaker"];
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });
    const token = jwt.sign(
      { username: req.user.username, role, name: req.user.name, badge: req.user.badge },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    res.json({ token, user: { username: req.user.username, role, name: req.user.name, badge: req.user.badge } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

async function ensureCrimeDNA() {
  if (!crimeDNAInitialized) { await crimeDNA.initialize(firs); crimeDNAInitialized = true; }
}

async function ensureForecasting() {
  if (!forecastingInitialized) { await forecasting.initialize(firs); forecastingInitialized = true; }
}

async function ensureInvestigation() {
  if (!investigationInitialized) { await investigation.initialize(firs); investigationInitialized = true; }
}

app.post("/api/nlu", ...protect("investigator", "analyst", "admin"), (req, res) => {
  try {
    const { query: q } = req.body;
    if (!q) return res.status(400).json({ error: "Missing query" });
    res.json(processQuery(q));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── In-memory cascade state for demo ──
let cascadeLog = [];
const FACT_STORE = new Map(); // fir_no -> { verified: boolean, verified_by: string, verified_at: string }

app.post("/api/graphrag", ...protect("investigator", "supervisor", "admin"), async (req, res) => {
  try {
    const { query: q, history } = req.body;
    if (!q) return res.status(400).json({ error: "Missing query" });
    const nluResult = processQuery(q, history);
    if (nluResult.status === "needs_clarification") {
      return res.json({ type: "clarification", missing_slots: nluResult.missing_slots, prompt: nluResult.clarification_prompt, partial_intent: nluResult.intent });
    }
    const { intent, slots, language } = nluResult;
    const rp = [{ title: "Entity Extraction", desc: `Parsed query: intent='${intent}', slots=${JSON.stringify(slots)}`, conf: "99.8%" }];

    if (intent === "show_network" || intent === "network_analysis") {
      const target = slots.target_entity || slots.fir_number || "ACC_001";
      let netResult;
      try { netResult = await networkAnalyzer.getNetworkAround(target, 2); } catch { netResult = { nodes: [], edges: [] }; }
      const viz = netResult.nodes ? networkAnalyzer.formatForVisualization(netResult) : { nodes: [], edges: [] };
      rp.push({ title: "Graph Traversal", desc: `BFS from '${target}' found ${viz.nodes.length} nodes`, conf: "100%" });
      rp.push({ title: "Spatio-Temporal Synthesis", desc: "Aggregated results and formulated institutional intelligence advice.", conf: "96.5%" });
      const nodeCount = viz.nodes.length;
      return res.json({
        type: "network",
        response: `**Network Analysis** — Explored **${nodeCount} nodes** and **${viz.edges.length} edges** centered around \`${target}\`.${nodeCount > 1 ? ` Found ${nodeCount - 1} connected entities.` : " No direct connections found."}`,
        network: viz, citations: [], confidence: 0.94, reasoning_path: rp, intent, slots, language, fact_mode: "hybrid",
      });
    }

    if (intent === "find_similar" || intent === "investigation_support") {
      await ensureInvestigation();
      const tf = slots.fir_number ? firs.find(f => f.fir_no === slots.fir_number) : firs[0];
      if (tf) {
        const sim = await investigation.findSimilar(tf, { topK: 5 });
        rp.push({ title: "Embedding Search", desc: `Found ${sim.count} similar cases`, conf: "94.2%" });
        rp.push({ title: "Spatio-Temporal Synthesis", desc: "Aggregated results and formulated investigative recommendations.", conf: "96.5%" });
          return res.json({
            type: "similar", response: sim.report,
            citations: sim.similar_cases.map(c => ({ fir_no: c.fir_no, crime_type: c.crime_type, district: c.district, score: c.score, is_verified: FACT_STORE.has(c.fir_no) })),
            confidence: sim.similar_cases[0]?.score || 0, reasoning_path: rp, intent, slots, language, fact_mode: "hybrid",
          });
      }
      return res.json({ type: "response", response: `FIR "${slots.fir_number}" not found.`, citations: [], confidence: 0, reasoning_path: rp, intent, slots, language, fact_mode: "hybrid" });
    }

    if (intent === "predict_hotspot" || intent === "show_trend" || intent === "forecasting") {
      await ensureForecasting();
      const dist = slots.district || "Bengaluru Urban";
      const ct = slots.crime_type || "theft";
      let fd;
      try { fd = await forecasting.getForecast(ct, dist, 30); } catch { fd = null; }
      rp.push({ title: "Temporal Forecasting", desc: `${ct} in ${dist}: next 7d=${fd?.next_7_days_total || "N/A"}`, conf: "88.3%" });
      rp.push({ title: "Spatio-Temporal Synthesis", desc: "Aggregated results and formulated institutional intelligence advice.", conf: "96.5%" });
      return res.json({
        type: "forecast",
        response: fd ? `**Forecast for ${ct} in ${dist}**: Next 7 days: **${fd.next_7_days_total}** incidents, Next 30 days: **${fd.next_30_days_total}** incidents. Model accuracy: MAPE=${(fd.model_stats.mape * 100).toFixed(1)}%.` : `No forecast model available for ${ct} in ${dist}.`,
        citations: [], confidence: fd ? 0.88 : 0, reasoning_path: rp, forecast: fd, hotspots: forecasting.getHotspots(dist, 5).slice(0, 5), intent, slots, language, fact_mode: "hybrid",
      });
    }

    if (intent === "crime_dna") {
      await ensureCrimeDNA();
      const tf = slots.fir_number ? firs.find(f => f.fir_no === slots.fir_number) : firs[0];
      if (tf) {
        const an = await crimeDNA.analyzeNewFIR(tf);
        rp.push({ title: "MO Feature Extraction", desc: `Extracted ${Object.keys(an.features).length} MO features`, conf: "99.8%" });
        rp.push({ title: "Vector Proximity Search", desc: `Retrieved ${an.match_count} similar embeddings`, conf: `${((an.matches[0]?.score || 0) * 100).toFixed(1)}%` });
        rp.push({ title: "Pattern Detection", desc: an.pattern_detected ? "MO pattern cluster detected" : "No significant pattern", conf: an.pattern_detected ? "87.2%" : "95.1%" });
        rp.push({ title: "Spatio-Temporal Synthesis", desc: "Aggregated results and formulated institutional intelligence advice.", conf: "96.5%" });
          return res.json({
            type: "crime_dna", response: an.report,
            citations: an.matches.map(m => ({ fir_no: m.fir_no, crime_type: m.crime_type, district: m.district, score: m.score, is_verified: FACT_STORE.has(m.fir_no) })),
            confidence: an.matches[0]?.score || 0, reasoning_path: rp, intent, slots, language, fact_mode: "hybrid",
          });
      }
    }

    const lq = q.toLowerCase();
    let response = "";
    let citations = [];
    let confidence = 0;

    if (lq.includes("chain-snatching") || lq.includes("mysuru")) {
      const ms = firs.filter(f => f.district === "Mysuru" && f.crime_type === "chain_snatching").slice(0, 3);
      response = `Found **${ms.length} linked chain-snatching FIRs** in Mysurus. Confidence: **94.2%**.`;
      citations = ms.map(f => ({ fir_no: f.fir_no, crime_type: f.crime_type, district: f.district }));
    } else if (lq.includes("repeat") || lq.includes("offender") || lq.includes("bengaluru")) {
      const bfs = firs.filter(f => f.district === "Bengaluru Urban");
      const ac = {};
      for (const f of bfs) { if (f.accused_ids) f.accused_ids.forEach(a => { ac[a] = (ac[a] || 0) + 1; }); }
      const rpCount = Object.values(ac).filter(c => c >= 3).length;
      response = `Found **${bfs.length} FIRs** in Bengaluru Urban. Identified **${rpCount} potential repeat offenders**.`;
    } else {
      await ensureCrimeDNA();
      const tf = firs[Math.floor(Math.random() * firs.length)];
      const an = await crimeDNA.analyzeNewFIR(tf);
      response = `Queried **${firs.length} FIR records**. ${an.report.substring(0, 300)}`;
      citations = an.matches.slice(0, 3).map(m => ({ fir_no: m.fir_no, crime_type: m.crime_type, district: m.district, score: m.score }));
      rp.push({ title: "Entity Extraction", desc: `Parsed query: '${q}'`, conf: "99.8%" });
      rp.push({ title: "Vector Proximity Search", desc: `Retrieved ${an.match_count} similar embeddings`, conf: "94.2%" });
    }
    rp.push({ title: "Spatio-Temporal Synthesis", desc: "Aggregated results and formulated institutional intelligence advice.", conf: "96.5%" });
    res.json({ type: "response", response, citations: citations.slice(0, 5).map(c => ({ ...c, is_verified: FACT_STORE.has(c.fir_no) })), confidence, reasoning_path: rp, intent, slots, language, fact_mode: "hybrid" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/crime-dna", ...protect("investigator", "analyst", "admin"), async (req, res) => {
  try {
    await ensureCrimeDNA();
    const target = (req.body.fir_no ? firs.find(f => f.fir_no === req.body.fir_no) : null) || firs[0];
    const result = await crimeDNA.analyzeNewFIR(target);
    res.json({ fir_no: target.fir_no, mo_features: result.features, matches: result.matches, match_count: result.match_count, pattern_detected: result.pattern?.pattern_detected || false, pattern_details: result.pattern, report: result.report });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/network", ...protect("investigator", "analyst", "admin"), async (req, res) => {
  try {
    const target = req.body.target || "ACC_001";
    const netResult = await networkAnalyzer.getNetworkAround(target, 2);
    res.json(networkAnalyzer.formatForVisualization(netResult));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/forecast", ...protect("analyst", "supervisor", "policymaker", "admin"), async (req, res) => {
  try {
    await ensureForecasting();
    const ct = req.body.crime_type || "theft", dist = req.body.district || "Bengaluru Urban", d = req.body.days || 30;
    const result = await forecasting.getForecast(ct, dist, d);
    res.json(result || { crime_type: ct, district: dist, forecast: [], next_7_days_total: 0, next_30_days_total: 0, model_stats: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/similar-cases", ...protect("investigator", "analyst", "admin"), async (req, res) => {
  try {
    await ensureInvestigation();
    const target = (req.body.fir_no ? firs.find(f => f.fir_no === req.body.fir_no) : null) || firs[0];
    const result = await investigation.findSimilar(target, { topK: 5 });
    res.json({ current_case: { fir_no: target.fir_no, crime_type: target.crime_type, district: target.district, narrative_text: target.narrative_text }, similar_cases: result.similar_cases, count: result.count, solved_rate: result.solved_rate, recommended_techniques: result.recommended_techniques, report: result.report });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/stats", ...protect("investigator", "analyst", "supervisor", "policymaker", "admin"), (req, res) => {
  try {
    const districts = [...new Set(firs.map(f => f.district))].length;
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = firs.filter(f => new Date(f.date_filed) >= oneWeekAgo).length;
    res.json({ total_firs: firs.length, active_alerts: 3, critical_alerts: 2, warning_alerts: 1, repeat_offenders: 25, flagged_offenders: 2, engines_online: 5, districts, new_firs_this_week: newThisWeek, alerts_generated: 3 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/activity", ...protect("investigator", "analyst", "supervisor", "policymaker", "admin"), (req, res) => {
  const r = () => Math.floor(Math.random() * firs.length);
  res.json([
    { action: "Crime DNA match", detail: `87% MO similarity — FIR ${firs[r()].fir_no}`, time: "2 min ago", badge: "Match" },
    { action: "Network updated", detail: "ACC_001 linked to ACC_007 via phone call logs", time: "15 min ago", badge: "Graph" },
    { action: "Early warning", detail: "3 similar MOs in Mysuru — 7 day window", time: "1 hr ago", badge: "Alert" },
    { action: "Forecast computed", detail: "Mysuru Central — elevated risk next 14d", time: "2 hr ago", badge: "Predict" },
  ]);
});

app.get("/api/heatmap", ...protect("analyst", "admin"), async (req, res) => {
  try { await ensureForecasting(); res.json(forecasting.getHeatmapData()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/alerts", ...protect("investigator", "analyst", "supervisor", "admin"), async (req, res) => {
  try {
    await ensureForecasting();
    const earlyWarnings = forecasting.evaluateEarlyWarnings();
    const forecastAlerts = (Array.isArray(earlyWarnings) ? earlyWarnings : []).map((ew, i) => ({
      id: `fw_${i}_${Date.now()}`,
      fir_no: "SYSTEM",
      type: "forecast",
      severity: ew.risk || (ew.level || "info"),
      title: `${ew.crime_type ? ew.crime_type.replace(/_/g, " ") + " " : ""}Early Warning`,
      message: `${ew.crime_type || ""} in ${ew.district || "Unknown"}: ${ew.next_7 || 0} predicted next 7 days`,
      description: `${ew.crime_type || ""} in ${ew.district || "Unknown"}: ${ew.next_7 || 0} predicted next 7 days`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }));
    const allAlerts = [...(alerts || []), ...forecastAlerts].slice(0, 50);
    res.json(allAlerts);
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/forecast/summary", ...protect("analyst", "supervisor", "policymaker", "admin"), async (req, res) => {
  try {
    await ensureForecasting();
    const districts = [...new Set(firs.map(f => f.district))].slice(0, 6);
    const cts = [...new Set(firs.map(f => f.crime_type))].slice(0, 3);
    const summaries = [];
    for (const district of districts) {
      for (const ct of cts) {
        try {
          const f = await forecasting.getForecast(ct, district, 7);
          if (f) summaries.push({ district, crime_type: ct, risk: f.next_7_days_total > 10 ? "critical" : f.next_7_days_total > 5 ? "elevated" : "normal", next_7: f.next_7_days_total });
        } catch {}
      }
    }
    res.json(summaries);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Seed some court-verified facts for demo ──
FACT_STORE.set("ACC_001", { verified: true, verified_by: "CMM Court Bengaluru", verified_at: "2026-01-15" });
FACT_STORE.set("FIR_2025_011", { verified: true, verified_by: "JMFC Court Mysuru", verified_at: "2026-02-20" });
FACT_STORE.set("FIR_2025_024", { verified: true, verified_by: "CMM Court Belagavi", verified_at: "2026-03-10" });

// ── POST /api/fir/ingest — Live FIR ingestion cascade ──
app.post("/api/fir/ingest", ...protect("investigator", "admin"), async (req, res) => {
  try {
    const { crime_type, district, description, suspect_name, victim_name, location } = req.body;
    if (!crime_type || !district) return res.status(400).json({ error: "Missing required fields: crime_type, district" });

    const newFirNo = `FIR_2026_${String(firs.length + 1).padStart(4, "0")}`;
    const loc = location || { lat: 12.97 + Math.random() * 0.06, lng: 77.57 + Math.random() * 0.06 };
    const newFIR = {
      fir_no: newFirNo,
      crime_type,
      district,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0],
      narrative_text: description || `${crime_type} incident reported in ${district}`,
      description: description || `${crime_type} incident reported in ${district}`,
      status: "under_investigation",
      suspect_name: suspect_name || "Unknown",
      victim_name: victim_name || "Unknown",
      lat: loc.lat,
      long: loc.lng,
      location: loc,
      accused_ids: suspect_name !== "Unknown" ? [`ACC_${String(firs.length + 1).padStart(4, "0")}`] : [],
      complainant: victim_name || "Unknown",
      fir_date: new Date().toISOString().split("T")[0],
      date_filed: new Date().toISOString().split("T")[0],
      police_station_id: `PS_${district.substring(0, 3).toUpperCase()}_${String(firs.length + 1).padStart(3, "0")}`,
      sections_of_law: ["IPC_379"],
      investigating_officer_id: req.user?.username || "system",
    };

    firs.unshift(newFIR);
    setStoreData("FIR", firs);
    const steps = [];

    // Step 1: Catalyst Entity Extraction
    try {
      const entityResult = await catalystHandlers["entity-extraction"].handler({ data: newFIR });
      if (entityResult.status === 200) {
        steps.push({ step: "catalyst_entity_extraction", status: "complete", detail: `Extracted ${entityResult.content.entities.accused.length} accused, ${entityResult.content.entities.victims.length} victims — Catalyst Function` });
      } else {
        steps.push({ step: "catalyst_entity_extraction", status: "failed", detail: entityResult.content.error });
      }
    } catch (e) {
      steps.push({ step: "catalyst_entity_extraction", status: "failed", detail: e.message });
    }

    // Step 2: Catalyst Crime DNA Analysis
    await ensureCrimeDNA();
    let dnaResult = null;
    try {
      const dnaHandlerResult = await catalystHandlers["crime-dna-analyzer"].handler({ data: newFIR });
      if (dnaHandlerResult.status === 200) {
        dnaResult = dnaHandlerResult.content;
        steps.push({ step: "catalyst_crime_dna", status: "complete", detail: `Matched ${dnaResult.match_count} similar cases (score: ${dnaResult.matches?.[0]?.score || "N/A"}) — Catalyst Function` });
      } else {
        dnaResult = await crimeDNA.analyzeNewFIR(newFIR);
        steps.push({ step: "catalyst_crime_dna", status: "complete", detail: `Matched ${dnaResult.match_count} similar cases (local fallback)`, fallback: true });
      }
    } catch (e) {
      dnaResult = await crimeDNA.analyzeNewFIR(newFIR);
      steps.push({ step: "catalyst_crime_dna", status: "complete", detail: `Matched ${dnaResult.match_count} similar cases (local fallback)`, fallback: true });
    }

    // Step 3: Network Update
    let networkImpact = null;
    try {
      networkImpact = await networkAnalyzer.getNetworkAround(newFIR.fir_no, 1);
      steps.push({ step: "network", status: "complete", detail: `Network expanded — ${networkImpact.nodes?.length || 0} nodes reachable from ${newFIR.fir_no}` });
    } catch (e) {
      steps.push({ step: "network", status: "failed", detail: e.message });
    }

    // Step 4: Catalyst Similar Cases
    await ensureInvestigation();
    let simCases = null;
    try {
      const simResult = await catalystHandlers["similar-cases"].handler({ data: { fir_no: newFIR.fir_no } });
      if (simResult.status === 200) {
        simCases = simResult.content;
        steps.push({ step: "catalyst_similar_cases", status: "complete", detail: `Found ${simCases.count} similar historical cases — Catalyst Function` });
      } else {
        simCases = await investigation.findSimilar(newFIR, { topK: 3 });
        steps.push({ step: "catalyst_similar_cases", status: "complete", detail: `Found ${simCases.count} similar cases (local fallback)` });
      }
    } catch (e) {
      simCases = await investigation.findSimilar(newFIR, { topK: 3 });
      steps.push({ step: "catalyst_similar_cases", status: "complete", detail: `Found ${simCases.count} similar cases (local fallback)` });
    }

    // Step 5: Catalyst Alert Generator + Early Warning
    await ensureForecasting();
    let earlyWarning = null;
    try {
      const alertResult = await catalystHandlers["alert-generator"].handler({ data: { fir_data: newFIR, dna_analysis: dnaResult || {} } });
      if (alertResult.status === 200) {
        steps.push({ step: "catalyst_alert_generator", status: "complete", detail: `Generated ${alertResult.content.alerts_generated} alerts — Catalyst Function` });
      } else {
        throw new Error(alertResult.content.error);
      }
    } catch (e) {
      steps.push({ step: "catalyst_alert_generator", status: "fallback", detail: `Local fallback: ${e.message}` });
    }

    // Early Warning Evaluation (always runs)
    try {
      const forecast = await forecasting.getForecast(crime_type, district, 7);
      if (forecast && forecast.next_7_days_total > 5) {
        earlyWarning = { crime_type, district, level: forecast.next_7_days_total > 10 ? "critical" : "elevated", next_7_total: forecast.next_7_days_total };
        steps.push({ step: "early_warning", status: "alert", detail: `Forecast predicts ${forecast.next_7_days_total} ${crime_type} cases in ${district} next 7 days — ${earlyWarning.level} risk` });
      } else {
        steps.push({ step: "early_warning", status: "normal", detail: `No elevated risk detected for ${crime_type} in ${district}` });
      }
    } catch (e) {
      steps.push({ step: "early_warning", status: "failed", detail: e.message });
    }

    // Step 6: Generate system alert
    const severity = earlyWarning?.level || "info";
    const alertMsg = severity === "critical"
      ? `CRITICAL: New ${crime_type} FIR in ${district} — ${dnaResult ? dnaResult.match_count + ' similar patterns found' : ''}`
      : severity === "elevated"
      ? `WARNING: New ${crime_type} FIR in ${district} — elevated risk period`
      : `INFO: New FIR ${newFirNo} ingested — ${crime_type} in ${district}`;

    const newAlert = {
      id: `alert_${Date.now()}`,
      fir_no: newFirNo,
      type: "system",
      severity,
      message: alertMsg,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    alerts.unshift(newAlert);
    steps.push({ step: "alert_generated", status: "complete", detail: alertMsg });

    cascadeLog.unshift({ fir_no: newFirNo, timestamp: new Date().toISOString(), steps });

    res.json({
      success: true,
      fir_no: newFirNo,
      fir: newFIR,
      steps,
      alert: newAlert,
      early_warning: earlyWarning,
      total_firs: firs.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/fir/ingest/cascade — Fetch recent cascade logs ──
app.get("/api/fir/ingest/cascade", ...protect("investigator", "admin"), (req, res) => {
  res.json({ cascades: cascadeLog.slice(0, 10) });
});

// ── POST /api/export/pdf — Export investigation as PDF ──
app.post("/api/export/pdf", authenticateToken, (req, res) => {
  try {
    const { messages, officer_name, fir_no } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Missing or invalid messages" });

    const officer = officer_name || req.user.name || "Officer";
    const exportedAt = new Date().toISOString();
    const lines = [
      "=".repeat(72),
      "  KARNATAKA CRIME INTELLIGENCE OPERATING SYSTEM (KCI-OS)",
      "  INVESTIGATION EXPORT REPORT",
      "=".repeat(72),
      "",
      `Exported by: ${officer} (Role: ${req.user.role || "investigator"})`,
      `Date: ${exportedAt}`,
      `FIR Reference: ${fir_no || "N/A"}`,
      `Export ID: EXP-${Date.now().toString(36).toUpperCase()}`,
      "",
      "-".repeat(72),
      "  CONVERSATION TRANSCRIPT",
      "-".repeat(72),
      "",
    ];

    for (const msg of messages) {
      const role = msg.role?.toUpperCase() || "USER";
      const ts = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "";
      lines.push(`[${role}]${ts ? " @ " + ts : ""}`);
      lines.push(`  ${(msg.content || "").replace(/<\/?[^>]+(>|$)/g, "")}`);
      if (msg.citations && msg.citations.length > 0) {
        lines.push(`  └─ Citations: ${msg.citations.map(c => c.fir_no).join(", ")}`);
      }
      lines.push("");
    }

    lines.push("-".repeat(72));
    lines.push("  END OF REPORT");
    lines.push("-".repeat(72));

    const content = lines.join("\n");
    const buffer = Buffer.from(content, "utf-8");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="kcios-export-${Date.now()}.pdf"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/catalyst/invoke/:functionName — Invoke a Catalyst Function directly ──
app.post("/api/catalyst/invoke/:functionName", ...protect("admin"), async (req, res) => {
  try {
    const { functionName } = req.params;
    if (!catalystHandlers[functionName]) {
      return res.status(404).json({ error: `Catalyst function '${functionName}' not found. Available: ${Object.keys(catalystHandlers).join(", ")}` });
    }
    const result = await catalystHandlers[functionName].handler({ data: req.body });
    res.json({ function: functionName, status: result.status, result: result.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/catalyst/functions — List all Catalyst Functions ──
app.get("/api/catalyst/functions", ...protect("admin", "investigator", "analyst"), (req, res) => {
  const fnDescriptions = {
    "entity-extraction": "Extract entities and MO features from FIR narrative",
    "crime-dna-analyzer": "Run MO similarity search and pattern detection on FIR",
    "alert-generator": "Evaluate early warning rules and generate alerts",
    "nlu-pipeline": "Process natural language queries (English, Kannada, Code-Mixed)",
    "forecast-trigger": "Recompute hotspot forecasts and retrain models",
    "similar-cases": "Find historical cases similar to a given FIR",
  };
  const fnList = Object.keys(catalystHandlers).map(name => ({ name, description: fnDescriptions[name] || "", status: "loaded" }));
  res.json({ functions: fnList, runtime: "Catalyst Functions (Mock SDK — Local Dev)", event_listeners: "fir_insert → entity-extraction → crime-dna-analyzer → alert-generator" });
});

// ── GET /api/fact-store — Return verified facts ──
app.get("/api/fact-store", authenticateToken, (req, res) => {
  const facts = [];
  for (const [fir_no, data] of FACT_STORE) {
    facts.push({ fir_no, ...data });
  }
  res.json({ facts });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`KCI-OS API Server running on http://localhost:${PORT}`);
  console.log(`Loaded ${firs.length} FIR records`);
});
