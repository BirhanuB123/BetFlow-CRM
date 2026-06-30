import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { auditLogs, metrics, roles, setupSteps, tenant } from "@/features/auth/phase-one-data";

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Tenant, access, and operations readiness for the first release."
      active="Dashboard"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Phase-one readiness</h2>
            <p className="text-sm text-zinc-500">Core platform capabilities for tenant onboarding.</p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {setupSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.label} className="rounded-md border border-zinc-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-zinc-100">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{step.label}</p>
                      <p className="mt-1 text-sm text-zinc-500">{step.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Tenant profile</h2>
            <p className="text-sm text-zinc-500">Current workspace context.</p>
          </div>
          <dl className="divide-y divide-zinc-200">
            {Object.entries(tenant).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm capitalize text-zinc-500">{key}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">RBAC summary</h2>
            <Link href="/settings#rbac" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-zinc-200">
            {roles.slice(0, 3).map((role) => (
              <div key={role.name} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-semibold">{role.name}</p>
                  <p className="text-sm text-zinc-500">{role.scope}</p>
                </div>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">{role.users} users</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Recent audit logs</h2>
            <Link href="/settings/audit-logs" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-200">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={`${log.actor}-${log.time}`} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">{log.action}</p>
                  <span className="text-xs text-zinc-500">{log.time}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {log.actor} · {log.target}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
