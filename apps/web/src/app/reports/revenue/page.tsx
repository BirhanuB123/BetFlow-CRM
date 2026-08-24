"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Download, Printer, DollarSign, ArrowLeft, TrendingUp } from "lucide-react";
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
import { printReportDocument } from "@/lib/print";

type RevenueRow = {
  period: string;
  booked: string;
  collected: string;
  outstanding: string;
  forecast: string;
};

export default function RevenueReportPage() {
  const [rows, setRows] = useState<RevenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<RevenueRow[]>("/reports/revenue");
        setRows(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load revenue report",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const parseVal = (str: string) =>
    parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;

  const chartData = useMemo(() => {
    return rows.map((r) => ({
      period: r.period,
      Booked: parseVal(r.booked),
      Collected: parseVal(r.collected),
      Outstanding: parseVal(r.outstanding),
      Forecast: parseVal(r.forecast),
    }));
  }, [rows]);

  const handleExportCSV = () => {
    const headers = [
      "Period",
      "Booked",
      "Collected",
      "Outstanding",
      "Forecast",
    ];
    const csvRows = rows.map((r) => [
      `"${r.period}"`,
      `"${r.booked}"`,
      `"${r.collected}"`,
      `"${r.outstanding}"`,
      `"${r.forecast}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `betflow_revenue_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    printReportDocument({
      title: "Commercial Revenue Outlook Report",
      subtitle:
        "Monthly breakdown of booked revenue, collected payments, outstanding balances, and growth forecasts.",
      columns: [
        "Period",
        "Booked Revenue",
        "Collected Payments",
        "Outstanding Balance",
        "Growth Forecast",
      ],
      rows: rows.map((r) => [
        r.period,
        r.booked,
        r.collected,
        r.outstanding,
        r.forecast,
      ]),
    });
  };

  return (
    <DashboardShell
      title="Revenue Report"
      description="Booked, collected, outstanding, and forecast revenue breakdown."
      active="Reports"
    >
      <div className="space-y-6">
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#233b66] transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-[#233b66]" />
              <span>Back to Reports</span>
            </Link>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <DollarSign className="size-4.5 text-primary" />
              <span>Commercial Revenue Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Download className="size-3.5 mr-1.5 text-primary" />
              Export CSV
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Printer className="size-3.5 mr-1.5 text-slate-500" />
              Print Report
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        {/* Recharts Time-Series Visualization */}
        {!loading && chartData.length > 0 && (
          <section className="no-print rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Time-Series Revenue Trends
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual comparison of booked revenue, collected payments, outstanding balances, and growth forecasts per period.
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value) || 0), "Amount"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                  <Bar dataKey="Booked" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Forecast" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/70 p-4">
            <h2 className="text-sm font-bold text-slate-900">
              Revenue by Period
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly commercial outlook from reservations and contracts.
            </p>
          </div>
          {loading ? (
            <p className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading revenue data…
            </p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500 font-medium">
              No revenue data available yet.
            </p>
          ) : (
            <CrmTable
              columns={[
                "Period",
                "Booked",
                "Collected",
                "Outstanding",
                "Forecast",
              ]}
              rows={rows.map((row) => [
                <span key="period" className="font-bold text-slate-800">
                  {row.period}
                </span>,
                <span key="booked" className="font-semibold text-primary">
                  {row.booked}
                </span>,
                <span
                  key="collected"
                  className="font-semibold text-success"
                >
                  {row.collected}
                </span>,
                <span
                  key="outstanding"
                  className="font-semibold text-warning"
                >
                  {row.outstanding}
                </span>,
                <span key="forecast" className="font-semibold text-slate-600">
                  {row.forecast}
                </span>,
              ])}
            />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
