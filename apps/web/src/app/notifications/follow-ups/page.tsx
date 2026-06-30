import { CalendarClock } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { followUpReminders, priorityClass } from "@/features/notifications/notification-data";

export default function FollowUpsPage() {
  return (
    <DashboardShell
      title="Follow-up reminders"
      description="Prompt owners to follow up on leads, proposals, and site visits."
      active="Notifications"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Reminder queue</h2>
            <p className="text-sm text-zinc-500">Upcoming follow-up reminders grouped by owner and channel.</p>
          </div>
          <Button>
            <CalendarClock className="size-4" />
            Add reminder
          </Button>
        </div>
        <CrmTable
          columns={["Lead", "Owner", "Due", "Reason", "Channel", "Priority"]}
          rows={followUpReminders.map((reminder) => [
            <span key="lead" className="font-medium">{reminder.lead}</span>,
            reminder.owner,
            reminder.due,
            reminder.reason,
            reminder.channel,
            <span key="priority" className={`rounded-md px-2 py-1 text-xs font-medium ${priorityClass[reminder.priority]}`}>
              {reminder.priority}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
