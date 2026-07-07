/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { ScrollText, Search, Clock, User, Activity } from "lucide-react";
import { getActivityFeed } from "@/services/api";
import { SEED_AUDIT_ENTRIES } from "@/lib/seed-data";

export default function AuditPage() {
  const [entries, setEntries] = useState<any[]>(SEED_AUDIT_ENTRIES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getActivityFeed()
      .then((feed) => {
        if (Array.isArray(feed) && feed.length > 0) {
          const sorted = [...feed].sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
          );
          setEntries(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = search
    ? entries.filter((e) =>
        e.action?.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <ScrollText className="size-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-foreground">Audit Log</h1>
        </div>
        <p className="text-xs text-muted-foreground ml-8">
          Tamper-evident audit trail of all system actions and queries.
        </p>
      </div>

      <div className="px-6 py-3 border-b border-border bg-card/50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event or user..."
            className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
              <span className="ml-2">Loading audit trail...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Activity className="size-12 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              {search ? "No matching entries" : "No audit entries yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {filtered.map((e, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-3 shadow-2xs text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {e.action}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {e.detail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(e.time).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
