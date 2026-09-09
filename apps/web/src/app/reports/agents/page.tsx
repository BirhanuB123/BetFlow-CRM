"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Download, Printer, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { exportToCsv } from "@/lib/export";
import { printReportDocument } from "@/lib/print";

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

  const handleExportCSV = () => {
    const headers = [
      "Agent Name",
      "Leads Handled",
      "Site Visits Conducted",
      "Reservations Converted",
      "Booked Revenue",
      "Conversion Rate",
    ];
    const rows = agents.map((a) => [
      a.agent,
      a.leads,
      a.visits,
      a.reservations,
      a.revenue,
      a.conversion,
    ]);

    exportToCsv({
      filename: `betflow_agent_performance_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    });
  };

  const handlePrint = () => {
    printReportDocument({
      title: "Agent Performance & Sales Productivity Report",
      subtitle: "Lead handling, site visits, reservation conversion, and revenue contribution per agent.",
      columns: [
        "Agent",
        "Leads",
        "Site Visits",
        "Reservations",
        "Revenue",
        "Conversion",
      ],
      rows: agents.map((a) => [
        a.agent,
        String(a.leads),
        String(a.visits),
        String(a.reservations),
        a.revenue,
        a.conversion,
      ]),
    });
  };

  return (
    <DashboardShell
      title="Agent Performance"
      description="Lead handling, visits, reservations, and conversion by owner."
      active="Reports"
    >
      <div className="space-y-6">
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-primary" />
              <span>Back to Reports</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Users className="size-4 text-primary" />
              <span>Agent Productivity Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/reports/commissions">
              <Button
                variant="outline"
                className="h-9 text-xs font-semibold"
              >
                <Coins className="size-3.5 mr-1.5 text-primary" />
                Commission Ledger
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={loading || agents.length === 0}
              className="h-9 text-xs font-semibold"
            >
              <Download className="size-3.5 mr-1.5 text-primary" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={loading || agents.length === 0}
              className="h-9 text-xs font-semibold"
            >
              <Printer className="size-3.5 mr-1.5 text-muted-foreground" />
              Print Report
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="border-b border-border bg-muted/40 p-4">
            <h2 className="text-sm font-bold text-foreground">Performance Leaderboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Operational sales productivity metrics for current period.
            </p>
          </div>
          {loading ? (
            <p className="p-8 text-center text-xs text-muted-foreground font-medium">
              Loading performance data…
            </p>
          ) : agents.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground font-medium">
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
                <span key="agent" className="font-semibold text-foreground text-xs">
                  {agent.agent}
                </span>,
                agent.leads,
                agent.visits,
                agent.reservations,
                <span key="rev" className="font-bold text-foreground text-xs">
                  {agent.revenue}
                </span>,
                <span
                  key="conv"
                  className="inline-flex rounded-full bg-info/10 text-info border border-info/20 px-2.5 py-0.5 text-xs font-bold"
                >
                  {agent.conversion}
                </span>,
              ])}
            />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
