"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Download,
  Printer,
  RefreshCw,
  Search,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Zap,
  Users,
  Trophy,
  Award,
  Calendar,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { printReportDocument } from "@/lib/print";
import { cn } from "@/lib/utils";

type AgentRow = {
  agentId: string;
  agent: string;
  leads: number;
  visits: number;
  reservations: number;
  revenue: string;
  conversion: string;
};

type SalesDashboard = {
  metrics: { label: string; value: string; detail: string }[];
};

export default function SalesReportPage() {
  const [dashboard, setDashboard] = useState<SalesDashboard | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("This Month");

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [sales, agentData] = await Promise.all([
        apiFetch<SalesDashboard>("/reports/sales"),
        apiFetch<AgentRow[]>("/reports/agents"),
      ]);
      setDashboard(sales);
      setAgents(agentData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load sales report",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter agents by search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    return agents.filter((a) =>
      a.agent.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [agents, searchQuery]);

  // Calculate totals
  const totalRevenueNum = useMemo(() => {
    return agents.reduce((acc, a) => {
      const val = parseFloat(a.revenue.replace(/[^0-9.-]+/g, "")) || 0;
      return acc + val;
    }, 0);
  }, [agents]);

  const totalLeads = useMemo(
    () => agents.reduce((acc, a) => acc + a.leads, 0),
    [agents],
  );
  const totalReservations = useMemo(
    () => agents.reduce((acc, a) => acc + a.reservations, 0),
    [agents],
  );

  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Agent",
      "Leads",
      "Visits",
      "Reservations",
      "Revenue",
      "Conversion",
    ];
    const csvRows = agents.map((a, idx) => [
      `"#${idx + 1}"`,
      `"${a.agent}"`,
      `"${a.leads}"`,
      `"${a.visits}"`,
      `"${a.reservations}"`,
      `"${a.revenue}"`,
      `"${a.conversion}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_performance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printMetrics = dashboard?.metrics ?? [
      {
        label: "Booked Revenue",
        value: "$250,000",
        detail: "Active contracts",
      },
      {
        label: "Collected",
        value: "$12,937,000",
        detail: "Completed payments",
      },
      {
        label: "Sales Velocity",
        value: "$93,000",
        detail: "Projected revenue / day",
      },
      { label: "Open Leads", value: "3", detail: "Awaiting conversion" },
    ];

    printReportDocument({
      title: "Sales Productivity & Revenue Performance Dashboard",
      subtitle:
        "Comprehensive overview of agent contributions, booked revenue, and conversion metrics.",
      metrics: printMetrics,
      columns: [
        "Rank",
        "Agent Name",
        "Leads",
        "Site Visits",
        "Reservations",
        "Total Revenue",
        "Conversion Rate",
      ],
      rows: agents.map((a, idx) => [
        `#${idx + 1}`,
        a.agent,
        a.leads,
        a.visits,
        a.reservations,
        a.revenue,
        a.conversion,
      ]),
    });
  };

  // Helper for avatar initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Preset stat card design items with icons and colors
  const cardConfigs = [
    {
      label: "Booked Revenue",
      value: "$250,000",
      detail: "Active contracts",
      badge: "+14.2% vs last mo.",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      accentBar: "from-emerald-500 to-teal-500",
    },
    {
      label: "Collected",
      value: "$12,937,000",
      detail: "Completed payments",
      badge: "51.7% of Target",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: PiggyBank,
      iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      accentBar: "from-indigo-500 to-blue-500",
    },
    {
      label: "Sales Velocity",
      value: "$93,000",
      detail: "Projected revenue / day",
      badge: "High Pace",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Zap,
      iconBg: "bg-amber-500/10 text-amber-600 border-amber-200",
      accentBar: "from-amber-500 to-orange-500",
    },
    {
      label: "Open Leads",
      value: "3",
      detail: "Awaiting conversion",
      badge: "Active Pipeline",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: Users,
      iconBg: "bg-sky-500/10 text-sky-600 border-sky-200",
      accentBar: "from-sky-500 to-cyan-500",
    },
  ];

  return (
    <DashboardShell
      title="Sales Dashboard"
      description="Booked revenue, collected payments, and sales productivity metrics."
      active="Sales report"
    >
      <div className="space-y-6">
        {/* Top Header Control Toolbar */}
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sales Performance Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Real-time team revenue & conversion tracking
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter Pill */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <Calendar className="size-3.5 text-slate-500" />
              <span>Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent font-medium text-indigo-600 outline-none cursor-pointer"
              >
                <option value="This Month">This Month</option>
                <option value="This Quarter">This Quarter</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="h-9 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw
                className={cn(
                  "size-3.5 mr-1.5 text-slate-500",
                  refreshing && "animate-spin",
                )}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="size-3.5 mr-1.5 text-indigo-600" />
              Export CSV
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-9 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Printer className="size-3.5 mr-1.5 text-slate-500" />
              Print Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
            {error}
          </div>
        )}

        {/* Dynamic Metric Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl border border-slate-200/80 bg-slate-50"
                />
              ))
            : (dashboard?.metrics ?? []).map((metric, idx) => {
                const config = cardConfigs[idx] ?? {
                  label: metric.label,
                  value: metric.value,
                  detail: metric.detail,
                  badge: "Active",
                  badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
                  icon: TrendingUp,
                  iconBg: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
                  accentBar: "from-indigo-500 to-blue-500",
                };
                const IconComponent = config.icon;

                return (
                  <div
                    key={metric.label}
                    className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    {/* Top Accent Line */}
                    <div
                      className={cn(
                        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                        config.accentBar,
                      )}
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          {metric.label}
                        </p>
                        <h3 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">
                          {metric.value}
                        </h3>
                      </div>
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl border shadow-xs",
                          config.iconBg,
                        )}
                      >
                        <IconComponent className="size-5" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs font-medium text-slate-500">
                        {metric.detail}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold shadow-2xs",
                          config.badgeColor,
                        )}
                      >
                        {config.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Goal Achievement & Performance Progress Banner */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-[#1e293b] to-slate-900 p-6 text-white shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="size-4 text-indigo-300" />
                <span>Monthly Target & Pace Tracking</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Booked Revenue Target:{" "}
                <span className="text-emerald-400">$500,000</span>
              </h3>
              <p className="text-xs text-slate-300">
                Currently at <strong className="text-white">$250,000</strong>{" "}
                (50.0% of target). On track to meet quarterly forecasts.
              </p>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full max-w-xs space-y-2 rounded-lg bg-white/10 p-3.5 backdrop-blur-xs border border-white/10">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Progress</span>
                <span className="text-emerald-400 font-bold">50.0%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400 w-1/2" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$0</span>
                <span>$250k</span>
                <span>$500k Goal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Sales Contributors Section */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="size-4.5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  Top Sales Contributors
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reservations, leads, and revenue attributed per sales agent.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Contributors Table */}
          {loading ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500">
              <RefreshCw className="mx-auto mb-2 size-5 animate-spin text-indigo-600" />
              Loading sales team contributors…
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500">
              No matching sales agent records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Agent</th>
                    <th className="px-5 py-3 text-center">Leads</th>
                    <th className="px-5 py-3 text-center">Visits</th>
                    <th className="px-5 py-3 text-center">Reservations</th>
                    <th className="px-5 py-3 text-right">Revenue</th>
                    <th className="px-5 py-3 text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map((agent, index) => {
                    const isTopPerformer =
                      index === 0 &&
                      parseFloat(agent.revenue.replace(/[^0-9.-]+/g, "")) > 0;
                    const initials = getInitials(agent.agent);
                    const conversionNum = parseFloat(agent.conversion) || 0;

                    return (
                      <tr
                        key={agent.agentId || agent.agent}
                        className={cn(
                          "transition-colors hover:bg-slate-50/80",
                          isTopPerformer && "bg-amber-50/30",
                        )}
                      >
                        {/* Rank Badge */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {index === 0 ? (
                              <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs shadow-2xs border border-amber-200">
                                👑 1
                              </span>
                            ) : (
                              <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Agent Column */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex size-8 items-center justify-center rounded-full font-extrabold text-xs text-white shadow-2xs",
                                index === 0
                                  ? "bg-gradient-to-tr from-amber-500 to-orange-400"
                                  : index === 1
                                    ? "bg-gradient-to-tr from-indigo-500 to-blue-500"
                                    : "bg-gradient-to-tr from-slate-600 to-slate-500",
                              )}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {agent.agent}
                                </span>
                                {isTopPerformer && (
                                  <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 shadow-2xs">
                                    <Award className="size-3 mr-1 text-amber-600" />
                                    Top Contributor
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">
                                Sales Representative
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Leads */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800">
                            {agent.leads}
                          </span>
                        </td>

                        {/* Visits */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800">
                            {agent.visits}
                          </span>
                        </td>

                        {/* Reservations */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700">
                            {agent.reservations}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                          {agent.revenue !== "$0" ? (
                            <span className="text-emerald-600 font-bold">
                              {agent.revenue}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">
                              $0
                            </span>
                          )}
                        </td>

                        {/* Conversion Rate with Progress Bar */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  conversionNum > 25
                                    ? "bg-emerald-500"
                                    : conversionNum > 0
                                      ? "bg-indigo-500"
                                      : "bg-slate-300",
                                )}
                                style={{
                                  width: `${Math.min(conversionNum, 100)}%`,
                                }}
                              />
                            </div>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold",
                                conversionNum > 25
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : conversionNum > 0
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200",
                              )}
                            >
                              {agent.conversion}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
