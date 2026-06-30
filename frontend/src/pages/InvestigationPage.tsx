import { useState, useRef, useEffect } from "react";
import {
  MessageSquareText,
  Send,
  Mic,
  Network,
  FileSearch,
  TrendingUp,
  ArrowRight,
  Shield,
  Zap,
  ScrollText,
  Eye,
  Bot,
  User,
  Library,
  Activity,
  Sparkles,
  CheckCircle2,
  MapPin,
  Filter,
  Scale,
  FileDown,
  Plus,
  Loader2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  queryGraphRAG,
  getDashboardStats,
  getActivityFeed,
  ingestFIR,
  exportPDF,
} from "@/services/api";
import type {
  GraphRAGResponse,
  DashboardStats,
  ActivityItem,
  FIRIngestPayload,
  FIRIngestResponse,
} from "@/services/api";

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  richData: string | null;
  citations?: { fir_no: string; is_verified?: boolean }[];
}

const suggestions = [
  { label: "Show chain-snatching cases in Mysuru", icon: FileSearch },
  { label: "Network around accused ACC_001", icon: Network },
  { label: "Find similar cases to FIR 2024/MAN/0358", icon: Library },
  { label: "Show crime trends in Bengaluru", icon: TrendingUp },
];

const initialMessages: ChatMessage[] = [
  {
    role: "bot",
    content:
      "Welcome to **KCI-OS Investigation Copilot**. I can help you query crime data, analyze networks, predict hotspots, and find similar cases. Try one of the suggestions below or ask your own question in English or Kannada.",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    richData: null,
  },
];

const CRIME_TYPES = ["theft", "burglary", "robbery", "assault", "cheating", "cyber_fraud", "chain_snatching", "drug_offense"];
const DISTRICTS = ["Bengaluru Urban", "Belagavi", "Kalaburagi", "Mysuru", "Mangaluru", "Hubli-Dharwad"];

