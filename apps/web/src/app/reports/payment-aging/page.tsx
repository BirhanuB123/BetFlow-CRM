"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Download, Printer } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { exportToCsv } from "@/lib/export";
import { printReportDocument } from "@/lib/print";
import { cn } from "@/lib/utils";

type AgingRow = {
  bucket: string;
  invoices: number;
  amount: string;
  risk: string;
};

const riskClass: Record<string, string> = {
  Low: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  High: "bg-warning/10 text-warning border-warning/20",
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
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

  const handleExportCSV = () => {
    const headers = [
      "Aging Bucket",
      "Invoice Count",
      "Outstanding Amount",
      "Risk Exposure Level",
    ];
    const csvRows = rows.map((r) => [
      r.bucket,
      r.invoices,
      r.amount,
      r.risk,
    ]);

    exportToCsv({
      filename: `betflow_payment_aging_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows: csvRows,
    });
  };

  const handlePrint = () => {
    printReportDocument({
      title: "Payment Aging & Collection Risk Report",
      subtitle: "Outstanding payment exposure categorized by overdue aging buckets.",
      columns: ["Aging Bucket", "Invoices", "Outstanding Amount", "Risk Level"],
      rows: rows.map((r) => [r.bucket, String(r.invoices), r.amount, r.risk]),
    });
  };

  return (
    <DashboardShell
      title="Payment Aging Report"
      description="Outstanding payment exposure by aging bucket with collection risk analysis."
      active="Reports"
    >
      <div className="space-y-6">
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
              <Clock className="size-4 text-warning" />
              <span>Payment Aging & Risk Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={loading || rows.length === 0}
              className="h-9 text-xs font-semibold"
            >
              <Download className="size-3.5 mr-1.5 text-primary" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={loading || rows.length === 0}
              className="h-9 text-xs font-semibold"
            >
              <Printer className="size-3.5 mr-1.5 text-muted-foreground" />
              Print Report
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="border-b border-border bg-muted/40 p-4">
            <h2 className="text-sm font-bold text-foreground">Aging Buckets & Exposure</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Overdue and upcoming receivables risk view across active contracts.
            </p>
          </div>
          {loading ? (
            <p className="p-8 text-center text-xs text-muted-foreground font-medium">
              Loading aging data…
            </p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground font-medium">
              No pending payment schedules found.
            </p>
          ) : (
            <CrmTable
              columns={["Bucket", "Invoices", "Amount", "Risk"]}
              rows={rows.map((row) => [
                <span key="bucket" className="font-semibold text-foreground text-xs">
                  {row.bucket}
                </span>,
                row.invoices,
                <span key="amt" className="font-bold text-foreground text-xs">
                  {row.amount}
                </span>,
                <span
                  key="risk"
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
                    riskClass[row.risk] ?? "bg-muted text-foreground border-border",
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
