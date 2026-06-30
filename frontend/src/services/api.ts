/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("kci_os_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...options?.headers },
    ...options,
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("kci_os_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

export interface NLUResult {
  text: string;
  intent: string;
  slots: Record<string, string>;
  language: string;
  confidence: number;
  status: string;
  engine: string | null;
  missing_slots?: string[];
  clarification_prompt?: string;
}

export interface GraphRAGResponse {
  type: string;
  response: string;
  fact_mode?: string;
  citations?: {
    fir_no: string;
    crime_type: string;
    district: string;
    score?: number;
    is_verified?: boolean;
  }[];
  confidence?: number;
  reasoning_path?: { title: string; desc: string; conf: string }[];
  intent?: string;
  slots?: Record<string, string>;
  language?: string;
  error?: string;
  network?: NetworkResult;
  forecast?: any;
  hotspots?: any[];
}

export interface CrimeDNAResult {
  fir_no: string;
  mo_features: Record<string, string | number>;
  matches: {
    fir_no: string;
    score: number;
    crime_type: string;
    district: string;
    shared_features: string[];
  }[];
  match_count: number;
  pattern_detected: boolean;
  pattern_details: any;
  report: string;
}

export interface NetworkResult {
  nodes: {
    id: string;
    label: string;
    type: string;
    color: string;
    size: number;
    x: number;
    y: number;
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
    dashes: boolean;
    color: string;
    width: number;
  }[];
}

export interface ForecastResult {
  crime_type: string;
  district: string;
  forecast: { week: string; predicted: number }[];
  next_7_days_total: number;
  next_30_days_total: number;
  model_stats: { mape: number; mse: number; direction_accuracy: number };
}

export interface SimilarCasesResult {
  current_case: {
    fir_no: string;
    crime_type: string;
    district: string;
    narrative_text: string;
  };
  similar_cases: {
    fir_no: string;
    score: number;
    crime_type: string;
    district: string;
    date_filed: string;
    status: string;
    shared_mo_features: string[];
  }[];
  count: number;
  solved_rate: number;
  recommended_techniques: { technique: string; used_in: number }[];
  report: string;
}

export interface DashboardStats {
  total_firs: number;
  active_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  repeat_offenders: number;
  flagged_offenders: number;
  engines_online: number;
  districts: number;
  new_firs_this_week: number;
  alerts_generated: number;
}

export interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  badge: string;
}

export interface HotspotData {
  lat: number;
  long: number;
  intensity: number;
  dominant_crime: string;
  fir_count: number;
}

export interface AlertData {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export async function queryGraphRAG(
  queryText: string,
  history?: { role: string; content: string }[],
  role?: string,
  jurisdiction?: string,
): Promise<GraphRAGResponse> {
  return request("/graphrag", {
    method: "POST",
    body: JSON.stringify({
      query: queryText,
      history: history || [],
      user_role: role || "investigator",
      jurisdiction: jurisdiction || "",
    }),
  });
}

export interface FIRIngestPayload {
  crime_type: string;
  district: string;
  description?: string;
  suspect_name?: string;
  victim_name?: string;
  location?: { lat: number; lng: number };
}

export interface FIRIngestResponse {
  success: boolean;
  fir_no: string;
  fir: any;
  steps: { step: string; status: string; detail: string }[];
  alert: any;
  early_warning: any;
  total_firs: number;
}

export async function ingestFIR(payload: FIRIngestPayload): Promise<FIRIngestResponse> {
  return request("/fir/ingest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function exportPDF(messages: { role: string; content: string; citations?: any[]; timestamp?: string }[], officer_name?: string, fir_no?: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ messages, officer_name, fir_no }),
  });
  if (!res.ok) throw new Error("PDF export failed");
  return res.blob();
}

export async function processNLU(queryText: string): Promise<NLUResult> {
  return request("/nlu", {
    method: "POST",
    body: JSON.stringify({ query: queryText }),
  });
}

export async function analyzeCrimeDNA(firNo: string): Promise<CrimeDNAResult> {
  return request("/crime-dna", {
    method: "POST",
    body: JSON.stringify({ fir_no: firNo }),
  });
}

export async function getNetwork(query: string): Promise<NetworkResult> {
  return request("/network", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function getForecast(
  crimeType: string,
  district: string,
  days?: number,
): Promise<ForecastResult> {
  return request("/forecast", {
    method: "POST",
    body: JSON.stringify({ crime_type: crimeType, district, days: days || 30 }),
  });
}

export async function findSimilarCases(
  firNo: string,
): Promise<SimilarCasesResult> {
  return request("/similar-cases", {
    method: "POST",
    body: JSON.stringify({ fir_no: firNo }),
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request("/stats");
}

export async function getActivityFeed(): Promise<ActivityItem[]> {
  return request("/activity");
}

export async function getHeatmapData(): Promise<HotspotData[]> {
  return request("/heatmap");
}

export async function getAlerts(): Promise<AlertData[]> {
  return request("/alerts");
}

export async function getForecastSummary(): Promise<
  { district: string; crime_type: string; risk: string; next_7: number }[]
> {
  return request("/forecast/summary");
}
