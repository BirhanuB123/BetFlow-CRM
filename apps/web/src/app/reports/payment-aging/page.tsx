"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
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
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load payment aging report",
        );
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
              <Clock className="size-4 text-amber-600" />
              <span>Payment Aging & Risk Analytics</span>
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
          <h2 className="text-base font-semibold">Aging buckets</h2>
          <p className="text-sm text-zinc-500">
            Overdue and upcoming receivables risk view.
          </p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading aging data…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">
            No pending payment schedules found.
          </p>
        ) : (
          <CrmTable
            columns={["Bucket", "Invoices", "Amount", "Risk"]}
            rows={rows.map((row) => [
              <span key="bucket" className="font-medium">
                {row.bucket}
              </span>,
              row.invoices,
              row.amount,
              <span
                key="risk"
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  riskClass[row.risk] ?? "bg-zinc-100 text-zinc-700",
                )}
              >
                {row.risk}
              </span>,
            ])}
          />
        )}
      </section>
      </div>
    </DashboardShell>
  );
}
