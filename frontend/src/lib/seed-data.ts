import type { DashboardStats, ActivityItem } from "@/services/api"

export const SEED_STATS: DashboardStats = {
  total_firs: 500,
  active_alerts: 3,
  repeat_offenders: 25,
  flagged_offenders: 2,
  engines_online: 5,
  districts: 6,
  new_firs_this_week: 12,
  alerts_generated: 3,
  critical_alerts: 2,
  warning_alerts: 1,
}

export const SEED_ACTIVITY: ActivityItem[] = [
  { action: "Crime DNA match", detail: "87% MO similarity — FIR 2024/10/BEN/0038 and FIR 2024/11/BEN/0142 linked to same perpetrator", time: "2 min ago", badge: "Match" },
  { action: "Network expansion", detail: "2 new connections discovered around ACC_0045 (Ravi Kumar)", time: "15 min ago", badge: "Link" },
  { action: "Hotspot alert", detail: "Chain-snatching activity cluster detected in Mysuru — 3 incidents within 500m radius", time: "1 hour ago", badge: "Alert" },
  { action: "Repeat offender flagged", detail: "ACC_0092 (Suresh) linked to 4 burglary cases across Bengaluru Urban", time: "2 hours ago", badge: "Flag" },
  { action: "Forecast updated", detail: "Theft risk elevated for Bengaluru Urban — 35% increase predicted next 7 days", time: "3 hours ago", badge: "Trend" },
  { action: "Similar cases found", detail: "FIR 2024/08/KAL/0021 matches 3 chain-snatching cases in Kalaburagi", time: "5 hours ago", badge: "Match" },
  { action: "FIR ingestion complete", detail: "12 new FIRs ingested from Kasaba police station, Mysuru", time: "6 hours ago", badge: "System" },
  { action: "Gang activity detected", detail: "Louvain community detection found 3 accused with high centrality in Bengaluru drug network", time: "8 hours ago", badge: "Alert" },
]

export const SEED_NETWORK = {
  nodes: [
    { id: "ACC_001", label: "Ravi Kumar", type: "center", color: "#ff4444", size: 30, x: 400, y: 300 },
    { id: "ACC_045", label: "Suresh Patel", type: "accused", color: "#ff8c00", size: 22, x: 280, y: 200 },
    { id: "ACC_078", label: "Mohan Singh", type: "accused", color: "#ff8c00", size: 20, x: 520, y: 220 },
    { id: "ACC_112", label: "Venkatesh", type: "accused", color: "#ff8c00", size: 18, x: 350, y: 420 },
    { id: "ACC_156", label: "Kumar", type: "accused", color: "#ff8c00", size: 16, x: 500, y: 400 },
    { id: "FIR_001", label: "2024/05/BEN/0411", type: "fir", color: "#4fc3f7", size: 14, x: 200, y: 150 },
    { id: "FIR_002", label: "2024/08/BEN/0223", type: "fir", color: "#4fc3f7", size: 14, x: 250, y: 280 },
    { id: "FIR_003", label: "2024/11/BEN/0107", type: "fir", color: "#4fc3f7", size: 14, x: 450, y: 150 },
    { id: "FIR_004", label: "2024/06/MYS/0041", type: "fir", color: "#4fc3f7", size: 14, x: 350, y: 350 },
    { id: "FIR_005", label: "2024/09/BEN/0318", type: "fir", color: "#4fc3f7", size: 14, x: 550, y: 320 },
    { id: "PH_001", label: "+91-9876543210", type: "phone", color: "#66bb6a", size: 12, x: 180, y: 350 },
    { id: "LOC_001", label: "Bengaluru Urban", type: "location", color: "#ab47bc", size: 12, x: 600, y: 280 },
  ],
  edges: [
    { source: "ACC_001", target: "ACC_045", label: "co-accused" },
    { source: "ACC_001", target: "ACC_078", label: "co-accused" },
    { source: "ACC_001", target: "ACC_112", label: "phone-call" },
    { source: "ACC_001", target: "FIR_001", label: "accused-in" },
    { source: "ACC_001", target: "FIR_002", label: "accused-in" },
    { source: "ACC_045", target: "FIR_003", label: "accused-in" },
    { source: "ACC_078", target: "FIR_004", label: "accused-in" },
    { source: "ACC_112", target: "FIR_005", label: "accused-in" },
    { source: "ACC_001", target: "PH_001", label: "owns" },
    { source: "ACC_045", target: "FIR_001", label: "accused-in" },
    { source: "ACC_078", target: "FIR_002", label: "accused-in" },
    { source: "ACC_112", target: "ACC_156", label: "family" },
    { source: "ACC_156", target: "FIR_004", label: "accused-in" },
    { source: "ACC_001", target: "LOC_001", label: "operates-in" },
  ],
}

