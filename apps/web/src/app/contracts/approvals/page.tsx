import { Scale } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import {
  contractStatusClass,
  legalApprovals,
} from "@/features/contracts/document-data";

export default function LegalApprovalsPage() {
  return (
    <DashboardShell
      title="Legal approval"
      description="Review generated contracts before signature and storage."
      active="Contracts"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Legal review queue</h2>
            <p className="text-sm text-zinc-500">
              Approvals and requested changes from legal reviewers.
            </p>
          </div>
          <Button variant="outline">
            <Scale className="size-4" />
            Submit review
          </Button>
        </div>
        <CrmTable
          columns={["Contract", "Reviewer", "Submitted", "Status", "Note"]}
          rows={legalApprovals.map((approval) => [
            <span key="contract" className="font-medium">
              {approval.contract}
            </span>,
            approval.reviewer,
            approval.submittedAt,
            <span
              key="status"
              className={`rounded-md px-2 py-1 text-xs font-medium ${contractStatusClass[approval.status]}`}
            >
              {approval.status}
            </span>,
            approval.note,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
