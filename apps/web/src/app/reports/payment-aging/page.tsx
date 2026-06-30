import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { paymentAgingReport, riskClass } from "@/features/reports/reporting-data";

export default function PaymentAgingReportPage() {
  return (
    <DashboardShell
      title="Payment aging report"
      description="Outstanding payment exposure by aging bucket."
      active="Revenue"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Aging buckets</h2>
          <p className="text-sm text-zinc-500">Overdue and upcoming receivables risk view.</p>
        </div>
        <CrmTable
          columns={["Bucket", "Invoices", "Amount", "Risk"]}
          rows={paymentAgingReport.map((row) => [
            <span key="bucket" className="font-medium">{row.bucket}</span>,
            row.invoices,
            row.amount,
            <span key="risk" className={`rounded-md px-2 py-1 text-xs font-medium ${riskClass[row.risk]}`}>
              {row.risk}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
