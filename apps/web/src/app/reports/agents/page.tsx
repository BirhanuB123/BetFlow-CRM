"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";

type AgentRow = {
  agentId: string;
  agent: string;
  leads: number;
  visits: number;
  reservations: number;
  revenue: string;
  conversion: string;
};

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<AgentRow[]>("/reports/agents");
        setAgents(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load agent report",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <DashboardShell
      title="Agent performance"
      description="Lead handling, visits, reservations, and conversion by owner."
      active="Agents"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Performance leaderboard</h2>
          <p className="text-sm text-zinc-500">
            Operational sales metrics for current period.
          </p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading performance data…</p>
        ) : agents.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">
            No agent data available yet.
          </p>
        ) : (
          <CrmTable
            columns={[
              "Agent",
              "Leads",
              "Site visits",
              "Reservations",
              "Revenue",
              "Conversion",
            ]}
            rows={agents.map((agent) => [
              <span key="agent" className="font-medium">
                {agent.agent}
              </span>,
              agent.leads,
              agent.visits,
              agent.reservations,
              agent.revenue,
              agent.conversion,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
