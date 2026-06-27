/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useTheme } from "next-themes";
import { Settings, Globe, Shield, Database, Sliders } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [config, setConfig] = useState({
    temperature: 0.3,
    maxResults: 10,
    confidenceThreshold: 0.6,
    enableRealtimeAlerts: true,
    enableAutoForecasting: true,
    enableGraphTraversal: true,
    language: "en",
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <Settings className="size-5 text-emerald-600" />
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-xs text-muted-foreground ml-8">
          System configuration and engine parameters.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-2xl">
          <Section icon={Sliders} title="Engine Parameters">
            <Field label="Temperature" desc="Randomness in NLU generation">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    temperature: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-bold text-muted-foreground w-8 text-right">
                {config.temperature.toFixed(2)}
              </span>
            </Field>
            <Field label="Max Results" desc="Max search results per query">
              <input
                type="range"
                min="1"
                max="50"
                value={config.maxResults}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    maxResults: parseInt(e.target.value),
                  }))
                }
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-bold text-muted-foreground w-8 text-right">
                {config.maxResults}
              </span>
            </Field>
            <Field
              label="Confidence Threshold"
              desc="Minimum score for alert triggers"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.confidenceThreshold}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    confidenceThreshold: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-bold text-muted-foreground w-8 text-right">
                {config.confidenceThreshold.toFixed(2)}
              </span>
            </Field>
          </Section>

          <Section icon={Database} title="Engines">
            <Toggle
              label="Real-time Alert Engine"
              value={config.enableRealtimeAlerts}
              onChange={(v) =>
                setConfig((c) => ({ ...c, enableRealtimeAlerts: v }))
              }
            />
            <Toggle
              label="Auto Forecasting"
              value={config.enableAutoForecasting}
              onChange={(v) =>
                setConfig((c) => ({ ...c, enableAutoForecasting: v }))
              }
            />
            <Toggle
              label="Graph Traversal"
              value={config.enableGraphTraversal}
              onChange={(v) =>
                setConfig((c) => ({ ...c, enableGraphTraversal: v }))
              }
            />
          </Section>

          <Section icon={Globe} title="Preferences">
            <Field label="Language" desc="NLU output language">
              <select
                value={config.language}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, language: e.target.value }))
                }
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 outline-none focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="kn">Kannada</option>
                <option value="mixed">Code-Mixed</option>
              </select>
            </Field>
            <Field label="Theme" desc="Dashboard appearance">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 outline-none focus:border-emerald-500"
              >
                <option value="dark">Dark Emerald</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </Field>
          </Section>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-4 text-emerald-500" />
              <span>
                Changes are saved locally for this session.{" "}
                <span className="text-muted-foreground">
                  Catalyst persistence coming soon.
                </span>
              </span>
            </div>
            <button className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="size-4 text-emerald-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground/80">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-foreground/80">{label}</p>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? "bg-emerald-600" : "bg-muted"}`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-card shadow-sm transition-transform ${value ? "translate-x-4" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
