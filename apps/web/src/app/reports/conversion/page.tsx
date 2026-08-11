"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";

type FunnelRow = {
  stage: string;
  count: number;
  rate: string;
  dropOff: string;
};

export default function ConversionReportPage() {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<FunnelRow[]>("/reports/conversion");
        setRows(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load conversion funnel",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <DashboardShell
      title="Conversion report"
      description="Lead funnel conversion from capture through contract signature."
      active="Reports"
    >
      <div className="space-y-6">
        <div className="no-print flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
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
              <Filter className="size-4 text-indigo-600" />
              <span>Lead Conversion Analytics</span>
            </div>
          </div>
        </div>
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Conversion funnel</h2>
          <p className="text-sm text-zinc-500">
            Stage progression and drop-off rates.
          </p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading funnel data…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">
            No funnel data available yet.
          </p>
        ) : (
          <CrmTable
            columns={["Stage", "Count", "Rate", "Drop-off"]}
            rows={rows.map((row) => [
              <span key="stage" className="font-medium">
                {row.stage}
              </span>,
              row.count,
              row.rate,
              row.dropOff,
            ])}
          />
        )}
      </section>
      </div>
    </DashboardShell>
  );
}
