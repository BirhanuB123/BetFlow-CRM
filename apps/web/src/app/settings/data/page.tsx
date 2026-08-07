"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, RotateCw, Upload } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type DataTransferJob = {
  id: string;
  type: "export" | "import" | "excel_import";
  scope: string;
  requestedByUserId: string;
  requestedAt: string;
  status: "ready" | "processing" | "failed";
};

type ExcelImportTemplate = {
  template: string;
  entity: "Leads" | "Customers" | "Units" | "Payments";
  requiredColumns: string[];
  lastRun: string;
  status: "ready" | "processing" | "failed";
};

const statusClass = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function DataTransferPage() {
  const [jobs, setJobs] = useState<DataTransferJob[]>([]);
  const [templates, setTemplates] = useState<ExcelImportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [triggering, setTriggering] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, templatesData] = await Promise.all([
        apiFetch<DataTransferJob[]>("/saas/data-transfer-jobs"),
        apiFetch<ExcelImportTemplate[]>("/saas/excel-import-templates"),
      ]);
      setJobs(jobsData);
      setTemplates(templatesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data transfer settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleTriggerJob = async (type: "export" | "import", scope: string) => {
    setTriggering(true);
    setError(null);
    try {
      const newJob = await apiFetch<DataTransferJob>(
        "/saas/data-transfer-jobs",
        {
          method: "POST",
          body: JSON.stringify({ type, scope }),
        },
      );
      setJobs((prev) => [newJob, ...prev]);
      showSuccess(`Triggered ${type} job for ${scope}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to trigger transfer job",
      );
    } finally {
      setTriggering(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <DashboardShell
      title="Data export/import"
      description="Tenant data portability jobs for CRM records and audit history."
      active="Data jobs"
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

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          <Check className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Transfer jobs</h2>
            <p className="text-sm text-zinc-500">
              Exports and imports by scope and requester.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleTriggerJob("import", "Legacy leads CSV")}
              disabled={triggering}
            >
              <Upload className="size-4 mr-1" />
              Trigger Import
            </Button>
            <Button
              onClick={() => handleTriggerJob("export", "Customers and deals")}
              disabled={triggering}
            >
              <Download className="size-4 mr-1" />
              Trigger Export
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading transfer jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500 text-center">
            No transfer jobs recorded.
          </p>
        ) : (
          <CrmTable
            columns={["Type", "Scope", "Requested By", "Requested", "Status"]}
            rows={jobs.map((job) => [
              <span key="type" className="font-medium uppercase">
                {job.type}
              </span>,
              job.scope,
              job.requestedByUserId === "user_001" ? "You (Admin)" : "System",
              job.requestedAt,
              <span
                key="status"
                className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${statusClass[job.status]}`}
              >
                {job.status}
              </span>,
            ])}
          />
        )}
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Excel import templates</h2>
          <p className="text-sm text-zinc-500">
            Workbook formats for tenant onboarding and bulk data migration.
          </p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading templates…</p>
        ) : (
          <CrmTable
            columns={[
              "Template",
              "Entity",
              "Required columns",
              "Last run",
              "Status",
            ]}
            rows={templates.map((template) => [
              <span key="template" className="font-medium">
                {template.template}
              </span>,
              template.entity,
              template.requiredColumns.join(", "),
              template.lastRun,
              <span
                key="status"
                className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${statusClass[template.status]}`}
              >
                {template.status}
              </span>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
