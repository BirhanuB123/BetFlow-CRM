import { Download, Upload } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { dataTransferJobs, excelImportTemplates, statusClass } from "@/features/settings/saas-data";

export default function DataTransferPage() {
  return (
    <DashboardShell
      title="Data export/import"
      description="Tenant data portability jobs for CRM records and audit history."
      active="Data jobs"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Transfer jobs</h2>
            <p className="text-sm text-zinc-500">Exports and imports by scope and requester.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Upload className="size-4" />Import</Button>
            <Button><Download className="size-4" />Export</Button>
          </div>
        </div>
        <CrmTable
          columns={["Type", "Scope", "Requested by", "Requested", "Status"]}
          rows={dataTransferJobs.map((job) => [
            <span key="type" className="font-medium">{job.type}</span>,
            job.scope,
            job.requestedBy,
            job.requestedAt,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[job.status]}`}>
              {job.status}
            </span>,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Excel import templates</h2>
          <p className="text-sm text-zinc-500">Workbook formats for tenant onboarding and bulk data migration.</p>
        </div>
        <CrmTable
          columns={["Template", "Entity", "Required columns", "Last run", "Status"]}
          rows={excelImportTemplates.map((template) => [
            <span key="template" className="font-medium">{template.template}</span>,
            template.entity,
            template.requiredColumns.join(", "),
            template.lastRun,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[template.status]}`}>
              {template.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
