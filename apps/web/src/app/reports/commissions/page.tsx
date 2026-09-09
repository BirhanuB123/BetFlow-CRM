"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Download,
  Filter,
  Percent,
  Printer,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { exportToCsv, formatExportDualDate } from "@/lib/export";
import { printReportDocument } from "@/lib/print";
import type { CommissionReport, CommissionRecord, CommissionPayoutStatus } from "@betflow/shared";

function fmt(val: number | string) {
  return formatCurrency(val);
}

const STATUS_CONFIG: Record<
  CommissionPayoutStatus,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  PENDING_DOWNPAYMENT: {
    label: "Pending Downpayment",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },

  ELIGIBLE_FOR_PAYOUT: {
    label: "Ready for Payout",
    badgeClass: "bg-info/10 text-info border-info/20",
    icon: CheckCircle2,
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    icon: Percent,
  },
  PAID: {
    label: "Paid Out",
    badgeClass: "bg-success/10 text-success border-success/20",
    icon: Award,
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    icon: Clock,
  },
};

export default function CommissionsReportPage() {
  const [data, setData] = useState<CommissionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<CommissionReport>("/reports/commissions");
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load commission ledger data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRecords = useMemo(() => {
    if (!data?.records) return [];
    const query = searchQuery.trim().toLowerCase();

    return data.records.filter((rec) => {
      if (statusFilter !== "ALL" && rec.status !== statusFilter) {
        return false;
      }
      if (!query) return true;
      return (
        rec.agentName.toLowerCase().includes(query) ||
        rec.customerName.toLowerCase().includes(query) ||
        rec.unitNumber.toLowerCase().includes(query) ||
        rec.contractNumber.toLowerCase().includes(query) ||
        rec.projectName.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    if (!data?.records) return;
    const headers = [
      "Contract Ref",
      "Agent / Broker",
      "Agent Email",
      "Customer",
      "Project",
      "Unit Number",
      "Deal Value (ETB)",
      "Commission Rate (%)",
      "Total Commission (ETB)",
      "Collected Payments (ETB)",
      "Collection Progress (%)",
      "Paid Commission (ETB)",
      "Pending Commission (ETB)",
      "Payout Status",
      "Contract Date (GC / EC)",
    ];

    const rows = filteredRecords.map((r) => [
      r.contractNumber,
      r.agentName,
      r.agentEmail || "N/A",
      r.customerName,
      r.projectName,
      r.unitNumber,
      r.dealValue,
      `${r.commissionRate}%`,
      r.totalCommission,
      r.collectedPaymentAmount,
      `${r.collectionProgressPercent}%`,
      r.paidCommission,
      r.pendingCommission,
      r.status,
      r.contractDateDual || formatExportDualDate(r.contractDate),
    ]);

    exportToCsv({
      filename: `betflow_commission_ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    });
  };

  const handlePrint = () => {
    if (!data?.records) return;
    printReportDocument({
      title: "Agent & Broker Commission Ledger",
      subtitle: `Commercial payouts report • Incurred: ${fmt(data.totalCommissionIncurred)} • Pending: ${fmt(data.totalCommissionPending)}`,
      columns: [
        "Contract Ref",
        "Agent",
        "Customer / Unit",
        "Deal Value",
        "Rate",
        "Commission",
        "Progress",
        "Payout Status",
      ],
      rows: filteredRecords.map((r) => [
        r.contractNumber,
        r.agentName,
        `${r.customerName} (${r.unitNumber})`,
        fmt(r.dealValue),
        `${r.commissionRate}%`,
        fmt(r.totalCommission),
        `${r.collectionProgressPercent}%`,
        STATUS_CONFIG[r.status]?.label || r.status,
      ]),
    });
  };

  return (
    <DashboardShell
      title="Commission Tracking & Brokerage"
      description="Agent commission calculations, milestone payout eligibility, and performance earnings."
      active="Reports"
    >
      <div className="space-y-6">
        {/* Navigation & Action Bar */}
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
              <Coins className="size-4.5 text-primary" />
              <span>Commission & Brokerage Ledger</span>
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
              Export CSV (Dual Date)
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={loading || !data}
              className="h-9 text-xs font-semibold"
            >
              <Printer className="size-3.5 mr-1.5 text-muted-foreground" />
              Print Ledger
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
            Loading commission ledgers and payout analytics…
          </p>
        ) : data ? (
          <>
            {/* KPI Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Commission Incurred
                  </p>
                  <DollarSign className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {fmt(data.totalCommissionIncurred)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across {data.totalDealsCommissioned} active contracts
                </p>
              </div>

              <div className="rounded-xl border border-info/30 bg-info/5 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-info">
                    Ready for Payout
                  </p>
                  <CheckCircle2 className="size-4 text-info" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-info">
                  {fmt(data.totalCommissionPending)}
                </p>
                <p className="mt-1 text-xs text-info/90 font-medium">
                  {data.eligiblePayoutsCount} contract(s) with cleared downpayment
                </p>
              </div>

              <div className="rounded-xl border border-success/30 bg-success/5 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-success">
                    Paid Out Commissions
                  </p>
                  <Award className="size-4 text-success" />
                </div>
                <p className="mt-2 text-2xl font-bold text-success">
                  {fmt(data.totalCommissionPaid)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Disbursed on completed sales
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg Commission Rate
                  </p>
                  <Percent className="size-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {data.averageCommissionRate}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Standard tiered band (1.8% – 2.5%)
                </p>
              </div>
            </div>

            {/* Top Earners Leaderboard */}
            {data.topEarners && data.topEarners.length > 0 && (
              <section className="no-print rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      Top Commission Earners
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sales agents and external brokers ranked by total commission earned.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.topEarners.map((agent, idx) => {
                    const payoutRatio =
                      agent.totalCommissionEarned > 0
                        ? Math.round(
                            (agent.totalCommissionPaid /
                              agent.totalCommissionEarned) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={agent.agentId}
                        className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {agent.agentName}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {agent.dealsCount} deal(s) • Sales: {fmt(agent.totalSalesVolume)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground">Commission:</span>
                          <span className="font-bold text-foreground">
                            {fmt(agent.totalCommissionEarned)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Paid out ({payoutRatio}%)</span>
                            <span className="font-semibold text-info">
                              Pending: {fmt(agent.pendingPayout)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-success rounded-full"
                              style={{ width: `${payoutRatio}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Filter & Search Bar */}
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by agent, customer, unit, or contract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Filter className="size-3.5" /> Filter:
                </span>
                {(
                  [
                    { key: "ALL", label: "All Records" },
                    { key: "ELIGIBLE_FOR_PAYOUT", label: "Ready for Payout" },
                    { key: "PENDING_DOWNPAYMENT", label: "Pending Downpayment" },
                    { key: "PAID", label: "Paid" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === tab.key
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "border border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Commission Ledger Table */}
            <section className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
              <div className="border-b border-border bg-muted/40 p-4">
                <h2 className="text-sm font-bold text-foreground">
                  Commission Itemized Ledger ({filteredRecords.length})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed deal-by-deal commission attribution with real-time milestone payment tracking.
                </p>
              </div>

              {filteredRecords.length === 0 ? (
                <p className="p-8 text-center text-xs text-muted-foreground font-medium">
                  No commission records matching the criteria.
                </p>
              ) : (
                <CrmTable
                  columns={[
                    "Contract & Date",
                    "Agent / Broker",
                    "Customer & Unit",
                    "Deal Value",
                    "Rate",
                    "Earned Commission",
                    "Collected %",
                    "Payout Status",
                  ]}
                  rows={filteredRecords.map((r) => {
                    const statusConf = STATUS_CONFIG[r.status] || {
                      label: r.status,
                      badgeClass: "bg-muted text-foreground border-border",
                      icon: Clock,
                    };
                    const StatusIcon = statusConf.icon;

                    return [
                      <div key="ref" className="space-y-0.5">
                        <span className="font-bold text-foreground text-xs">
                          {r.contractNumber}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {r.contractDateDual || r.contractDate.slice(0, 10)}
                        </p>
                      </div>,
                      <div key="agent" className="space-y-0.5">
                        <span className="font-semibold text-foreground text-xs">
                          {r.agentName}
                        </span>
                        {r.agentEmail && (
                          <p className="text-[11px] text-muted-foreground">
                            {r.agentEmail}
                          </p>
                        )}
                      </div>,
                      <div key="cust" className="space-y-0.5">
                        <span className="font-medium text-foreground text-xs">
                          {r.customerName}
                        </span>
                        <p className="text-[11px] text-primary font-semibold">
                          Unit {r.unitNumber} • {r.projectName}
                        </p>
                      </div>,
                      <span key="val" className="font-semibold text-foreground text-xs">
                        {fmt(r.dealValue)}
                      </span>,
                      <span
                        key="rate"
                        className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground"
                      >
                        {r.commissionRate}%
                      </span>,
                      <div key="comm" className="space-y-0.5">
                        <span className="font-extrabold text-foreground text-xs">
                          {fmt(r.totalCommission)}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Paid: {fmt(r.paidCommission)}
                        </p>
                      </div>,
                      <div key="progress" className="w-24 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                          <span>{r.collectionProgressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${r.collectionProgressPercent}%` }}
                          />
                        </div>
                      </div>,
                      <span
                        key="status"
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusConf.badgeClass}`}
                      >
                        <StatusIcon className="size-3" />
                        {statusConf.label}
                      </span>,
                    ];
                  })}
                />
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
