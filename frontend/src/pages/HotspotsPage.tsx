/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Map, TrendingUp, Shield } from "lucide-react";
import { getForecastSummary, getHeatmapData } from "@/services/api";

export default function HotspotsPage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getForecastSummary(), getHeatmapData()])
      .then(([s, h]) => {
        setSummaries(s);
        setHeatmap(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const critical = summaries.filter((s) => s.risk === "critical");
  const elevated = summaries.filter((s) => s.risk === "elevated");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <Map className="size-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-foreground">
            Hotspot Prediction
          </h1>
        </div>
        <p className="text-xs text-muted-foreground ml-8">
          KDE-based crime hotspot detection and temporal forecasting across
          Karnataka districts.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
              <span className="ml-2">Computing KDE baselines...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {critical.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider mb-3">
                  <Shield className="size-4" /> Critical Alerts
                </div>
                <div className="space-y-2">
                  {critical.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-card p-3 border border-red-100 text-xs"
                    >
                      <span className="font-semibold text-foreground">
                        {s.district} &bull; {s.crime_type}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        {s.next_7} next 7d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {elevated.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-3">
                  <TrendingUp className="size-4" /> Elevated Risk
                </div>
                <div className="space-y-2">
                  {elevated.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-card p-3 border border-amber-100 text-xs"
                    >
                      <span className="font-semibold text-foreground">
                        {s.district} &bull; {s.crime_type}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {s.next_7} next 7d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {heatmap.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Top Hotspots by Intensity
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    {heatmap.length} cells
                  </span>
                </div>
                <div className="space-y-1.5">
                  {heatmap
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 10)
                    .map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground/80 truncate">
                              {h.lat.toFixed(4)}, {h.long.toFixed(4)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {h.intensity.toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${Math.min(h.intensity * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {h.dominant_crime} &bull; {h.fir_count} FIRs
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {summaries.length === 0 && heatmap.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Map className="size-12 mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">No hotspot data available</p>
                <p className="text-xs mt-1">
                  Forecast models may still be initializing.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
