"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Layers,
  Percent,
  Printer,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { exportToCsv } from "@/lib/export";
import { printReportDocument } from "@/lib/print";
import type { RevenueForecastReport } from "@betflow/shared";

function fmt(val: number | string) {
  return formatCurrency(val);
}

type ForecastScenario = "conservative" | "expected" | "optimistic";

const SCENARIOS: Record<
  ForecastScenario,
  { label: string; multiplier: number; description: string; badgeClass: string }
> = {
  conservative: {
    label: "Conservative (70%)",
    multiplier: 0.7,
    description: "Defers speculative pipeline stages & accounts for 30% collection slippage.",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
  },

  expected: {
    label: "Expected Base (100%)",
    multiplier: 1.0,
    description: "Standard probability-weighted pipeline combined with contractual milestones.",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  optimistic: {
    label: "Optimistic (125%)",
    multiplier: 1.25,
    description: "Accelerated sales velocity and high close rates on active negotiations.",
    badgeClass: "bg-success/10 text-success border-success/20",
  },
};

export default function ForecastingPage() {
  const [data, setData] = useState<RevenueForecastReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ForecastScenario>("expected");

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

  const activeScenarioConfig = SCENARIOS[scenario];

  const efficiency =
    data && data.totalRawPipeline > 0
      ? Math.round((data.totalWeightedPipeline / data.totalRawPipeline) * 100)
      : 0;

  const dynamicProjected12MonthCashIn = useMemo(() => {
    if (!data?.monthlyCashFlowForecast) return 0;
    return data.monthlyCashFlowForecast.reduce((sum, m) => {
      if (scenario === "conservative") return sum + m.conservativeScenario;
      if (scenario === "optimistic") return sum + m.optimisticScenario;
      return sum + m.expectedScenario;
    }, 0);
  }, [data, scenario]);

  const chartData = useMemo(() => {
    if (!data?.monthlyCashFlowForecast) return [];
    return data.monthlyCashFlowForecast.map((m) => {
      const projected =
        scenario === "conservative"
          ? m.conservativeScenario
          : scenario === "optimistic"
          ? m.optimisticScenario
          : m.expectedScenario;

      return {
        month: m.gregorianLabel,
        ethiopian: m.ethiopianLabel,
        "Confirmed Receivables": m.scheduledReceivables,
        "Pipeline Forecast": m.weightedPipelineInflow,
        "Total Projected Cash-In": projected,
      };
    });
  }, [data, scenario]);

  const handleExportCSV = () => {
    if (!data) return;

    // 1. Export 12-Month Forward Cash Flow
    const headers = [
      "Period (Gregorian)",
      "Period (Ethiopian Calendar ዓ.ም)",
      "Scheduled Contract Receivables (ETB)",
      "Weighted Pipeline Inflow (ETB)",
      "Conservative Scenario 70% (ETB)",
      "Expected Base Scenario 100% (ETB)",
      "Optimistic Scenario 125% (ETB)",
    ];

    const rows = (data.monthlyCashFlowForecast || []).map((m) => [
      m.gregorianLabel,
      m.ethiopianLabel,
      m.scheduledReceivables,
      m.weightedPipelineInflow,
      m.conservativeScenario,
      m.expectedScenario,
      m.optimisticScenario,
    ]);

    exportToCsv({
      filename: `betflow_financial_forecast_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    });
  };

  const handlePrint = () => {
    if (!data) return;
    printReportDocument({
      title: "12-Month Financial Revenue & Cash Flow Forecast",
      subtitle: `Pipeline Weighted Volume: ${fmt(data.totalWeightedPipeline)} • 12-Month Forward Projection: ${fmt(dynamicProjected12MonthCashIn)} (${activeScenarioConfig.label})`,
      columns: [
        "Period (GC)",
        "Period (EC ዓ.ም)",
        "Receivables",
        "Pipeline Inflow",
        "Projected Inflow",
      ],
      rows: (data.monthlyCashFlowForecast || []).map((m) => [
        m.gregorianLabel,
        m.ethiopianLabel,
        fmt(m.scheduledReceivables),
        fmt(m.weightedPipelineInflow),
        fmt(
          scenario === "conservative"
            ? m.conservativeScenario
            : scenario === "optimistic"
            ? m.optimisticScenario
            : m.expectedScenario,
        ),
      ]),
    });
  };

  return (
    <DashboardShell
      title="Financial Forecasting & Cash Flow"
      description="Probability-weighted sales pipeline projections & 12-month forward cash flow modeling."
      active="Forecasting"
    >
      <div className="space-y-6">
        {/* Navigation & Header Actions */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-primary" />
              <span>Back to Reports</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <TrendingUp className="size-4.5 text-primary" />
              <span>Revenue Forecast & Dual-Calendar Cash Flow</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={loading || !data}
              className="h-9 text-xs font-semibold"
            >
              <Download className="size-3.5 mr-1.5 text-primary" />
              Export Forecast CSV
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={loading || !data}
              className="h-9 text-xs font-semibold"
            >
              <Printer className="size-3.5 mr-1.5 text-muted-foreground" />
              Print Forecast
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-8 text-center text-xs text-muted-foreground font-medium">
            Loading revenue forecast & cash flow scenario models…
          </p>
        ) : data ? (
          <div className="space-y-6">
            {/* Scenario Stress-Testing Selector */}
            <section className="no-print rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Forecast Scenario Stress Testing
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeScenarioConfig.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(Object.keys(SCENARIOS) as ForecastScenario[]).map((key) => {
                    const sc = SCENARIOS[key];
                    const isActive = scenario === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setScenario(key)}
                        className={`h-8 rounded-lg px-3 text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-2xs scale-102"
                            : "border border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Summary Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Gross Pipeline
                  </p>
                  <Wallet className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {fmt(data.totalRawPipeline)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sum of all active deals in CRM
                </p>
              </div>

              <div className="rounded-xl border border-info/30 bg-info/5 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-info">
                    Weighted Pipeline Value
                  </p>
                  <TrendingUp className="size-4 text-info" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-info">
                  {fmt(data.totalWeightedPipeline)}
                </p>
                <p className="mt-1 text-xs text-info/90 font-medium">
                  {efficiency}% pipeline realization yield
                </p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    12-Month Forward Cash-In
                  </p>
                  <DollarSign className="size-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-primary">
                  {fmt(dynamicProjected12MonthCashIn)}
                </p>
                <p className="mt-1 text-xs text-primary/90 font-medium">
                  Receivables + {activeScenarioConfig.label} Inflow
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirmed Milestone Receivables
                  </p>
                  <Calendar className="size-4 text-success" />
                </div>
                <p className="mt-2 text-2xl font-bold text-success">
                  {fmt(data.totalScheduledReceivables || 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Active contract milestone schedules
                </p>
              </div>
            </div>

            {/* 12-Month Forward Cash Flow Inflow Chart */}
            {chartData.length > 0 && (
              <section className="no-print rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <BarChart3 className="size-4 text-primary" />
                      12-Month Forward Cash Inflow Projections (Dual Calendar)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Combines scheduled contractual milestones with probability-weighted pipeline closings across both Gregorian & Ethiopian Calendar (ዓ.ም) horizons.
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center self-start sm:self-auto rounded-full border px-2.5 py-0.5 text-xs font-bold ${activeScenarioConfig.badgeClass}`}
                  >
                    Scenario: {activeScenarioConfig.label}
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        className="text-muted-foreground"
                        tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value) || 0),
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                      <Bar
                        dataKey="Confirmed Receivables"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Pipeline Forecast"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* 12-Month Cash Inflow Table */}
            {data.monthlyCashFlowForecast && data.monthlyCashFlowForecast.length > 0 && (
              <section className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
                <div className="border-b border-border bg-muted/40 p-4">
                  <h2 className="text-sm font-bold text-foreground">
                    Monthly Cash Flow Forecast Ledger
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Forward 12-month expected cash inflow schedule with dual Ethiopian Calendar (ዓ.ም) conversion.
                  </p>
                </div>

                <CrmTable
                  columns={[
                    "Period (GC)",
                    "Period (Ethiopian EC)",
                    "Scheduled Receivables",
                    "Weighted Pipeline Inflow",
                    `Projected Cash-In (${activeScenarioConfig.label})`,
                  ]}
                  rows={data.monthlyCashFlowForecast.map((m) => {
                    const projected =
                      scenario === "conservative"
                        ? m.conservativeScenario
                        : scenario === "optimistic"
                        ? m.optimisticScenario
                        : m.expectedScenario;

                    return [
                      <span key="gc" className="font-bold text-foreground text-xs">
                        {m.gregorianLabel}
                      </span>,
                      <span key="ec" className="font-semibold text-primary text-xs">
                        {m.ethiopianLabel}
                      </span>,
                      <span key="rec" className="font-medium text-success text-xs">
                        {fmt(m.scheduledReceivables)}
                      </span>,
                      <span key="pipe" className="font-medium text-info text-xs">
                        {fmt(m.weightedPipelineInflow)}
                      </span>,
                      <span key="proj" className="font-extrabold text-foreground text-xs">
                        {fmt(projected)}
                      </span>,
                    ];
                  })}
                />
              </section>
            )}

            {/* Stage Probability Breakdown Table */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    Stage-by-Stage Pipeline Probability Breakdown
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expected revenue contribution broken down by deal stage probability weights.
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
                    <span key="name" className="font-semibold text-foreground text-xs">
                      {stage.stageName}
                    </span>,
                    <span
                      key="prob"
                      className="inline-flex rounded-full bg-info/10 text-info border border-info/20 px-2.5 py-0.5 text-xs font-bold"
                    >
                      {stage.probability}%
                    </span>,
                    stage.dealCount,
                    fmt(stage.rawVolume),
                    <span
                      key="weighted"
                      className="font-extrabold text-info text-xs"
                    >
                      {fmt(stage.weightedVolume)}
                    </span>,
                    <div key="bar" className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentShare}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {percentShare}%
                      </span>
                    </div>,
                  ];
                })}
              />
            </section>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
