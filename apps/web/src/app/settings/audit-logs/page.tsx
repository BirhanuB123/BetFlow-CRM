"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { apiFetch } from "@/lib/api";

type AuditLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

const severityClass = {
  Info: "bg-zinc-100 text-zinc-700",
  Warning: "bg-amber-50 text-amber-800",
  Critical: "bg-red-50 text-red-700",
};

function getSeverity(action: string): "Info" | "Warning" | "Critical" {
  const lowercaseAction = action.toLowerCase();
  if (
    lowercaseAction.includes("deleted") ||
    lowercaseAction.includes("removed") ||
    lowercaseAction.includes("login") ||
    lowercaseAction.includes("password") ||
    lowercaseAction.includes("role")
  ) {
    return "Critical";
  }
  if (
    lowercaseAction.includes("updated") ||
    lowercaseAction.includes("edit") ||
    lowercaseAction.includes("changed")
  ) {
    return "Warning";
  }
  return "Info";
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await apiFetch<AuditLogItem[]>("/audit-logs");
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }
    void loadLogs();
  }, []);

  return (
    <DashboardShell
      title="Audit logs"
      description="Security, tenant, and administration events."
      active="Audit logs"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Event timeline</h2>
          <p className="text-sm text-zinc-500">Immutable activity history for compliance review.</p>
        </div>

        {error && (
          <p className="m-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading audit logs…</p>
        ) : logs.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500 text-center">No audit log records found.</p>
        ) : (
          <div className="divide-y divide-zinc-200">
            {logs.map((log) => {
              const severity = getSeverity(log.action);
              const actorName = log.user
                ? `${log.user.firstName} ${log.user.lastName}`.trim()
                : "System";
              return (
                <article key={log.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{log.action}</h3>
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${severityClass[severity]}`}>
                        {severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {actorName} · {log.entityType} ({log.entityId})
                    </p>
                  </div>
                  <time className="text-sm text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