export const SEED_HOTSPOTS = [
  { lat: 12.9716, long: 77.5946, intensity: 92, count: 28, dominant_crime: "theft", district: "Bengaluru Urban" },
  { lat: 12.2958, long: 76.6394, intensity: 85, count: 21, dominant_crime: "chain_snatching", district: "Mysuru" },
  { lat: 12.9141, long: 77.6837, intensity: 78, count: 18, dominant_crime: "burglary", district: "Bengaluru Urban" },
  { lat: 13.3409, long: 74.7471, intensity: 71, count: 15, dominant_crime: "robbery", district: "Udupi" },
  { lat: 15.8497, long: 74.4977, intensity: 65, count: 13, dominant_crime: "cyber_fraud", district: "Belagavi" },
  { lat: 12.8767, long: 77.5923, intensity: 60, count: 11, dominant_crime: "assault", district: "Bengaluru Urban" },
  { lat: 13.3162, long: 77.7123, intensity: 55, count: 10, dominant_crime: "drug_offense", district: "Bengaluru Urban" },
  { lat: 12.3121, long: 76.6481, intensity: 50, count: 9, dominant_crime: "cheating", district: "Mysuru" },
  { lat: 15.3647, long: 75.1240, intensity: 45, count: 8, dominant_crime: "theft", district: "Hubli-Dharwad" },
  { lat: 17.3290, long: 76.8314, intensity: 40, count: 7, dominant_crime: "burglary", district: "Kalaburagi" },
  { lat: 12.9943, long: 77.6645, intensity: 38, count: 6, dominant_crime: "chain_snatching", district: "Bengaluru Urban" },
  { lat: 13.0217, long: 77.5642, intensity: 35, count: 6, dominant_crime: "robbery", district: "Bengaluru Urban" },
  { lat: 12.9166, long: 77.6107, intensity: 32, count: 5, dominant_crime: "theft", district: "Bengaluru Urban" },
  { lat: 12.9563, long: 77.7159, intensity: 30, count: 5, dominant_crime: "cyber_fraud", district: "Bengaluru Urban" },
]

export const SEED_FORECAST_SUMMARIES = [
  { crime_type: "theft", district: "Bengaluru Urban", risk: "critical", next_7: 42, next_30: 185, trend: "rising" },
  { crime_type: "chain_snatching", district: "Mysuru", risk: "critical", next_7: 28, next_30: 112, trend: "rising" },
  { crime_type: "burglary", district: "Bengaluru Urban", risk: "elevated", next_7: 19, next_30: 78, trend: "stable" },
  { crime_type: "robbery", district: "Udupi", risk: "elevated", next_7: 12, next_30: 45, trend: "rising" },
  { crime_type: "cyber_fraud", district: "Belagavi", risk: "elevated", next_7: 15, next_30: 52, trend: "rising" },
  { crime_type: "drug_offense", district: "Bengaluru Urban", risk: "moderate", next_7: 8, next_30: 31, trend: "stable" },
  { crime_type: "assault", district: "Mysuru", risk: "moderate", next_7: 6, next_30: 24, trend: "stable" },
  { crime_type: "cheating", district: "Bengaluru Urban", risk: "moderate", next_7: 10, next_30: 38, trend: "falling" },
  { crime_type: "theft", district: "Mysuru", risk: "low", next_7: 4, next_30: 18, trend: "stable" },
  { crime_type: "burglary", district: "Belagavi", risk: "low", next_7: 3, next_30: 12, trend: "stable" },
]

export const SEED_FORECAST = {
  next_7_days_total: 42,
  next_30_days_total: 185,
  model_stats: { mape: 0.087, mse: 12.4, direction_accuracy: 0.83 },
  forecast: [
    { week: "Week 1", predicted: 7 },
    { week: "Week 2", predicted: 6 },
    { week: "Week 3", predicted: 5 },
    { week: "Week 4", predicted: 8 },
    { week: "Week 5", predicted: 6 },
    { week: "Week 6", predicted: 4 },
    { week: "Week 7", predicted: 3 },
    { week: "Week 8", predicted: 3 },
  ],
}

