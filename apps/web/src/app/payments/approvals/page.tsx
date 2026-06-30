import { CheckCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { approvalStatusClass, financeApprovals } from "@/features/payments/sales-workflow-data";

export default function FinanceApprovalsPage() {
  return (
    <DashboardShell
      title="Finance approval"
      description="Review payment evidence and approve reservation finance status."
      active="Finance"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Approval queue</h2>
            <p className="text-sm text-zinc-500">Finance review for submitted receipts and partial payments.</p>
          </div>
          <Button variant="outline">
            <CheckCheck className="size-4" />
            Approve selected
          </Button>
        </div>
        <CrmTable
          columns={["Reservation", "Reviewer", "Amount", "Submitted", "Status", "Note"]}
          rows={financeApprovals.map((approval) => [
            <span key="reservation" className="font-medium">{approval.reservation}</span>,
            approval.reviewer,
            approval.amount,
            approval.submittedAt,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${approvalStatusClass[approval.status]}`}>
              {approval.status}
            </span>,
            approval.note,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
