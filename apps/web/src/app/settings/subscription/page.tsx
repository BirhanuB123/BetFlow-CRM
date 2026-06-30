import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { featureLimits, saasMetrics, statusClass, subscriptionPlans } from "@/features/settings/saas-data";

export default function SubscriptionPage() {
  return (
    <DashboardShell
      title="Subscription plans"
      description="Plan selection and feature usage for this tenant."
      active="Plans"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {saasMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Plans</h2>
          <p className="text-sm text-zinc-500">Subscription tiers and included capabilities.</p>
        </div>
        <CrmTable
          columns={["Plan", "Price", "Cycle", "Includes", "Status"]}
          rows={subscriptionPlans.map((plan) => [
            <span key="plan" className="font-medium">{plan.name}</span>,
            plan.price,
            plan.billingCycle,
            plan.includes.join(", "),
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[plan.status]}`}>
              {plan.status}
            </span>,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Feature limits</h2>
          <p className="text-sm text-zinc-500">Usage compared with plan limits.</p>
        </div>
        <CrmTable
          columns={["Feature", "Used", "Limit", "Unit", "Usage"]}
          rows={featureLimits.map((limit) => [
            <span key="feature" className="font-medium">{limit.feature}</span>,
            limit.used,
            limit.limit,
            limit.unit,
            `${Math.round((limit.used / limit.limit) * 100)}%`,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
