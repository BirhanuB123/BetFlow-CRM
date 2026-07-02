import { FileSpreadsheet, Upload } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { excelImportTemplates, featureLimits, statusClass } from "@/features/settings/saas-data";

export default function ExcelImportPage() {
  const rowLimit = featureLimits.find((limit) => limit.feature === "Excel import rows");

  return (
    <DashboardShell
      title="Data import from Excel"
      description="Map tenant workbooks into leads, customers, units, and payment schedules."
      active="Excel import"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Import rows" value={`${rowLimit?.used.toLocaleString()}/${rowLimit?.limit.toLocaleString()}`} detail="Rows used this billing cycle" />
        <StatCard label="Templates" value={`${excelImportTemplates.length}`} detail="Validated workbook formats" />
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
              <FileSpreadsheet className="size-4" />
              Download template
            </Button>
            <Button>
              <Upload className="size-4" />
              Upload Excel
            </Button>
          </div>
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
