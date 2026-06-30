import { FilePlus2 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { contractStatusClass, contractTemplates } from "@/features/contracts/document-data";

export default function ContractTemplatesPage() {
  return (
    <DashboardShell
      title="Contract templates"
      description="Versioned legal templates used for reservation and sale documents."
      active="Templates"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Template library</h2>
            <p className="text-sm text-zinc-500">Approved clauses, versions, and template status.</p>
          </div>
          <Button>
            <FilePlus2 className="size-4" />
            New template
          </Button>
        </div>
        <CrmTable
          columns={["Template", "Type", "Version", "Last updated", "Status"]}
          rows={contractTemplates.map((template) => [
            <span key="name" className="font-medium">{template.name}</span>,
            template.type,
            template.version,
            template.lastUpdated,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${contractStatusClass[template.status]}`}>
              {template.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
