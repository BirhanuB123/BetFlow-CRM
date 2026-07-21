"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
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

type SalesDashboard = {
  metrics: { label: string; value: string; detail: string }[];
};

export default function SalesReportPage() {
  const [dashboard, setDashboard] = useState<SalesDashboard | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [sales, agentData] = await Promise.all([
          apiFetch<SalesDashboard>("/reports/sales"),
          apiFetch<AgentRow[]>("/reports/agents"),
        ]);
        setDashboard(sales);
        setAgents(agentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <DashboardShell
      title="Sales dashboard"
      description="Booked revenue, collected payments, and sales productivity."
      active="Sales report"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border border-zinc-100 bg-zinc-50" />
            ))
          : (dashboard?.metrics ?? []).map((metric) => (
              <StatCard key={metric.label} {...metric} />
            ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Top sales contributors</h2>
          <p className="text-sm text-zinc-500">Reservations and revenue by agent.</p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading agents…</p>
        ) : agents.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">No data available yet.</p>
        ) : (
          <CrmTable
            columns={["Agent", "Leads", "Visits", "Reservations", "Revenue", "Conversion"]}
            rows={agents.map((agent) => [
              <span key="agent" className="font-medium">{agent.agent}</span>,
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
