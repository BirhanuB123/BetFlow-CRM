"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";

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
        setError(err instanceof Error ? err.message : "Failed to load revenue report");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <DashboardShell
      title="Revenue report"
      description="Booked, collected, outstanding, and forecast revenue."
      active="Revenue"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Revenue by period</h2>
          <p className="text-sm text-zinc-500">Monthly commercial outlook from reservations and contracts.</p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading revenue data…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">No revenue data available yet.</p>
        ) : (
          <CrmTable
            columns={["Period", "Booked", "Collected", "Outstanding", "Forecast"]}
            rows={rows.map((row) => [
              <span key="period" className="font-medium">{row.period}</span>,
              row.booked,
              row.collected,
              row.outstanding,
              row.forecast,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
