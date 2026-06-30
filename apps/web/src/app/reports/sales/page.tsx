import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import {
  agentPerformance,
  salesDashboardMetrics,
} from "@/features/reports/reporting-data";

export default function SalesReportPage() {
  return (
    <DashboardShell
      title="Sales dashboard"
      description="Booked revenue, collected payments, and sales productivity."
      active="Sales report"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {salesDashboardMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Top sales contributors</h2>
          <p className="text-sm text-zinc-500">Reservations and revenue by agent.</p>
        </div>
        <CrmTable
          columns={["Agent", "Leads", "Visits", "Reservations", "Revenue", "Conversion"]}
          rows={agentPerformance.map((agent) => [
            <span key="agent" className="font-medium">{agent.agent}</span>,
            agent.leads,
            agent.visits,
            agent.reservations,
            agent.revenue,
            agent.conversion,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
