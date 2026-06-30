import { CalendarPlus } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { siteVisits } from "@/features/payments/sales-workflow-data";

const visitStatusClass = {
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "No show": "bg-red-50 text-red-700",
};

export default function SiteVisitsPage() {
  return (
    <DashboardShell
      title="Site visits"
      description="Schedule, confirm, and track property visit outcomes."
      active="Site visits"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Visit schedule</h2>
            <p className="text-sm text-zinc-500">Lead-to-unit visit appointments and outcomes.</p>
          </div>
          <Button>
            <CalendarPlus className="size-4" />
            Schedule visit
          </Button>
        </div>
        <CrmTable
          columns={["Lead", "Unit", "Agent", "Scheduled", "Status", "Outcome"]}
          rows={siteVisits.map((visit) => [
            <span key="lead" className="font-medium">{visit.lead}</span>,
            visit.unit,
            visit.agent,
            visit.scheduledFor,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${visitStatusClass[visit.status]}`}>
              {visit.status}
            </span>,
            visit.outcome,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
