"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Printer,
  Building2,
  Package,
  CheckCircle2,
  BookmarkCheck,
  DollarSign,
  Ban,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { printReportDocument } from "@/lib/print";

type InventoryRow = {
  project: string;
  totalUnits: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
};

export default function InventoryReportPage() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<InventoryRow[]>("/reports/inventory");
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load inventory report.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalAll = data.reduce((acc, r) => acc + r.totalUnits, 0);
  const totalAvailable = data.reduce((acc, r) => acc + r.available, 0);
  const totalReserved = data.reduce((acc, r) => acc + r.reserved, 0);
  const totalSold = data.reduce((acc, r) => acc + r.sold, 0);

  const handleExportCSV = () => {
    const headers = [
      "Project",
      "Total Units",
      "Available",
      "Reserved",
      "Sold",
      "Blocked",
    ];
    const rows = data.map((r) => [
      `"${r.project}"`,
      r.totalUnits,
      r.available,
      r.reserved,
      r.sold,
      r.blocked,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `betflow_inventory_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    printReportDocument({
      title: "Real Estate Inventory Position Report",
      subtitle:
        "Unit availability, active reservations, sold units, and blocked stock across development projects.",
      metrics: [
        {
          label: "Total Units",
          value: totalAll,
          detail: "Across all developments",
        },
        {
          label: "Available Stock",
          value: totalAvailable,
          detail: "Ready for reservation",
        },
        {
          label: "Reserved Holds",
          value: totalReserved,
          detail: "Pending deposit payment",
        },
        {
          label: "Sold Units",
          value: totalSold,
          detail: "Contracted & closed",
        },
      ],
      columns: [
        "Project Name",
        "Total Units",
        "Available",
        "Reserved",
        "Sold",
        "Blocked",
        "Occupancy %",
      ],
      rows: data.map((r) => [
        r.project,
        r.totalUnits,
        r.available,
        r.reserved,
        r.sold,
        r.blocked,
        `${r.totalUnits > 0 ? Math.round((r.sold / r.totalUnits) * 100) : 0}%`,
      ]),
    });
  };

  return (
    <DashboardShell
      title="Real Estate Inventory Position Report"
      description="Unit availability, active reservations, sold units, and blocked stock across development projects."
      active="Reports"
    >
      <div className="space-y-6">
        {/* Printable Document Header (visible only when printing) */}
        <div className="hidden print-only mb-6 border-b border-slate-300 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                BetFlow CRM — Real Estate Inventory Position Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Generated on{" "}
                {new Date().toLocaleDateString(undefined, {
                  dateStyle: "full",
                })}{" "}
                | Confidential Executive Report
              </p>
            </div>
            <div className="text-right text-xs font-semibold text-indigo-700">
              BetFlow System Report
            </div>
          </div>
        </div>

        {/* Export & Action Toolbar */}
        <div className="no-print flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Building2 className="size-4.5 text-indigo-600" />
            <span>Project Inventory Analytics</span>
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

        {/* Top Summary Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Units
              </p>
              <Package className="size-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalAll}</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Across all developments
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available Stock
              </p>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {totalAvailable}
            </p>
            <p className="mt-1 text-xs text-emerald-700 font-medium">
              Ready for reservation
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reserved Holds
              </p>
              <BookmarkCheck className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {totalReserved}
            </p>
            <p className="mt-1 text-xs text-amber-700 font-medium">
              Pending deposit payment
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sold Units
              </p>
              <DollarSign className="size-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {totalSold}
            </p>
            <p className="mt-1 text-xs text-indigo-700 font-medium">
              Contracted & closed
            </p>
          </div>
        </div>

        {/* Inventory Breakdown Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/70 p-4">
            <h2 className="text-sm font-bold text-slate-900">
              Inventory Status by Project
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live stock status breakdown across all residential and commercial
              projects.
            </p>
          </div>

          {error && (
            <p className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading inventory position…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Project Name</th>
                    <th className="px-5 py-3">Total Units</th>
                    <th className="px-5 py-3">Available</th>
                    <th className="px-5 py-3">Reserved</th>
                    <th className="px-5 py-3">Sold</th>
                    <th className="px-5 py-3">Blocked</th>
                    <th className="px-5 py-3 text-right">Occupancy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row, idx) => {
                    const soldPercent =
                      row.totalUnits > 0
                        ? Math.round((row.sold / row.totalUnits) * 100)
                        : 0;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3 font-bold text-slate-800 flex items-center gap-2">
                          <Building2 className="size-4 text-indigo-500" />
                          {row.project}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-700">
                          {row.totalUnits}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            {row.available}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-700">
                            {row.reserved}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                            {row.sold}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 font-medium">
                          {row.blocked}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${soldPercent}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700 w-10">
                              {soldPercent}%
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