export const SEED_ALERTS = [
  { id: "alert_001", fir_no: "SYSTEM", type: "forecast", severity: "critical", title: "Theft Surge Warning — Bengaluru Urban", description: "KDE-ST-DBSCAN model predicts 42 theft incidents in next 7 days (85% confidence). 28% increase over baseline. Recommend increased patrols in KR Puram and Whitefield.", timestamp: new Date().toISOString(), data: { predicted: 42, confidence: 0.85, districts: ["Bengaluru Urban"] }, acknowledged: false },
  { id: "alert_002", fir_no: "SYSTEM", type: "hotspot", severity: "critical", title: "Chain-Snatching Cluster — Mysuru", description: "3 chain-snatching FIRs within 500m radius near Devaraja Market. Same MO pattern detected — suspects operating on two-wheeler during evening hours (6-8 PM).", timestamp: new Date(Date.now() - 3600000).toISOString(), data: { cluster_size: 3, radius_m: 500, time_window: "18:00-20:00" }, acknowledged: false },
  { id: "alert_003", fir_no: "SYSTEM", type: "network", severity: "warning", title: "Repeat Offender Active — ACC_0092 (Suresh)", description: "ACC_0092 linked to 4 burglary cases in Bengaluru Urban. Last known activity: 2 days ago. Priority surveillance recommended.", timestamp: new Date(Date.now() - 7200000).toISOString(), data: { accused: "ACC_0092", name: "Suresh", case_count: 4, district: "Bengaluru Urban" }, acknowledged: false },
  { id: "alert_004", fir_no: "SYSTEM", type: "forecast", severity: "info", title: "Crime DNA Pattern Match — 87% Similarity", description: "FIR 2024/10/BEN/0038 (robbery) and FIR 2024/11/BEN/0142 (robbery) share 87% MO feature overlap. Likely same perpetrator. Recommended: joint investigation.", timestamp: new Date(Date.now() - 14400000).toISOString(), data: { fir_1: "2024/10/BEN/0038", fir_2: "2024/11/BEN/0142", similarity: 0.87 }, acknowledged: false },
  { id: "alert_005", fir_no: "SYSTEM", type: "gang", severity: "warning", title: "Organized Gang Detected — Drug Network", description: "Louvain community detection found a 5-member drug trafficking ring operating across Bengaluru Urban and Mysuru. Central hub identified as ACC_0045 (Ravi Kumar).", timestamp: new Date(Date.now() - 28800000).toISOString(), data: { gang_size: 5, members: ["ACC_001", "ACC_045", "ACC_078", "ACC_112", "ACC_156"], districts: ["Bengaluru Urban", "Mysuru"] }, acknowledged: false },
  { id: "alert_006", fir_no: "SYSTEM", type: "info", severity: "info", title: "Community Alert — Festival Season Advisory", description: "Historical pattern shows 35% increase in chain-snatching during festival months (Aug-Oct). Preemptive patrol deployment recommended for market areas.", timestamp: new Date(Date.now() - 86400000).toISOString(), data: { season: "festival", increase_pct: 35, months: ["August", "September", "October"] }, acknowledged: true },
]

export const SEED_AUDIT_ENTRIES: ActivityItem[] = [
  { action: "User Login", detail: "Inspector Priyansh N (admin) — authenticated successfully", time: new Date().toISOString(), badge: "Auth" },
  { action: "FIR Query Executed", detail: "Retrieved FIR 2024/05/BEN/0411 — robbery case in Bengaluru Urban", time: new Date(Date.now() - 60000).toISOString(), badge: "Query" },
  { action: "Network Analysis", detail: "Explored 38 nodes / 25 edges around ACC_001 (Ravi Kumar)", time: new Date(Date.now() - 120000).toISOString(), badge: "Analysis" },
  { action: "Crime DNA Match", detail: "87% MO similarity detected between 2 robbery FIRs", time: new Date(Date.now() - 300000).toISOString(), badge: "Match" },
  { action: "Hotspot Query", detail: "14 active hotspots loaded — KDE grid computed across 6 districts", time: new Date(Date.now() - 600000).toISOString(), badge: "Map" },
  { action: "Forecast Generated", detail: "Theft forecast for Bengaluru Urban: 42 incidents predicted next 7 days", time: new Date(Date.now() - 1800000).toISOString(), badge: "Forecast" },
  { action: "PDF Export", detail: "Investigation report exported by Inspector Priyansh N (admin)", time: new Date(Date.now() - 3600000).toISOString(), badge: "Export" },
  { action: "FIR Ingestion", detail: "12 new FIRs ingested via cascade pipeline — entity-extraction → crime-dna → alert", time: new Date(Date.now() - 7200000).toISOString(), badge: "Ingest" },
  { action: "System Health Check", detail: "All 5 engines online — GraphRAG, CrimeDNA, Network, Forecasting, NLU", time: new Date(Date.now() - 14400000).toISOString(), badge: "System" },
  { action: "Role Switch", detail: "User switched to analyst role — limited access enforced", time: new Date(Date.now() - 28800000).toISOString(), badge: "Auth" },
  { action: "Alert Generated", detail: "Critical: Theft surge warning for Bengaluru Urban (42 predicted)", time: new Date(Date.now() - 43200000).toISOString(), badge: "Alert" },
  { action: "Gang Detection", detail: "Louvain community detection found 5-member drug ring", time: new Date(Date.now() - 86400000).toISOString(), badge: "Analysis" },
]

