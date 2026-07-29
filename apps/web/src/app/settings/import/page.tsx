"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Upload } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";

type FeatureLimit = {
  id: string;
  feature: string;
  used: number;
  limit: number;
  unit: string;
};

type ExcelImportTemplate = {
  template: string;
  entity: "Leads" | "Customers" | "Units" | "Payments";
  requiredColumns: string[];
  lastRun: string;
  status: "ready" | "processing" | "failed";
};

type SubscriptionData = {
  limits: FeatureLimit[];
};

const statusClass = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function ExcelImportPage() {
  const [templates, setTemplates] = useState<ExcelImportTemplate[]>([]);
  const [rowLimit, setRowLimit] = useState<FeatureLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [templatesData, subData] = await Promise.all([
        apiFetch<ExcelImportTemplate[]>("/saas/excel-import-templates"),
        apiFetch<SubscriptionData>("/saas/subscription"),
      ]);
      setTemplates(templatesData);
      const limit = subData.limits.find((l) => l.feature === "Excel import rows") || null;
      setRowLimit(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load import templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <DashboardShell
      title="Data Import"
      description="Workbook templates for bulk importing leads, contacts, and inventory."
      active="Excel import"
    >
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#233b66] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Settings
      </Link>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Import rows"
          value={rowLimit ? `${rowLimit.used.toLocaleString()}/${rowLimit.limit.toLocaleString()}` : "N/A"}
          detail="Rows used this billing cycle"
        />
        <StatCard label="Templates" value={String(templates.length)} detail="Validated workbook formats" />
        <StatCard label="Validation mode" value="Strict" detail="Rejects missing required columns" />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Workbook templates</h2>
            <p className="text-sm text-zinc-500">Supported Excel imports and required field mappings.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileSpreadsheet className="size-4 mr-1" />
              Download template
            </Button>
            <Button>
              <Upload className="size-4 mr-1" />
              Upload Excel
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading templates…</p>
        ) : (
          <CrmTable
            columns={["Template", "Entity", "Required columns", "Last run", "Status"]}
            rows={templates.map((template) => [
              <span key="template" className="font-medium">{template.template}</span>,
              template.entity,
              template.requiredColumns.join(", "),
              template.lastRun,
              <span key="status" className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${statusClass[template.status]}`}>
                {template.status}
              </span>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
