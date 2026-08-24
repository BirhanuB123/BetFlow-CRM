import Link from "next/link";
import { FilePlus2, ArrowLeft, ScrollText } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import {
  contractStatusClass,
  contractTemplates,
} from "@/features/contracts/document-data";

export default function ContractTemplatesPage() {
  return (
    <DashboardShell
      title="Contract templates"
      description="Versioned legal templates used for reservation and sale documents."
      active="Templates"
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar with Back Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#233b66] transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-slate-500" />
              <span>Back to Transactions</span>
            </Link>
            <span className="text-slate-300 font-bold">•</span>
            <Link
              href="/transactions?tab=contracts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs cursor-pointer"
            >
              <ScrollText className="size-3.5 text-primary" />
              <span>Back to Sales Contracts</span>
            </Link>
          </div>
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
            <div>
              <h2 className="text-base font-semibold">Template library</h2>
              <p className="text-sm text-zinc-500">
                Approved clauses, versions, and template status.
              </p>
            </div>
            <Button>
              <FilePlus2 className="size-4" />
              New template
            </Button>
          </div>
          <CrmTable
            columns={["Template", "Type", "Version", "Last updated", "Status"]}
            rows={contractTemplates.map((template) => [
              <span key="name" className="font-medium">
                {template.name}
              </span>,
              template.type,
              template.version,
              template.lastUpdated,
              <span
                key="status"
                className={`rounded-md px-2 py-1 text-xs font-medium ${contractStatusClass[template.status]}`}
              >
                {template.status}
              </span>,
            ])}
          />
        </section>
      </div>
    </DashboardShell>
  );
}
