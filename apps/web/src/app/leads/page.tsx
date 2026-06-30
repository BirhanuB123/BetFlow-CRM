import { UserPlus } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CrmTable } from "@/components/tables/crm-table";
import { leads } from "@/features/leads/crm-data";

const priorityClass = {
  High: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-800",
  Low: "bg-zinc-100 text-zinc-700",
};

export default function LeadsPage() {
  return (
    <DashboardShell
      title="Leads"
      description="Capture, qualify, and assign incoming demand."
      active="Leads"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Lead queue</h2>
            <p className="text-sm text-zinc-500">Assignment and qualification status.</p>
          </div>
          <Button>
            <UserPlus className="size-4" />
            New lead
          </Button>
        </div>
        <CrmTable
          columns={["Lead", "Source", "Budget", "Stage", "Assigned", "Priority", "Last activity"]}
          rows={leads.map((lead) => [
            <div key="lead">
              <p className="font-medium">{lead.name}</p>
              <p className="text-zinc-500">{lead.company}</p>
            </div>,
            lead.source,
            lead.budget,
            <span key="stage" className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
              {lead.stage}
            </span>,
            lead.assignedTo,
            <span key="priority" className={`rounded-md px-2 py-1 text-xs font-medium ${priorityClass[lead.priority]}`}>
              {lead.priority}
            </span>,
            lead.lastActivity,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-base font-semibold">Lead assignment</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {leads.slice(0, 3).map((lead) => (
            <article key={lead.id} className="rounded-md border border-zinc-200 p-3">
              <p className="text-sm font-semibold">{lead.company}</p>
              <p className="mt-1 text-sm text-zinc-500">{lead.name}</p>
              <label className="mt-3 grid gap-2 text-sm font-medium">
                Owner
                <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm">
                  <option>{lead.assignedTo}</option>
                  <option>Maya Johnson</option>
                  <option>Omar Haddad</option>
                  <option>Noah Smith</option>
                </select>
              </label>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