export const SEED_CHAT_MESSAGES = [
  {
    role: "user" as const,
    content: "I need to see FIR 2024/05/BEN/0411. It involves a robbery in Bengaluru Urban.",
    timestamp: "10:32 AM",
    richData: null,
  },
  {
    role: "bot" as const,
    content: "**FIR 2024/05/BEN/0411** — Robbery in Bengaluru Urban\n\n**Details:**\n- **Crime Type:** Robbery\n- **Victim:** 34-year-old male, electronics shop owner\n- **Date:** May 15, 2024\n- **Location:** KR Puram, Bengaluru Urban\n- **Status:** Under Investigation\n- **ACC_001 (Ravi Kumar)** — primary suspect\n- **ACC_045 (Suresh Patel)** — co-accused\n\n**MO Analysis:** Forceful entry during closing hours, weapon not displayed. Similar to 2 other cases.",
    timestamp: "10:33 AM",
    richData: {
      fir_no: "2024/05/BEN/0411",
      crime_type: "robbery",
      district: "Bengaluru Urban",
      score: 0.87,
      citations: [
        { fir_no: "2024/05/BEN/0411", crime_type: "robbery", district: "Bengaluru Urban", score: 0.94, is_verified: true },
        { fir_no: "2024/08/BEN/0223", crime_type: "robbery", district: "Bengaluru Urban", score: 0.87, is_verified: false },
      ],
      confidence: 0.94,
      reasoning_path: [
        { title: "Entity Extraction", desc: "Intent: retrieve_fir | Target FIR matched", conf: "99.8%" },
        { title: "Vector Proximity Search", desc: "Found 2 similar embeddings (score ≥ 0.85)", conf: "94.2%" },
        { title: "MO Feature Analysis", desc: "3 matching features: forceful entry, evening time, no weapon", conf: "87.1%" },
      ],
    },
  },
  {
    role: "user" as const,
    content: "Show me the criminal network around ACC_001",
    timestamp: "10:35 AM",
    richData: null,
  },
  {
    role: "bot" as const,
    content: "**Network Analysis** — Explored **12 nodes** and **14 edges** centered around `ACC_001 (Ravi Kumar)`.\n\n**Connected Entities:**\n- **ACC_045 (Suresh Patel)** — co-accused in FIR 2024/05/BEN/0411\n- **ACC_078 (Mohan Singh)** — co-accused in FIR 2024/08/BEN/0223\n- **ACC_112 (Venkatesh)** — frequent phone contact (24 calls in 7 days)\n- **+91-9876543210** — shared phone number with ACC_045\n\n**Centrality Score:** 0.82 (high) — Ravi Kumar is a central hub in this network.",
    timestamp: "10:36 AM",
    richData: null,
  },
  {
    role: "user" as const,
    content: "Are there any similar cases in Mysuru?",
    timestamp: "10:38 AM",
    richData: null,
  },
  {
    role: "bot" as const,
    content: "**Similar Cases** — Found **3 matching FIRs** in Mysuru with MO similarity ≥ 75%\n\n| FIR | Crime Type | Score | District |\n|-----|-----------|-------|----------|\n| 2024/06/MYS/0041 | Robbery | 0.89 | Mysuru |\n| 2024/11/MYS/0107 | Chain Snatching | 0.76 | Mysuru |\n| 2024/10/MYS/0146 | Burglary | 0.71 | Mysuru |\n\n**Pattern Detected:** All 3 cases occurred within 2km radius of Devaraja Market during evening hours (6-9 PM). Recommend coordinated patrol deployment.",
    timestamp: "10:39 AM",
    richData: {
      citations: [
        { fir_no: "2024/06/MYS/0041", crime_type: "robbery", district: "Mysuru", score: 0.89, is_verified: true },
        { fir_no: "2024/11/MYS/0107", crime_type: "chain_snatching", district: "Mysuru", score: 0.76, is_verified: false },
        { fir_no: "2024/10/MYS/0146", crime_type: "burglary", district: "Mysuru", score: 0.71, is_verified: false },
      ],
    },
  },
]
