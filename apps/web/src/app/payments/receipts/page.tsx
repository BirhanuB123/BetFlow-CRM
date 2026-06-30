import { Upload } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { receiptStatusClass, receipts } from "@/features/payments/sales-workflow-data";

export default function ReceiptsPage() {
  return (
    <DashboardShell
      title="Receipt upload"
      description="Collect and review proof of payment for finance reconciliation."
      active="Payments"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Uploaded receipts</h2>
            <p className="text-sm text-zinc-500">Files attached to payment transactions.</p>
          </div>
          <Button>
            <Upload className="size-4" />
            Upload receipt
          </Button>
        </div>
        <CrmTable
          columns={["Payment", "File", "Uploaded by", "Uploaded", "Status"]}
          rows={receipts.map((receipt) => [
            <span key="payment" className="font-medium">{receipt.payment}</span>,
            receipt.fileName,
            receipt.uploadedBy,
            receipt.uploadedAt,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${receiptStatusClass[receipt.status]}`}>
              {receipt.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
