/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { TrendingUp, BarChart3, Activity, Zap } from "lucide-react";
import { getForecastSummary, getForecast } from "@/services/api";
import { SEED_FORECAST_SUMMARIES, SEED_FORECAST } from "@/lib/seed-data";

export default function TrendsPage() {
  const [summaries, setSummaries] = useState<any[]>(SEED_FORECAST_SUMMARIES);
  const [selected, setSelected] = useState<any>(SEED_FORECAST_SUMMARIES[0]);
  const [forecast, setForecast] = useState<any>(SEED_FORECAST);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getForecastSummary()
      .then((s) => {
        if (Array.isArray(s) && s.length > 0) {
          setSummaries(s);
          setSelected(s[0]);
          handleSelectForecast(s[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectForecast = async (s: any) => {
    setSelected(s);
    try {
      const f = await getForecast(s.crime_type, s.district, 30);
      if (f && f.forecast) setForecast(f);
    } catch {
      setForecast(SEED_FORECAST);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="size-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-foreground">Crime Trends</h1>
        </div>
        <p className="text-xs text-muted-foreground ml-8">
          Temporal forecasts and trend analysis across Karnataka districts.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
              <div className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
              <span className="ml-2">Loading forecast models...</span>
            </div>
          </div>
        ) : summaries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="size-12 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">No trend data available</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Activity className="size-3.5 text-emerald-500" /> District
                Forecast Summary
              </h3>
              <div className="space-y-1">
                {summaries.slice(0, 12).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectForecast(s)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${selected === s ? "bg-emerald-50 border border-emerald-200" : "hover:bg-muted border border-transparent"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground">
                        {s.district}
                      </span>
                      <span className="text-muted-foreground">&bull;</span>
                      <span className="text-muted-foreground">
                        {s.crime_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.risk === "critical" ? "bg-red-100 text-red-700" : s.risk === "elevated" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {s.next_7} next 7d
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {forecast && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Zap className="size-3.5 text-emerald-500" />{" "}
                    {selected?.district} —{" "}
                    {selected?.crime_type?.replace(/_/g, " ")}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    30-day forecast
                  </span>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 rounded-xl bg-muted p-3 border border-border text-center">
                    <p className="text-[10px] text-muted-foreground">
                      Next 7 Days
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {forecast.next_7_days_total}
                    </p>
                  </div>
                  <div className="flex-1 rounded-xl bg-muted p-3 border border-border text-center">
                    <p className="text-[10px] text-muted-foreground">
                      Next 30 Days
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {forecast.next_30_days_total}
                    </p>
                  </div>
                </div>
                {forecast.model_stats && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Model Accuracy
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted p-2 border border-border text-center">
                        <p className="text-[9px] text-muted-foreground">MAPE</p>
                        <p className="text-xs font-bold text-foreground">
                          {forecast.model_stats.mape != null ? (forecast.model_stats.mape * 100).toFixed(1) : "N/A"}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted p-2 border border-border text-center">
                        <p className="text-[9px] text-muted-foreground">MSE</p>
                        <p className="text-xs font-bold text-foreground">
                          {forecast.model_stats.mse != null ? forecast.model_stats.mse.toFixed(2) : "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted p-2 border border-border text-center">
                        <p className="text-[9px] text-muted-foreground">
                          Direction
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {forecast.model_stats.direction_accuracy != null ? (forecast.model_stats.direction_accuracy * 100).toFixed(0) : "N/A"}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {forecast.forecast && forecast.forecast.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Weekly Breakdown
                    </p>
                    <div className="space-y-1">
                      {forecast.forecast
                        .slice(0, 8)
                        .map((w: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 text-xs"
                          >
                            <span className="w-20 text-muted-foreground">
                              {w.week}
                            </span>
                            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min((w.predicted / Math.max(...forecast.forecast.map((x: any) => x.predicted))) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="w-8 text-right font-semibold text-foreground/80">
                              {w.predicted}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
