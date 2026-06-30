import { Send } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  notificationMessages,
  notificationMetrics,
  notificationStatusClass,
} from "@/features/notifications/notification-data";

const channelClass = {
  SMS: "bg-emerald-50 text-emerald-700",
  Telegram: "bg-blue-50 text-blue-700",
  Email: "bg-violet-50 text-violet-700",
};

export default function NotificationsPage() {
  return (
    <DashboardShell
      title="Notifications"
      description="SMS reminders, Telegram notifications, and email alerts."
      active="Notifications"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {notificationMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Message queue</h2>
            <p className="text-sm text-zinc-500">Customer and internal notifications by channel.</p>
          </div>
          <Button>
            <Send className="size-4" />
            Compose
          </Button>
        </div>
        <CrmTable
          columns={["Channel", "Recipient", "Subject", "Related to", "Schedule", "Status"]}
          rows={notificationMessages.map((message) => [
            <span key="channel" className={`rounded-md px-2 py-1 text-xs font-medium ${channelClass[message.channel]}`}>
              {message.channel}
            </span>,
            <span key="recipient" className="font-medium">{message.recipient}</span>,
            message.subject,
            message.relatedTo,
            message.scheduledFor,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${notificationStatusClass[message.status]}`}>
              {message.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
