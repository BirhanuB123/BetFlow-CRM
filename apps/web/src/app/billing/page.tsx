import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { billingAccount, billingItems, saasMetrics, statusClass } from "@/features/settings/saas-data";

export default function BillingPage() {
  return (
    <DashboardShell
      title="Tenant billing"
      description="Invoices, billing cycle charges, and payment status."
      active="Billing"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Billing account" value={billingAccount.accountName} detail={billingAccount.billingEmail} />
        <StatCard label="Collection" value={billingAccount.collectionMode} detail={billingAccount.paymentMethod} />
        <StatCard label="Next charge" value={billingAccount.nextCharge} detail="Subscription plus overages" />
        <StatCard label="Current plan" value={saasMetrics[0].value} detail={saasMetrics[0].detail} />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Billing history</h2>
          <p className="text-sm text-zinc-500">Tenant subscription and usage charges.</p>
        </div>
        <CrmTable
          columns={["Invoice", "Period", "Amount", "Due date", "Status"]}
          rows={billingItems.map((item) => [
            <span key="invoice" className="font-medium">{item.invoice}</span>,
            item.period,
            item.amount,
            item.dueDate,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[item.status]}`}>
              {item.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