export default function InvestigationPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role === "supervisor";
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedQueryData, setSelectedQueryData] = useState<GraphRAGResponse | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const [factMode, setFactMode] = useState<"facts_only" | "hybrid" | "hypotheses_only">("hybrid");
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  const [ingestForm, setIngestForm] = useState<FIRIngestPayload>({ crime_type: "theft", district: "Bengaluru Urban", description: "", suspect_name: "" });
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<FIRIngestResponse | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
    getActivityFeed().then(setActivity).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const statCards = stats
    ? [
        {
          label: "Total FIRs", value: String(stats.total_firs), sub: `Across ${stats.districts} districts`, icon: ScrollText,
          change: `+${stats.new_firs_this_week} this week`, color: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
          label: "Active Alerts", value: String(stats.active_alerts), sub: `${stats.critical_alerts} critical, ${stats.warning_alerts} warning`, icon: Zap,
          change: `+${stats.alerts_generated} new`, color: "text-amber-600 bg-amber-50 border-amber-100",
        },
        {
          label: "Repeat Offenders", value: String(stats.repeat_offenders), sub: `${stats.flagged_offenders} with 5+ FIRs`, icon: Activity,
          change: `${stats.flagged_offenders} flagged`, color: "text-purple-600 bg-purple-50 border-purple-100",
        },
        {
          label: "Engines Online", value: `${stats.engines_online} / 5`, sub: "All systems nominal", icon: Shield,
          change: "100% Live", color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        },
      ]
    : [];

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", content: query, timestamp: userTime, richData: null }]);
    setInput("");
    setIsTyping(true);
    setActiveTab("response");

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await queryGraphRAG(query, chatHistory);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setSelectedQueryData(result);

      if (result.type === "network") {
        setNetworkData(result.network || null);
      }

      const botContent = result.response || `I analyzed your query about *"${query}"* across Karnataka's crime knowledge graph.`;
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: botContent,
          timestamp: botTime,
          richData: result.type,
          citations: result.citations || [],
        },
      ]);
    } catch {
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "I encountered an error processing your query. Please try again or rephrase.",
          timestamp: botTime,
          richData: null,
        },
      ]);
    }

    setIsTyping(false);
  };

  const handleIngest = async () => {
    setIngesting(true);
    setIngestResult(null);
    try {
      const result = await ingestFIR(ingestForm);
      setIngestResult(result);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `**System Alert: New FIR Ingested** — ${result.fir_no} (${ingestForm.crime_type} in ${ingestForm.district})`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), richData: null },
        {
          role: "bot",
          content: `**FIR Ingestion Cascade Complete**\n\nNew FIR **${result.fir_no}** has been ingested. ${result.steps.filter(s => s.status === "complete").length}/${result.steps.length} stages completed successfully.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          richData: "ingest",
        },
      ]);
      setStats(prev => prev ? { ...prev, total_firs: result.total_firs, new_firs_this_week: prev.new_firs_this_week + 1 } : prev);
      setActivity(prev => [{ action: `FIR Ingested: ${result.fir_no}`, detail: `${ingestForm.crime_type} in ${ingestForm.district} — ${result.steps.filter(s => s.status === "complete").length} cascade stages`, time: "Now", badge: "SYSTEM" }, ...prev]);
    } catch (e: any) {
      setIngestResult({ success: false, fir_no: "", fir: null, steps: [{ step: "error", status: "failed", detail: e.message }], alert: null, early_warning: null, total_firs: 0 });
    }
    setIngesting(false);
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      const chatMessages = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content, citations: m.citations, timestamp: m.timestamp }));
      const blob = await exportPDF(chatMessages, undefined, ingestResult?.fir_no);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kcios-investigation-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
    setExportingPdf(false);
  };

  const renderReasoningPath = () => {
    const path = selectedQueryData?.reasoning_path;
    if (!path || path.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <p className="text-xs">Send a query to see the AI audit trace.</p>
        </div>
      );
    }
    return (
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted/70">
        {path.map((step, idx) => (
          <div key={idx} className="relative rounded-xl border border-border bg-card p-3 shadow-2xs">
            <span className="absolute left-[-23px] top-3 flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-4 ring-[#F9F9F8]">
              {idx + 1}
            </span>
            <div className="flex justify-between items-center mb-1">
              <h5 className="text-xs font-bold text-foreground">{step.title}</h5>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {step.conf}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-mono bg-muted p-1.5 rounded border border-border mt-1">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderGraphTab = () => {
    const nodes = networkData?.nodes || [];
    const edges = networkData?.edges || [];
    const isFactsMode = factMode === "facts_only";
    if (nodes.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <Network className="size-8 mb-2" />
          <p className="text-xs font-medium">No graph data</p>
          <p className="mt-1 text-[11px]">Ask a network question to see the graph.</p>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border bg-stone-900 p-4 text-white relative overflow-hidden shadow-inner min-h-[350px]">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4 z-10">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">SUBGRAPH TOPOLOGY</span>
          </div>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
            {nodes.length} Nodes &bull; {edges.length} Edges
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center relative my-4">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />
          <div className="relative flex flex-col items-center gap-6 z-10 w-full max-w-xs">
            {nodes.slice(0, 1).map((node: any) => (
              <div
                key={node.id}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20"
              >
                <User className="size-3.5" /> {node.label}
              </div>
            ))}
            {edges.length > 0 && (
              <div className={`h-6 w-0.5 bg-linear-to-b from-emerald-500 to-amber-500 relative ${isFactsMode ? "opacity-30" : ""}`}>
                <span className="absolute -left-16 top-1 rounded bg-stone-800 px-1.5 py-0.5 text-[9px] text-muted-foreground border border-stone-700 whitespace-nowrap">
                  {edges[0].type} ({Math.round(edges[0].width * 50)}%)
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {nodes.slice(1, 6).map((node: any) => (
                <div
                  key={node.id}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium border ${isFactsMode ? "opacity-30 border-dashed" : "bg-stone-800 border-stone-700"}`}
                >
                  {node.type === "Location" ? <MapPin className="size-3.5 text-blue-400" /> : <User className="size-3.5 text-amber-400" />}
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-auto border-t border-stone-800 pt-3 flex justify-between items-center text-[10px] text-muted-foreground z-10">
          <span>GraphRAG Louvain Algorithm</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="size-3" /> {factMode === "facts_only" ? "Verified Facts Only" : factMode === "hypotheses_only" ? "AI Hypotheses" : "Live Graph"}
          </span>
        </div>
      </div>
    );
  };

  const renderCitations = () => {
    if (!selectedQueryData) return null;
    const citations = selectedQueryData.citations || [];
    if (citations.length === 0) return null;

    let filteredCitations = citations;
    if (factMode === "facts_only") {
      filteredCitations = citations.filter(c => c.is_verified);
    } else if (factMode === "hypotheses_only") {
      filteredCitations = citations.filter(c => !c.is_verified);
    }

    if (filteredCitations.length === 0) {
      return (
        <div className="rounded-xl border border-border bg-muted/50 p-3 text-center">
          <p className="text-[11px] text-muted-foreground">No {factMode === "facts_only" ? "verified" : "AI-inferred"} records match this filter.</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Filter className="size-3" /> Retrieved Entity Records ({filteredCitations.length})
          {selectedQueryData?.fact_mode === "hybrid" && factMode === "hybrid" && (
            <span className="ml-auto text-[10px] font-normal text-emerald-600">
              {citations.filter(c => c.is_verified).length} verified / {citations.filter(c => !c.is_verified).length} inferred
            </span>
          )}
        </h4>
        <div className="divide-y divide-border rounded-xl border border-border bg-muted/50 text-xs">
          {filteredCitations.map((cit, idx) => (
            <div key={idx} className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {cit.is_verified && (
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                )}
                {cit.is_verified === false && (
                  <div className="size-3.5 shrink-0 rounded-full border border-dashed border-amber-400" />
                )}
                <div>
                  <p className={`font-semibold ${cit.is_verified ? "text-emerald-800" : "text-foreground"}`}>
                    {cit.fir_no}
                    {cit.is_verified && <span className="ml-1.5 text-[9px] uppercase text-emerald-600 font-bold">Verified</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {cit.district} &bull; {cit.crime_type}
                  </p>
                </div>
              </div>
              {cit.score !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cit.is_verified ? "bg-emerald-100 text-emerald-700" : cit.score > 0.8 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  {(cit.score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataTab = () => {
    if (!selectedQueryData) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <MessageSquareText className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No Query Selected</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Send a query from the chat panel to view structured extracted FIR entities here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="size-4 text-emerald-600" /> Query Grounded in Graph
          </div>
          <p className="text-xs text-emerald-700/80">
            Retrieved from Karnataka Crime Knowledge Graph (GraphRAG v2.4) &bull; {selectedQueryData.intent || "general_query"}
          </p>
        </div>

        {/* Fact vs Hypothesis Legend */}
        {selectedQueryData.fact_mode === "hybrid" && (
          <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scale className="size-3.5" /> Evidence Classification
              </h4>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {factMode}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="size-3.5" /> Court-Verified Fact
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <div className="size-3.5 rounded-full border border-dashed border-amber-400" /> AI-Inferred
              </span>
            </div>
          </div>
        )}

        {renderCitations()}

        {selectedQueryData.confidence !== undefined && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Confidence Score</span>
              <span className="font-bold text-emerald-700">{(selectedQueryData.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(selectedQueryData.confidence || 0) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Ingest Result Steps */}
        {selectedQueryData.type === "ingest" && (() => {
          const result = ingestResult;
          if (!result) return null;
          return (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap className="size-3.5 text-emerald-500" /> Ingestion Cascade Pipeline
              </h4>
              <div className="relative pl-5 space-y-2 before:absolute before:left-2 before:top-1.5 before:bottom-1 before:w-0.5 before:bg-muted">
                {result.steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-2">
                    <span className={`absolute left-[-17px] top-1 flex size-3 items-center justify-center rounded-full ring-2 ring-card ${step.status === "complete" ? "bg-emerald-500" : step.status === "alert" ? "bg-amber-500" : step.status === "failed" ? "bg-red-500" : "bg-muted-foreground"}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">{step.step.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              {result.early_warning && (
                <div className={`mt-2 rounded-lg p-2 text-[11px] font-medium flex items-center gap-2 ${result.early_warning.level === "critical" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {result.early_warning.level.toUpperCase()} Early Warning for {result.early_warning.crime_type} in {result.early_warning.district}: {result.early_warning.next_7_total} predicted next 7 days
                </div>
              )}
            </div>
          );
        })()}

        {/* PDF Export Button */}
        {selectedQueryData && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="w-full text-xs gap-1.5"
          >
            {exportingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
            {exportingPdf ? "Exporting..." : "Export Investigation as PDF"}
          </Button>
        )}
      </div>
    );
  };

  const renderFactModeToggle = () => (
    <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border">
      <button
        onClick={() => setFactMode("facts_only")}
        className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${factMode === "facts_only" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
      >
        <CheckCircle2 className="size-3" /> Facts
      </button>
      <button
        onClick={() => setFactMode("hybrid")}
        className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${factMode === "hybrid" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Scale className="size-3" /> All
      </button>
      <button
        onClick={() => setFactMode("hypotheses_only")}
        className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${factMode === "hypotheses_only" ? "bg-amber-500 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Filter className="size-3" /> Inferred
      </button>
    </div>
  );

  const renderPanelContent = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full min-h-0 flex-1 flex-col">
      <div className="border-b border-border bg-muted/50 p-2 space-y-2">
        <TabsList className="grid w-full grid-cols-5 gap-1 bg-card/80 p-1 shadow-2xs rounded-xl border border-border">
          {[
            { value: "stats", label: "Stats", icon: Activity },
            { value: "response", label: "Data", icon: MessageSquareText },
            { value: "graph", label: "Graph", icon: Network },
            { value: "reasoning", label: "Trace", icon: Eye },
            { value: "evidence", label: "Evidence", icon: Scale },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xs"
            >
              <tab.icon className="size-3.5 shrink-0" />
              <span className="truncate hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="stats" className="min-h-0 flex-1 overflow-y-auto p-4 m-0">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {statCards.map((stat) => (
              <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-2xs transition-all hover:shadow-md hover:border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${stat.color}`}>
                    <stat.icon className="size-5" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground border border-border">
                    {stat.change}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground truncate">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-500" /> Recent Activity Feed
              </p>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-2.5 divide-y divide-border">
              {activity.map((act, i) => (
                <div key={i} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{act.action}</span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100">
                        {act.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">{act.detail}</p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="response" className="min-h-0 flex-1 overflow-y-auto p-4 m-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {renderFactModeToggle()}
            {selectedQueryData && (
              <Button variant="ghost" size="sm" onClick={handleExportPDF} disabled={exportingPdf} className="text-[10px] h-7 gap-1 px-2">
                {exportingPdf ? <Loader2 className="size-3 animate-spin" /> : <FileDown className="size-3" />}
                PDF
              </Button>
            )}
          </div>
          {renderDataTab()}
        </div>
      </TabsContent>

      <TabsContent value="graph" className="min-h-0 flex-1 overflow-y-auto p-4 m-0">
        {renderGraphTab()}
      </TabsContent>

      <TabsContent value="reasoning" className="min-h-0 flex-1 overflow-y-auto p-4 m-0">
        <div className="space-y-3">
          <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground font-medium border border-border flex items-center justify-between">
            <span>Explainable AI Audit Trace</span>
            <span className="text-emerald-600 font-bold">Court Defensible</span>
          </div>
          {renderReasoningPath()}
        </div>
      </TabsContent>

      <TabsContent value="evidence" className="min-h-0 flex-1 overflow-y-auto p-4 m-0">
        <div className="space-y-4">
          <div className="rounded-xl bg-muted p-3 text-xs font-medium border border-border">
            <p className="flex items-center gap-1.5 text-foreground mb-2">
              <Scale className="size-3.5 text-emerald-600" /> Evidence Classification Matrix
            </p>
            <p className="text-[11px] text-muted-foreground">
              Toggle between court-verified facts (green) and AI-inferred hypotheses (dashed) to understand what is proven vs suggested.
            </p>
          </div>
          {renderFactModeToggle()}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Court-Verified Facts</p>
                  <p className="text-[10px] text-emerald-700/70">3 FIRs verified by CMM/JMFC courts</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full border-2 border-dashed border-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">AI-Inferred Hypotheses</p>
                  <p className="text-[10px] text-amber-700/70">Based on MO similarity, network proximity, temporal patterns</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700">Variable</span>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col xl:flex-row bg-background overflow-hidden">
      {/* FIR Ingestion Dialog */}
      <Dialog open={showIngestDialog} onOpenChange={setShowIngestDialog}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="size-4 text-emerald-600" /> Ingest New FIR
            </DialogTitle>
            <DialogDescription className="text-xs">
              Simulate a live FIR ingestion. The system will run Crime DNA, network analysis, and early warning evaluation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Crime Type</label>
              <Select value={ingestForm.crime_type} onValueChange={(v) => setIngestForm(p => ({ ...p, crime_type: v }))}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRIME_TYPES.map(ct => (
                    <SelectItem key={ct} value={ct} className="text-xs">{ct.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">District</label>
              <Select value={ingestForm.district} onValueChange={(v) => setIngestForm(p => ({ ...p, district: v }))}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map(d => (
                    <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description (optional)</label>
              <input
                value={ingestForm.description || ""}
                onChange={(e) => setIngestForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief incident description..."
                className="h-9 w-full rounded-lg border border-border bg-muted/80 px-3 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500 focus:bg-card focus:ring-3 focus:ring-emerald-500/10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Suspect Name (optional)</label>
              <input
                value={ingestForm.suspect_name || ""}
                onChange={(e) => setIngestForm(p => ({ ...p, suspect_name: e.target.value }))}
                placeholder="Suspect name..."
                className="h-9 w-full rounded-lg border border-border bg-muted/80 px-3 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500 focus:bg-card focus:ring-3 focus:ring-emerald-500/10"
              />
            </div>
            <Button
              onClick={handleIngest}
              disabled={ingesting}
              className="w-full h-9 text-xs font-semibold gap-1.5"
            >
              {ingesting ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
              {ingesting ? "Running Cascade Pipeline..." : "Ingest FIR & Run Cascade"}
            </Button>

            {ingestResult && (
              <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                <p className={`text-xs font-bold flex items-center gap-1.5 ${ingestResult.success ? "text-emerald-700" : "text-red-700"}`}>
                  {ingestResult.success ? <CheckCircle2 className="size-3.5" /> : <X className="size-3.5" />}
                  {ingestResult.success ? `Ingested: ${ingestResult.fir_no}` : "Ingestion failed"}
                </p>
                {ingestResult.steps.map((s, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${s.status === "complete" ? "bg-emerald-500" : s.status === "alert" ? "bg-amber-500" : "bg-red-500"}`} />
                    {s.step}: {s.detail}
                  </p>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Chat Column */}
      <div className="flex min-w-0 min-h-0 flex-1 flex-col bg-background">
        <div className="flex xl:hidden items-center justify-between border-b border-border bg-card px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-foreground/80">Investigation Copilot</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowIngestDialog(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs active:scale-[0.98]">
              <Plus className="size-3.5" /> New FIR
            </button>
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs active:scale-[0.98]">
                  <Activity className="size-3.5 text-emerald-600" />
                  <span>Panel</span>
                  <span className="ml-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">5</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col bg-background">
                <SheetHeader className="p-4 border-b border-border bg-card text-left">
                  <SheetTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Shield className="size-4 text-emerald-600" /> KCI-OS Intelligence Panel
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-hidden flex flex-col">{renderPanelContent()}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop toolbar */}
        <div className="hidden xl:flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-2">
            <span className={`flex size-2 rounded-full ${isReadOnly ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
            <span className="text-xs font-bold text-foreground/80">
              {isReadOnly ? "Investigation Copilot (Read-Only)" : "Investigation Copilot"}
            </span>
            {isReadOnly && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase border border-amber-200">Review Mode</span>}
          </div>
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIngestDialog(true)}
                className="text-xs gap-1.5 h-8"
              >
                <Plus className="size-3.5" /> Ingest New FIR
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className="text-xs gap-1.5 h-8"
            >
              {exportingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <FileDown className="size-3.5" />}
              Export PDF
            </Button>
          </div>
        </div>
        {isReadOnly && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] font-medium text-amber-800 flex items-center gap-2">
            <Eye className="size-3.5" /> You are in <strong>read-only review mode</strong>. Investigation queries are viewable but new FIR ingestion is disabled for your role.
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((msg, i) => {
              if (msg.role === "system") {
                return (
                  <div key={i} className="flex justify-center">
                    <div className="rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-[11px] font-medium text-amber-800 flex items-center gap-1.5 shadow-xs">
                      <Info className="size-3" /> {msg.content}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-2xs ${
                      msg.role === "user" ? "bg-emerald-600 text-white" : "bg-card text-emerald-600 border border-border"
                    }`}>
                      {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                        msg.role === "user" ? "bg-emerald-600 text-white rounded-tr-xs" : "border border-border bg-card text-foreground rounded-tl-xs"
                      }`}>
                        <div className="prose prose-sm max-w-none wrap-break-word" dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.+?)\*\*/g, "<strong class='font-semibold'>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>"),
                        }} />
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {msg.citations.map((cit, ci) => (
                            <span key={ci} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                              cit.is_verified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200 border-dashed"
                            }`}>
                              {cit.is_verified ? <CheckCircle2 className="size-2.5" /> : <div className="size-2 rounded-full border border-dashed border-amber-400" />}
                              {cit.fir_no}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className={`mt-1 text-[11px] font-medium text-muted-foreground ${msg.role === "user" ? "text-right" : ""}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-emerald-600 border border-border shadow-2xs">
                    <Bot className="size-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-border bg-card px-5 py-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !isTyping && (
              <div className="pt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-500" /> Suggested Investigation Queries
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.label)}
                      className="group flex items-center justify-between text-left rounded-xl border border-border bg-card p-3.5 text-xs font-medium text-foreground/80 shadow-2xs transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800 active:scale-[0.99]"
                    >
                      <span className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600">
                          <s.icon className="size-3.5" />
                        </span>
                        <span className="truncate">{s.label}</span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {!isReadOnly && (
          <div className="border-t border-border bg-card p-3 sm:p-4 shadow-lg shadow-stone-900/5">
            <div className="mx-auto max-w-3xl flex items-center gap-2 sm:gap-3">
              <div className="relative flex flex-1 items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything about crime data in English or Kannada..."
                  className="h-11 w-full rounded-xl border border-border bg-muted/80 pl-4 pr-10 text-sm text-foreground placeholder-muted-foreground outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-card focus:ring-3 focus:ring-emerald-500/10 shadow-inner"
                />
                <button
                  title="Voice Query"
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-muted-foreground"
                >
                  <Mic className="size-4" />
                </button>
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 active:scale-[0.95]"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hidden xl:flex w-80 2xl:w-96 h-full min-h-0 min-w-0 shrink-0 flex-col border-l border-border bg-card shadow-2xs">
        {renderPanelContent()}
      </div>
    </div>
  );
}