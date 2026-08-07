"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { RevenueForecastReport } from "@betflow/shared";

function fmt(val: number | string) {
  return formatCurrency(val);
}

export default function ForecastingPage() {
  const [data, setData] = useState<RevenueForecastReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<RevenueForecastReport>("/reports/forecasting");
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load forecasting report",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const efficiency =
    data && data.totalRawPipeline > 0
      ? Math.round((data.totalWeightedPipeline / data.totalRawPipeline) * 100)
      : 0;

  return (
    <DashboardShell
      title="Revenue Forecasting"
      description="Probability-weighted sales pipeline revenue projections."
      active="Forecasting"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">
          Loading pipeline forecast data…
        </p>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Total Unweighted Pipeline
                </p>
                <Wallet className="size-4 text-zinc-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-900">
                {fmt(data.totalRawPipeline)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Sum of gross value of all active deals
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                  Weighted Revenue Forecast
                </p>
                <TrendingUp className="size-4 text-purple-600" />
              </div>
              <p className="mt-2 text-3xl font-extrabold text-purple-950">
                {fmt(data.totalWeightedPipeline)}
              </p>
              <p className="mt-1 text-xs text-purple-700 font-medium">
                Adjusted by stage win probability
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Pipeline Realization Rate
                </p>
                <BarChart3 className="size-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {efficiency}%
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Probability-weighted yield percentage
              </p>
            </div>
          </div>

          {/* Stage Probability Breakdown Table */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Stage-by-Stage Probability Forecast
                </h2>
                <p className="text-xs text-zinc-500">
                  Expected revenue contribution broken down by deal stage
                  probability weights.
                </p>
              </div>
            </div>

            <CrmTable
              columns={[
                "Pipeline Stage",
                "Win Probability",
                "Active Deals",
                "Gross Pipeline Volume",
                "Weighted Expected Revenue",
                "Contribution %",
              ]}
              rows={data.stages.map((stage) => {
                const percentShare =
                  data.totalWeightedPipeline > 0
                    ? Math.round(
                        (stage.weightedVolume / data.totalWeightedPipeline) *
                          100,
                      )
                    : 0;

                return [
                  <span key="name" className="font-semibold text-zinc-900">
                    {stage.stageName}
                  </span>,
                  <span
                    key="prob"
                    className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800"
                  >
                    {stage.probability}%
                  </span>,
                  stage.dealCount,
                  fmt(stage.rawVolume),
                  <span
                    key="weighted"
                    className="font-extrabold text-purple-900"
                  >
                    {fmt(stage.weightedVolume)}
                  </span>,
                  <div key="bar" className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${percentShare}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-600">
                      {percentShare}%
                    </span>
                  </div>,
                ];
              })}
            />
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
