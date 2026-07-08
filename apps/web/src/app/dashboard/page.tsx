"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Assignee = { id: string; firstName: string; lastName: string } | null;
type PersonRef = { id: string; firstName: string; lastName: string } | null;

type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  assignee: Assignee;
  entityType: string | null;
  entityId: string | null;
};

type SiteVisit = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  lead: PersonRef;
  customer: PersonRef;
};

type Deal = {
  id: string;
  name: string;
  value: string;
  stage: { id: string; name: string };
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string } | null;
};

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  status: string;
  createdAt: string;
  source: { id: string; name: string } | null;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
function money(value: string | number) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(parsed) ? String(value) : currency.format(parsed);
}
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const badge = "rounded-md px-2 py-0.5 text-xs font-medium";
const statusTone: Record<string, string> = {
  TODO: "bg-zinc-100 text-zinc-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  DONE: "bg-emerald-50 text-emerald-700",
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  NO_SHOW: "bg-amber-50 text-amber-700",
  NEW: "bg-zinc-100 text-zinc-700",
  QUALIFIED: "bg-emerald-50 text-emerald-700",
  CONTACTED: "bg-blue-50 text-blue-700",
  FOLLOW_UP: "bg-amber-50 text-amber-700",
};
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(badge, statusTone[status] ?? "bg-zinc-100 text-zinc-700")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function customerLink(person: NonNullable<PersonRef>) {
  return (
    <Link
      href={`/customers/${person.id}`}
      className="text-[#334cff] hover:underline"
    >
      {person.firstName} {person.lastName}
    </Link>
  );
}

function Card({
  title,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  icon: typeof ClipboardList;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-zinc-200 bg-white">
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <Link href={href} className="text-sm text-[#334cff] hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="px-4 py-8 text-center text-sm text-zinc-500">{label}</p>;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, visitsData, dealsData, leadsData] = await Promise.all([
        apiFetch<Task[]>("/tasks?open=true"),
        apiFetch<SiteVisit[]>("/site-visits"),
        apiFetch<Deal[]>("/deals"),
        apiFetch<Lead[]>("/leads"),
      ]);
      setTasks(tasksData);
      setVisits(visitsData);
      setDeals(
        [...dealsData].sort((a, b) => Number(b.value) - Number(a.value)),
      );
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const todaysLeads = leads.filter((lead) => isToday(lead.createdAt));

  return (
    <DashboardShell
      title="Home"
      description="CRM home overview for daily tasks, meetings, leads, and deals."
      active="Dashboard"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {/* Open tasks */}
            <Card title="My Open Tasks" icon={ClipboardList} href="/tasks">
              {tasks.length === 0 ? (
                <Empty label="No open tasks." />
              ) : (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Subject</th>
                      <th className="px-4 py-2.5 font-medium">Due date</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-2.5 font-medium">{task.title}</td>
                        <td className="px-4 py-2.5 text-zinc-600">{fmtDate(task.dueDate)}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={task.status} /></td>
                        <td className="px-4 py-2.5 text-zinc-600">
                          {task.assignee
                            ? `${task.assignee.firstName} ${task.assignee.lastName}`
                            : "Unassigned"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Meetings */}
            <Card title="My Meetings" icon={CalendarDays} href="/site-visits">
              {visits.length === 0 ? (
                <Empty label="No scheduled meetings." />
              ) : (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Date</th>
                      <th className="px-4 py-2.5 font-medium">With</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {visits.map((visit) => (
                      <tr key={visit.id}>
                        <td className="px-4 py-2.5 text-zinc-600">{fmtDate(visit.date)}</td>
                        <td className="px-4 py-2.5">
                          {visit.customer
                            ? customerLink(visit.customer)
                            : visit.lead
                              ? `${visit.lead.firstName} ${visit.lead.lastName}`
                              : "—"}
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge status={visit.status} /></td>
                        <td className="px-4 py-2.5 text-zinc-500">{visit.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Today's leads */}
            <Card title="Today's Leads" icon={UserRoundCheck} href="/leads">
              {todaysLeads.length === 0 ? (
                <Empty label="No new leads today." />
              ) : (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Name</th>
                      <th className="px-4 py-2.5 font-medium">Company</th>
                      <th className="px-4 py-2.5 font-medium">Source</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {todaysLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-4 py-2.5 font-medium">
                          {lead.firstName} {lead.lastName}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-600">{lead.company ?? "—"}</td>
                        <td className="px-4 py-2.5 text-zinc-600">{lead.source?.name ?? "—"}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={lead.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Top deals */}
            <Card title="My Top Deals" icon={WalletCards} href="/deals">
              {deals.length === 0 ? (
                <Empty label="No open deals." />
              ) : (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Deal</th>
                      <th className="px-4 py-2.5 font-medium">Amount</th>
                      <th className="px-4 py-2.5 font-medium">Stage</th>
                      <th className="px-4 py-2.5 font-medium">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {deals.slice(0, 6).map((deal) => (
                      <tr key={deal.id}>
                        <td className="px-4 py-2.5 font-medium">{deal.name}</td>
                        <td className="px-4 py-2.5 text-zinc-600">{money(deal.value)}</td>
                        <td className="px-4 py-2.5 text-zinc-600">{deal.stage.name}</td>
                        <td className="px-4 py-2.5">{customerLink(deal.customer)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          <div className="mt-4">
            <ActivityTimeline title="Recent activity" limit={25} />
          </div>
        </>
      )}
    </DashboardShell>
  );
}