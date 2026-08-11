"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Printer, DollarSign, ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
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
              <DollarSign className="size-4.5 text-indigo-600" />
              <span>Commercial Revenue Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Download className="size-3.5 mr-1.5 text-indigo-600" />
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
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </p>
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
                <span key="booked" className="font-semibold text-indigo-600">
                  {row.booked}
                </span>,
                <span
                  key="collected"
                  className="font-semibold text-emerald-600"
                >
                  {row.collected}
                </span>,
                <span
                  key="outstanding"
                  className="font-semibold text-amber-600"
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
