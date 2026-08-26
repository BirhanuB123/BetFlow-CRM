"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  Mail,
  Send,
  Trash2,
  ShieldAlert,
  RotateCw,
  FileText,
  AlertTriangle,
} from "lucide-react";

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
  SMS: "bg-success/10 text-success",
  Telegram: "bg-info/10 text-info",
  Email: "bg-info/10 text-info",
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"inbox" | "logs">("inbox");
  const [inboxFilter, setInboxFilter] = useState<"ALL" | "DOCUMENTS" | "SYSTEM">("ALL");
  const [inbox, setInbox] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
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

  const runExpiryAudit = async () => {
    setAuditing(true);
    setAuditResult(null);
    setError(null);
    try {
      const res = await apiFetch<{
        expiredProcessed: number;
        expiringSoonProcessed: number;
        totalExpiringSoonFound: number;
      }>("/documents/check-expiries", { method: "POST" });

      setAuditResult(
        `Document audit completed: ${res.expiredProcessed} expired, ${res.expiringSoonProcessed} new expiry warning(s) generated.`,
      );
      await loadInbox();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to execute document expiry audit",
      );
    } finally {
      setAuditing(false);
    }
  };

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
  const docAlertCount = inbox.filter(
    (n) => n.title.includes("KYC") || n.title.includes("Document") || n.message.includes("Document"),
  ).length;

  const filteredInbox = inbox.filter((item) => {
    if (inboxFilter === "DOCUMENTS") {
      return (
        item.title.includes("KYC") ||
        item.title.includes("Document") ||
        item.message.includes("Document")
      );
    }
    if (inboxFilter === "SYSTEM") {
      return (
        !item.title.includes("KYC") &&
        !item.title.includes("Document") &&
        !item.message.includes("Document")
      );
    }
    return true;
  });

  const metrics = [
    {
      label: "Unread alerts",
      value: String(unreadCount),
      detail: "Awaiting review",
    },
    {
      label: "Document & KYC Alerts",
      value: String(docAlertCount),
      detail: "Expiring or expired items",
    },
    ...notificationMetrics.slice(0, 2),
  ];

  return (
    <DashboardShell
      title={t("nav.notifications")}
      description="SMS reminders, Telegram notifications, and email alerts."
      active="Notifications"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="mt-6 flex overflow-x-auto border-b border-zinc-200 text-sm font-medium">
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition shrink-0 cursor-pointer",
            activeTab === "inbox"
              ? "border-[#0E6E63] text-[#0E6E63] font-bold"
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
            "flex items-center gap-2 border-b-2 px-4 py-2.5 transition shrink-0 cursor-pointer",
            activeTab === "logs"
              ? "border-[#0E6E63] text-[#0E6E63] font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-700",
          )}
          onClick={() => setActiveTab("logs")}
        >
          <Mail className="size-4" />
          Outbound Queue
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {auditResult && (
        <div className="mt-4 rounded-xl border border-success/20 bg-success/10 p-3.5 text-xs font-semibold text-success flex items-center justify-between shadow-2xs">
          <span>{auditResult}</span>
          <button
            onClick={() => setAuditResult(null)}
            className="text-xs text-success/80 hover:text-success underline ml-4 font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: DATABASE IN-APP INBOX */}
      {activeTab === "inbox" && (
        <section className="mt-4 rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/80 bg-slate-50/70 p-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notifications & Compliance Inbox</h2>
              <p className="text-xs text-slate-500">
                Real-time alerts triggered by system actions, KYC expiries, and payment milestones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter Pills */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-bold w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={() => setInboxFilter("ALL")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-colors cursor-pointer flex-1 sm:flex-none text-center",
                    inboxFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  All ({inbox.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInboxFilter("DOCUMENTS")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-colors cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1",
                    inboxFilter === "DOCUMENTS"
                      ? "bg-white text-warning shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  <ShieldAlert className="size-3 shrink-0" />
                  KYC & Docs ({docAlertCount})
                </button>
                <button
                  type="button"
                  onClick={() => setInboxFilter("SYSTEM")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-colors cursor-pointer flex-1 sm:flex-none text-center",
                    inboxFilter === "SYSTEM"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  System ({inbox.length - docAlertCount})
                </button>
              </div>

              {/* Run Audit Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={runExpiryAudit}
                disabled={auditing}
                className="w-full sm:w-auto h-8 text-xs font-bold border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 shadow-2xs justify-center"
              >
                <RotateCw className={cn("size-3.5 mr-1.5 shrink-0", auditing && "animate-spin")} />
                {auditing ? "Scanning Documents…" : "Scan Document Expiries"}
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-xs text-slate-500">Loading alerts…</p>
          ) : filteredInbox.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-semibold text-slate-500">
                No notifications found in this category.
              </p>
            </div>
          ) : (
            <CrmTable
              columns={["Type", "Status", "Title", "Details", "Received At", "Actions"]}
              rows={filteredInbox.map((item) => {
                const isExpired = item.title.includes("Expired");
                const isExpiringSoon = item.title.includes("Expiring Soon");
                const isKyc = item.title.includes("KYC") || item.title.includes("Document");

                return [
                  <div key="type" className="flex items-center">
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-500/30">
                        🚨 Expired
                      </span>
                    ) : isExpiringSoon ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-500/30">
                        ⚠️ Expiring Soon
                      </span>
                    ) : isKyc ? (
                      <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                        📄 Document
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                        🔔 System
                      </span>
                    )}
                  </div>,
                  <span
                    key="status"
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-bold",
                      item.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-success/15 text-success border border-success/30",
                    )}
                  >
                    {item.isRead ? "Read" : "Unread"}
                  </span>,
                  <span key="title" className="font-bold text-slate-900 text-xs">
                    {item.title}
                  </span>,
                  <span key="msg" className="text-slate-600 text-xs line-clamp-2">
                    {item.message}
                  </span>,
                  <span key="date" className="text-slate-500 text-xs font-medium">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>,
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete"
                      onClick={() => deleteNotification(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>,
                ];
              })}
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
