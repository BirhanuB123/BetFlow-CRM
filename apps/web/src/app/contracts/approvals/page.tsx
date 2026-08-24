import Link from "next/link";
import { Scale, ArrowLeft, ScrollText } from "lucide-react";

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
      </div>
    </DashboardShell>
  );
}
