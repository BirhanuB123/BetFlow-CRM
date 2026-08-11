"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
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
      active="Reports"
    >
      <div className="space-y-6">
        <div className="no-print flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#233b66] transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-[#233b66]" />
              <span>Back to Reports</span>
            </Link>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Users className="size-4 text-indigo-600" />
              <span>Agent Productivity Analytics</span>
            </div>
          </div>
        </div>
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
      </div>
    </DashboardShell>
  );
}
