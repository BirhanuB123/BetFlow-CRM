"use client";

import { useEffect, useState } from "react";
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
      active="Sales report"
    >
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
    </DashboardShell>
  );
}
