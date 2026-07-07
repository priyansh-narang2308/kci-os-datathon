/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Network,
  Users,
  Search,
  ArrowRight,
  MapPin,
  Shield,
} from "lucide-react";
import { getNetwork } from "@/services/api";

export default function NetworkPage() {
  const [query, setQuery] = useState("ACC_001");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setSearched(query);
    try {
      const res = await getNetwork(query);
      setData(res);
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <Network className="size-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-foreground">
            Network Analysis
          </h1>
        </div>
        <p className="text-xs text-muted-foreground ml-8">
          Community detection, centrality scoring, and link analysis across the
          crime graph.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
        {/* Floating, Centered Prominent Search Bar */}
        <div className="mb-8 flex justify-center mt-2">
          <div className="group flex items-center gap-3 rounded-2xl bg-white border border-stone-200/80 p-2 transition-all duration-300 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/80 shadow-lg hover:shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-center size-12 ml-1 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 transition-colors group-focus-within:bg-emerald-500 group-focus-within:text-white">
              <Search className="size-5" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by accused ID (e.g. ACC_001) or entity..."
              className="bg-transparent border-none outline-none w-full text-[16px] text-stone-800 placeholder:text-stone-400 font-medium tracking-tight"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-[14px] font-bold text-white hover:bg-emerald-500 disabled:opacity-50 shadow-md transition-all"
            >
              {loading ? "Analyzing..." : "Analyze Network"}
              <ArrowRight className="size-4.5" />
            </button>
          </div>
        </div>

        {!data && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Network className="size-12 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              Enter an entity ID to explore the network
            </p>
          </div>
        )}
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
              <span className="ml-2">Traversing graph...</span>
            </div>
          </div>
        )}
        {data && !loading && (
          <div className="space-y-6">
            {searched && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Center Node</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {searched}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-foreground">
                      {data.nodes?.length || 0}
                    </p>
                    <p className="text-muted-foreground">Nodes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">
                      {data.edges?.length || 0}
                    </p>
                    <p className="text-muted-foreground">Edges</p>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-stone-900 p-6 text-white min-h-[300px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold tracking-wide flex items-center gap-2">
                    <Network className="size-4 text-emerald-400" /> TOPOLOGY
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                    {data.nodes?.length || 0} Nodes &bull;{" "}
                    {data.edges?.length || 0} Edges
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 py-8">
                  {data.nodes?.slice(0, 1).map((n: any) => (
                    <div
                      key={n.id}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20"
                    >
                      <Shield className="size-3.5" /> {n.label}
                    </div>
                  ))}
                  {data.nodes?.length > 1 && (
                    <div className="text-muted-foreground text-xs">
                      connected to
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {data.nodes?.slice(1, 8).map((n: any) => (
                      <div
                        key={n.id}
                        className="flex items-center gap-1.5 rounded-xl bg-stone-800 px-3 py-2 text-xs font-medium border border-stone-700"
                      >
                        {n.type === "Location" ? (
                          <MapPin className="size-3.5 text-blue-400" />
                        ) : (
                          <Users className="size-3.5 text-amber-400" />
                        )}
                        {n.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {data.nodes?.length > 1 && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Connected Entities
                </h3>
                <div className="divide-y divide-border text-xs">
                  {data.nodes.slice(1).map((n: any, i: number) => (
                    <div
                      key={n.id}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {n.label}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            {n.type}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {n.distance} hop{n.distance > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
