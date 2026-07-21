"use client";

import { useEffect, useState } from "react";
import { Check, RotateCw, ToggleLeft, ToggleRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";

type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: "Tenant" | "Plan" | "Beta cohort";
  rollout: string;
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<FeatureFlag[]>("/saas/feature-flags");
      setFlags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFlags();
  }, []);

  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    setTogglingKey(key);
    setError(null);
    try {
      const updated = await apiFetch<FeatureFlag>(`/saas/feature-flags/${key}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
      showSuccess(`Feature flag '${updated.label}' ${updated.enabled ? "enabled" : "disabled"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle feature flag");
    } finally {
      setTogglingKey(null);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const enabledCount = flags.filter((flag) => flag.enabled).length;
  const betaCount = flags.filter((flag) => flag.scope === "Beta cohort").length;
  const planGatedCount = flags.filter((flag) => flag.scope === "Plan").length;

  return (
    <DashboardShell
      title="Feature flags"
      description="Tenant-scoped feature rollout controls for SaaS capabilities."
      active="Feature flags"
    >
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard label="Enabled flags" value={`${enabledCount}/${flags.length}`} detail="Tenant-visible capabilities" />
        <StatCard label="Beta controls" value={String(betaCount)} detail="Limited cohort rollout" />
        <StatCard label="Plan-gated" value={String(planGatedCount)} detail="Managed by subscription tier" />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          <Check className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Flags</h2>
            <p className="text-sm text-zinc-500">Enable, disable, and stage tenant-level product modules.</p>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading feature flags…</p>
        ) : (
          <CrmTable
            columns={["Feature", "Description", "Scope", "Rollout", "State"]}
            rows={flags.map((flag) => [
              <span key="label" className="font-medium">{flag.label}</span>,
              flag.description,
              flag.scope,
              flag.rollout,
              <button
                key="state"
                type="button"
                className="flex items-center gap-1.5 focus:outline-none transition active:scale-95 disabled:pointer-events-none"
                onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                disabled={togglingKey === flag.key}
              >
                {togglingKey === flag.key ? (
                  <RotateCw className="size-5 animate-spin text-zinc-400" />
                ) : flag.enabled ? (
                  <ToggleRight className="size-7 text-emerald-600" />
                ) : (
                  <ToggleLeft className="size-7 text-zinc-400" />
                )}
                <span className={`text-xs font-semibold uppercase ${flag.enabled ? "text-emerald-700" : "text-zinc-600"}`}>
                  {flag.enabled ? "Enabled" : "Disabled"}
                </span>
              </button>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
