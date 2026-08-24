"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Mail, Send, Trash2 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import {
  notificationMessages,
  notificationMetrics,
  notificationStatusClass,
} from "@/features/notifications/notification-data";

type InboxNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const channelClass = {
  SMS: "bg-emerald-50 text-emerald-700",
  Telegram: "bg-blue-50 text-blue-700",
  Email: "bg-violet-50 text-violet-700",
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"inbox" | "logs">("inbox");
  const [inbox, setInbox] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<InboxNotification[]>("/notifications/inbox");
      setInbox(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "inbox") {
      void loadInbox();
    }
  }, [activeTab, loadInbox]);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/inbox/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
      });
      await loadInbox();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update notification",
      );
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/inbox/${id}`, {
        method: "DELETE",
      });
      await loadInbox();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete notification",
      );
    }
  };

  // Derived metrics
  const unreadCount = inbox.filter((n) => !n.isRead).length;
  const metrics = [
    {
      label: "Unread alerts",
      value: String(unreadCount),
      detail: "Awaiting review",
    },
    ...notificationMetrics.slice(0, 3),
  ];

  return (
    <DashboardShell
      title={t("nav.notifications")}
      description="SMS reminders, Telegram notifications, and email alerts."
      active="Notifications"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="mt-6 flex border-b border-zinc-200 text-sm font-medium">
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition",
            activeTab === "inbox"
              ? "border-[#0E6E63] text-[#0E6E63]"
              : "border-transparent text-zinc-500 hover:text-zinc-700",
          )}
          onClick={() => setActiveTab("inbox")}
        >
          <Bell className="size-4" />
          In-App Inbox ({unreadCount})
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition",
            activeTab === "logs"
              ? "border-[#0E6E63] text-[#0E6E63]"
              : "border-transparent text-zinc-500 hover:text-zinc-700",
          )}
          onClick={() => setActiveTab("logs")}
        >
          <Mail className="size-4" />
          Outbound Queue
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* TAB 1: DATABASE IN-APP INBOX */}
      {activeTab === "inbox" && (
        <section className="mt-4 rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Notifications Inbox</h2>
            <p className="text-sm text-zinc-500">
              Real-time alerts triggered by system actions.
            </p>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-zinc-500">Loading alerts…</p>
          ) : inbox.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500 text-center">
              No notifications found.
            </p>
          ) : (
            <CrmTable
              columns={["Status", "Title", "Message", "Received At", "Actions"]}
              rows={inbox.map((item) => [
                <span
                  key="status"
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    item.isRead
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-teal-50 text-teal-700 font-semibold",
                  )}
                >
                  {item.isRead ? "Read" : "Unread"}
                </span>,
                <span key="title" className="font-semibold text-zinc-900">
                  {item.title}
                </span>,
                item.message,
                new Date(item.createdAt).toLocaleString(),
                <div key="actions" className="flex items-center gap-1.5">
                  {!item.isRead && (
                    <Button
                      size="icon-sm"
                      variant="outline"
                      title="Mark as read"
                      onClick={() => markAsRead(item.id)}
                    >
                      <Check className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete"
                    onClick={() => deleteNotification(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>,
              ])}
            />
          )}
        </section>
      )}

      {/* TAB 2: OUTBOUND LOGS QUEUE */}
      {activeTab === "logs" && (
        <section className="mt-4 rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
            <div>
              <h2 className="text-base font-semibold">Message queue</h2>
              <p className="text-sm text-zinc-500">
                Customer and internal notifications by channel.
              </p>
            </div>
            <Button>
              <Send className="size-4" />
              Compose
            </Button>
          </div>
          <CrmTable
            columns={[
              "Channel",
              "Recipient",
              "Subject",
              "Related to",
              "Schedule",
              "Status",
            ]}
            rows={notificationMessages.map((message) => [
              <span
                key="channel"
                className={`rounded-md px-2 py-1 text-xs font-medium ${channelClass[message.channel]}`}
              >
                {message.channel}
              </span>,
              <span key="recipient" className="font-medium">
                {message.recipient}
              </span>,
              message.subject,
              message.relatedTo,
              message.scheduledFor,
              <span
                key="status"
                className={`rounded-md px-2 py-1 text-xs font-medium ${notificationStatusClass[message.status]}`}
              >
                {message.status}
              </span>,
            ])}
          />
        </section>
      )}
    </DashboardShell>
  );
}
