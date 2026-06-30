import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { agentPerformance } from "@/features/reports/reporting-data";

export default function AgentPerformancePage() {
  return (
    <DashboardShell
      title="Agent performance"
      description="Lead handling, visits, reservations, and conversion by owner."
      active="Agents"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Performance leaderboard</h2>
          <p className="text-sm text-zinc-500">Operational sales metrics for current period.</p>
        </div>
        <CrmTable
          columns={["Agent", "Leads", "Site visits", "Reservations", "Revenue", "Conversion"]}
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
