/* eslint-disable @typescript-eslint/no-explicit-any */
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
  queryGraphRAG,
  getDashboardStats,
  getActivityFeed,
  getForecastSummary,
} from "@/services/api";
import type {
  GraphRAGResponse,
  DashboardStats,
  ActivityItem,
} from "@/services/api";

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  richData: string | null;
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

export default function InvestigationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedQueryData, setSelectedQueryData] =
    useState<GraphRAGResponse | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const [forecastSummary, setForecastSummary] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {});
    getActivityFeed()
      .then(setActivity)
      .catch(() => {});
    getForecastSummary()
      .then(setForecastSummary)
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const statCards = stats
    ? [
        {
          label: "Total FIRs",
          value: String(stats.total_firs),
          sub: `Across ${stats.districts} districts`,
          icon: ScrollText,
          change: `+${stats.new_firs_this_week} this week`,
          color: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
          label: "Active Alerts",
          value: String(stats.active_alerts),
          sub: `${stats.critical_alerts} critical, ${stats.warning_alerts} warning`,
          icon: Zap,
          change: `+${stats.alerts_generated} new`,
          color: "text-amber-600 bg-amber-50 border-amber-100",
        },
        {
          label: "Repeat Offenders",
          value: String(stats.repeat_offenders),
          sub: `${stats.flagged_offenders} with 5+ FIRs`,
          icon: Activity,
          change: `${stats.flagged_offenders} flagged`,
          color: "text-purple-600 bg-purple-50 border-purple-100",
        },
        {
          label: "Engines Online",
          value: `${stats.engines_online} / 5`,
          sub: "All systems nominal",
          icon: Shield,
          change: "100% Live",
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        },
      ]
    : [];

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { role: "user", content: query, timestamp: userTime, richData: null },
    ]);
    setInput("");
    setIsTyping(true);
    setActiveTab("response");

    try {
      const result = await queryGraphRAG(query);
      const botTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setSelectedQueryData(result);
      setActiveTab("response");

      if (result.type === "network") {
        setNetworkData(result.network || null);
      }

      const botContent =
        result.response ||
        `I analyzed your query about *"${query}"* across Karnataka's crime knowledge graph.`;
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: botContent,
          timestamp: botTime,
          richData: result.type,
        },
      ]);
    } catch {
      const botTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `I encountered an error processing your query. Please try again or rephrase.`,
          timestamp: botTime,
          richData: null,
        },
      ]);
    }

    setIsTyping(false);
  };

  const renderReasoningPath = () => {
    const path = selectedQueryData?.reasoning_path;
    if (!path || path.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-400">
          <p className="text-xs">Send a query to see the AI audit trace.</p>
        </div>
      );
    }
    return (
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
        {path.map((step, idx) => (
          <div
            key={idx}
            className="relative rounded-xl border border-stone-200/80 bg-white p-3 shadow-2xs"
          >
            <span className="absolute -left-[23px] top-3 flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-4 ring-[#F9F9F8]">
              {idx + 1}
            </span>
            <div className="flex justify-between items-center mb-1">
              <h5 className="text-xs font-bold text-stone-800">{step.title}</h5>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {step.conf}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed font-mono bg-stone-50 p-1.5 rounded border border-stone-100 mt-1">
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
    if (nodes.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-400">
          <Network className="size-8 mb-2" />
          <p className="text-xs font-medium">No graph data</p>
          <p className="mt-1 text-[11px]">
            Ask a network question to see the graph.
          </p>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col rounded-2xl border border-stone-200/80 bg-stone-900 p-4 text-white relative overflow-hidden shadow-inner min-h-[350px]">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4 z-10">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">
              SUBGRAPH TOPOLOGY
            </span>
          </div>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
            {nodes.length} Nodes &bull; {edges.length} Edges
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center relative my-4">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
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
              <div className="h-6 w-0.5 bg-gradient-to-b from-emerald-500 to-amber-500 relative">
                <span className="absolute -left-16 top-1 rounded bg-stone-800 px-1.5 py-0.5 text-[9px] text-stone-300 border border-stone-700 whitespace-nowrap">
                  {edges[0].type} ({Math.round(edges[0].width * 50)}%)
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {nodes.slice(1, 6).map((node: any) => (
                <div
                  key={node.id}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-800 px-3 py-2 text-xs font-medium border border-stone-700"
                >
                  {node.type === "Location" ? (
                    <MapPin className="size-3.5 text-blue-400" />
                  ) : (
                    <User className="size-3.5 text-amber-400" />
                  )}
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-auto border-t border-stone-800 pt-3 flex justify-between items-center text-[10px] text-stone-400 z-10">
          <span>GraphRAG Louvain Algorithm</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="size-3" /> Live Graph
          </span>
        </div>
      </div>
    );
  };

  const renderDataTab = () => {
    if (!selectedQueryData) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-400">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 mb-3">
            <MessageSquareText className="size-6 text-stone-400" />
          </div>
          <p className="text-sm font-medium text-stone-600">
            No Query Selected
          </p>
          <p className="mt-1 text-xs text-stone-400 max-w-xs">
            Send a query from the chat panel to view structured extracted FIR
            entities here.
          </p>
        </div>
      );
    }
    const citations = selectedQueryData.citations || [];
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="size-4 text-emerald-600" /> Query Grounded
            in Graph
          </div>
          <p className="text-xs text-emerald-700/80">
            Retrieved from Karnataka Crime Knowledge Graph (GraphRAG v2.4)
            &bull; {selectedQueryData.intent || "general_query"}
          </p>
        </div>
        {citations.length > 0 && (
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Retrieved Entity Records ({citations.length})
            </h4>
            <div className="divide-y divide-stone-100 rounded-xl border border-stone-100 bg-stone-50/50 text-xs">
              {citations.map((cit, idx) => (
                <div
                  key={idx}
                  className="p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-stone-800">{cit.fir_no}</p>
                    <p className="text-[11px] text-stone-500">
                      {cit.district} &bull; {cit.crime_type}
                    </p>
                  </div>
                  {cit.score !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cit.score > 0.8 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {(cit.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedQueryData.confidence !== undefined && (
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">
                Confidence Score
              </span>
              <span className="font-bold text-emerald-700">
                {(selectedQueryData.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${(selectedQueryData.confidence || 0) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
        {forecastSummary.length > 0 &&
          selectedQueryData?.type === "forecast" && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Forecast Summary
              </h4>
              {forecastSummary
                .filter((fs) => fs.risk !== "normal")
                .slice(0, 3)
                .map((fs, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50 border border-stone-100"
                  >
                    <span className="font-medium text-stone-700">
                      {fs.district} &bull; {fs.crime_type}
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${fs.risk === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {fs.next_7}&nbsp;next 7d
                    </span>
                  </div>
                ))}
            </div>
          )}
      </div>
    );
  };

  const renderPanelContent = () => (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <div className="border-b border-stone-200/80 bg-stone-100/50 p-2">
        <TabsList className="grid w-full grid-cols-4 gap-1 bg-white/80 p-1 shadow-2xs rounded-xl border border-stone-200/60">
          {[
            { value: "stats", label: "Stats", icon: Activity },
            { value: "response", label: "Data", icon: MessageSquareText },
            { value: "graph", label: "Graph", icon: Network },
            { value: "reasoning", label: "Trace", icon: Eye },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-500 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xs"
            >
              <tab.icon className="size-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent
        value="stats"
        className="min-h-0 flex-1 overflow-y-auto p-4 m-0"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs transition-all hover:shadow-md hover:border-stone-300/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${stat.color}`}
                  >
                    <stat.icon className="size-5" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600 border border-stone-200/60">
                    {stat.change}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-stone-500">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-stone-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-400 truncate">
                    {stat.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-500" /> Recent
                Activity Feed
              </p>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-2.5 divide-y divide-stone-100">
              {activity.map((act, i) => (
                <div
                  key={i}
                  className="pt-2.5 first:pt-0 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-800">
                        {act.action}
                      </span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100">
                        {act.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-stone-500 line-clamp-2">
                      {act.detail}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-stone-400 shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="response"
        className="min-h-0 flex-1 overflow-y-auto p-4 m-0"
      >
        {renderDataTab()}
      </TabsContent>

      <TabsContent
        value="graph"
        className="min-h-0 flex-1 overflow-y-auto p-4 m-0"
      >
        {renderGraphTab()}
      </TabsContent>

      <TabsContent
        value="reasoning"
        className="min-h-0 flex-1 overflow-y-auto p-4 m-0"
      >
        <div className="space-y-3">
          <div className="rounded-xl bg-stone-100 p-3 text-xs text-stone-600 font-medium border border-stone-200/60 flex items-center justify-between">
            <span>Explainable AI Audit Trace</span>
            <span className="text-emerald-600 font-bold">Court Defensible</span>
          </div>
          {renderReasoningPath()}
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col xl:flex-row bg-[#F9F9F8] overflow-hidden">
      <div className="flex min-w-0 min-h-0 flex-1 flex-col bg-[#F9F9F8]">
        <div className="flex xl:hidden items-center justify-between border-b border-stone-200/80 bg-white px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-stone-700">
              Investigation Copilot
            </span>
          </div>
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs active:scale-[0.98]">
                <Activity className="size-3.5 text-emerald-600" />
                <span>View Intelligence Panel</span>
                <span className="ml-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                  4
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] sm:w-[400px] p-0 flex flex-col bg-[#F9F9F8]"
            >
              <SheetHeader className="p-4 border-b border-stone-200 bg-white text-left">
                <SheetTitle className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Shield className="size-4 text-emerald-600" /> KCI-OS
                  Intelligence Panel
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden flex flex-col">
                {renderPanelContent()}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-2xs ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-600 border border-stone-200/80"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-xs"
                          : "border border-stone-200/80 bg-white text-stone-800 rounded-tl-xs"
                      }`}
                    >
                      <div
                        className="prose prose-sm max-w-none break-words"
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(
                              /\*\*(.+?)\*\*/g,
                              "<strong class='font-semibold'>$1</strong>",
                            )
                            .replace(
                              /\*(.+?)\*/g,
                              "<em class='italic'>$1</em>",
                            ),
                        }}
                      />
                    </div>
                    <p
                      className={`mt-1 text-[11px] font-medium text-stone-400 ${msg.role === "user" ? "text-right" : ""}`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 border border-stone-200/80 shadow-2xs">
                    <Bot className="size-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-stone-200/80 bg-white px-5 py-3.5 shadow-2xs">
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
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-500" /> Suggested
                  Investigation Queries
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.label)}
                      className="group flex items-center justify-between text-left rounded-xl border border-stone-200/80 bg-white p-3.5 text-xs font-medium text-stone-700 shadow-2xs transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800 active:scale-[0.99]"
                    >
                      <span className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600">
                          <s.icon className="size-3.5" />
                        </span>
                        <span className="truncate">{s.label}</span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-stone-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-stone-200/80 bg-white p-3 sm:p-4 shadow-lg shadow-stone-900/5">
          <div className="mx-auto max-w-3xl flex items-center gap-2 sm:gap-3">
            <div className="relative flex flex-1 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything about crime data in English or Kannada..."
                className="h-11 w-full rounded-xl border border-stone-200/80 bg-stone-50/80 pl-4 pr-10 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 shadow-inner"
              />
              <button
                title="Voice Query"
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-600"
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
      </div>

      <div className="hidden xl:flex w-80 2xl:w-96 h-full min-h-0 min-w-0 shrink-0 flex-col border-l border-stone-200/80 bg-white shadow-2xs">
        {renderPanelContent()}
      </div>
    </div>
  );
}
