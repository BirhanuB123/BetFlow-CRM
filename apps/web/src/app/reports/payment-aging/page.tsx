"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type AgingRow = {
  bucket: string;
  invoices: number;
  amount: string;
  risk: string;
};

const riskClass: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-800",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

export default function PaymentAgingReportPage() {
  const [rows, setRows] = useState<AgingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<AgingRow[]>("/reports/payment-aging");
        setRows(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment aging report");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <DashboardShell
      title="Payment aging report"
      description="Outstanding payment exposure by aging bucket."
      active="Revenue"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Aging buckets</h2>
          <p className="text-sm text-zinc-500">Overdue and upcoming receivables risk view.</p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading aging data…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">No pending payment schedules found.</p>
        ) : (
          <CrmTable
            columns={["Bucket", "Invoices", "Amount", "Risk"]}
            rows={rows.map((row) => [
              <span key="bucket" className="font-medium">{row.bucket}</span>,
              row.invoices,
              row.amount,
              <span key="risk" className={cn("rounded-md px-2 py-1 text-xs font-medium", riskClass[row.risk] ?? "bg-zinc-100 text-zinc-700")}>
                {row.risk}
              </span>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
