import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auditLogs } from "@/features/auth/phase-one-data";

const severityClass = {
  Info: "bg-zinc-100 text-zinc-700",
  Warning: "bg-amber-50 text-amber-800",
  Critical: "bg-red-50 text-red-700",
};

export default function AuditLogsPage() {
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
        <div className="divide-y divide-zinc-200">
          {auditLogs.map((log) => (
            <article key={`${log.actor}-${log.action}`} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{log.action}</h3>
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${severityClass[log.severity]}`}>
                    {log.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {log.actor} · {log.target}
                </p>
              </div>
              <time className="text-sm text-zinc-500">{log.time}</time>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
