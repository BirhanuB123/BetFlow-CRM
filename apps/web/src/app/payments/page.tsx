import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import {
  paymentSchedule,
  paymentStatusClass,
  paymentTransactions,
  workflowMetrics,
} from "@/features/payments/sales-workflow-data";

export default function PaymentsPage() {
  return (
    <DashboardShell
      title="Payments"
      description="Payment schedule and tracking for active reservations."
      active="Payments"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workflowMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Payment schedule</h2>
          <p className="text-sm text-zinc-500">Reservation milestones, due dates, and expected amounts.</p>
        </div>
        <CrmTable
          columns={["Reservation", "Milestone", "Due date", "Amount", "Status"]}
          rows={paymentSchedule.map((item) => [
            <span key="reservation" className="font-medium">{item.reservation}</span>,
            item.milestone,
            item.dueDate,
            item.amount,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${paymentStatusClass[item.status]}`}>
              {item.status}
            </span>,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Payment tracking</h2>
          <p className="text-sm text-zinc-500">Received funds and reconciliation status.</p>
        </div>
        <CrmTable
          columns={["Customer", "Method", "Amount", "Received", "Status"]}
          rows={paymentTransactions.map((payment) => [
            <span key="customer" className="font-medium">{payment.customer}</span>,
            payment.method,
            payment.amount,
            payment.receivedAt,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${paymentStatusClass[payment.status]}`}>
              {payment.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
