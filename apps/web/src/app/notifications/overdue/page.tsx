import { BellRing } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { overduePaymentAlerts, priorityClass } from "@/features/notifications/notification-data";

export default function OverdueAlertsPage() {
  return (
    <DashboardShell
      title="Overdue payment alerts"
      description="Escalate overdue deposits and payment schedule misses."
      active="Notifications"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Overdue queue</h2>
            <p className="text-sm text-zinc-500">Payment reminders ready for SMS, Telegram, or email delivery.</p>
          </div>
          <Button variant="outline">
            <BellRing className="size-4" />
            Send reminders
          </Button>
        </div>
        <CrmTable
          columns={["Customer", "Reservation", "Amount", "Overdue", "Owner", "Priority"]}
          rows={overduePaymentAlerts.map((alert) => [
            <span key="customer" className="font-medium">{alert.customer}</span>,
            alert.reservation,
            alert.amount,
            alert.overdueBy,
            alert.owner,
            <span key="priority" className={`rounded-md px-2 py-1 text-xs font-medium ${priorityClass[alert.priority]}`}>
              {alert.priority}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
