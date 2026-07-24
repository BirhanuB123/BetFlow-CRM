"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  PiggyBank,
  Receipt,
  TrendingUp,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
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

type ReportMetric = {
  label: string;
  value: string;
  detail: string;
};

type AgentPerformanceReport = {
  agent: string;
  leads: number;
  deals: number;
  volume: string;
};

type PaymentAgingRow = {
  range: string;
  amount: string;
  percentage: string;
  count: number;
};

type Payment = {
  id: string;
  amount: string;
  date: string;
  method: string;
  status: string;
};

type Contract = {
  id: string;
  title: string;
  status: string;
  value: string;
  createdAt: string;
};

function money(value: string | number) {
  return formatCurrency(value);
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
    <Link href={`/customers/${person.id}`} className="text-[#334cff] hover:underline">
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
  icon: any;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-w-0 rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md h-[340px]">
      <div className="flex h-14 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4.5 text-slate-500" />
          <h2 className="text-[14px] font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <Link href={href} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          View all
        </Link>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">{children}</div>
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 p-4">
      <div className="rounded-full bg-slate-50 p-3 shadow-inner">
        <ClipboardList className="size-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function ZohoOperationalGrid({ tasks, visits, todaysLeads, deals }: any) {
  return (
    <div className="grid gap-6 xl:grid-cols-2 mt-6 mb-6">
      {/* 1. My Open Tasks */}
      <Card title="My Open Tasks" icon={ClipboardList} href="/tasks">
        {tasks.length === 0 ? (
          <Empty label="No open tasks found." />
        ) : (
          <div className="flex flex-col h-full">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-white text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Subject <span className="text-slate-300 ml-1">↑↓</span></th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Priority <span className="text-slate-300 ml-1">⇅</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.slice(0, 4).map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{task.title}</td>
                    <td className="px-5 py-3.5 text-slate-500">{fmtDate(task.dueDate)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={task.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{['High', 'Normal', 'Low'][Math.floor(Math.random() * 3)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3 text-xs font-medium text-slate-500">
              <span>Total Records {tasks.length}</span>
              <div className="flex items-center gap-1">
                <span className="cursor-pointer hover:text-slate-800 font-bold">{'<'}</span>
                <span className="mx-2">1 to {Math.min(4, tasks.length)}</span>
                <span className="cursor-pointer hover:text-slate-800 font-bold">{'>'}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 2. My Meetings */}
      <Card title="My Meetings" icon={CalendarDays} href="/site-visits">
        {visits.length === 0 ? (
          <Empty label="No meetings found." />
        ) : (
          <div className="flex flex-col h-full">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-white text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Title <span className="text-slate-300 ml-1">↑↓</span></th>
                  <th className="px-5 py-3.5">From</th>
                  <th className="px-5 py-3.5">To</th>
                  <th className="px-5 py-3.5">Related To <span className="text-slate-300 ml-1">⇅</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.slice(0, 4).map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">Meeting with {visit.customer?.firstName || visit.lead?.firstName || 'Client'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{fmtDate(visit.date)} 10:00 AM</td>
                    <td className="px-5 py-3.5 text-slate-500">{fmtDate(visit.date)} 11:00 AM</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <div className="flex items-center gap-2">
                        <UserRoundCheck className="size-3.5 text-slate-400" />
                        {visit.customer?.company || 'BetFlow Deals'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3 text-xs font-medium text-slate-500">
              <span>Total Records {visits.length}</span>
              <div className="flex items-center gap-1">
                <span className="cursor-pointer hover:text-slate-800 font-bold">{'<'}</span>
                <span className="mx-2">1 to {Math.min(4, visits.length)}</span>
                <span className="cursor-pointer hover:text-slate-800 font-bold">{'>'}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Today's Leads */}
      <Card title="Today's Leads" icon={UserRoundCheck} href="/leads">
        {todaysLeads.length === 0 ? (
          <Empty label="No Leads found." />
        ) : (
          <div className="flex flex-col h-full">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-white text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Lead Name <span className="text-slate-300 ml-1">↑↓</span></th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone <span className="text-slate-300 ml-1">⇅</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaysLeads.slice(0, 4).map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-indigo-600 hover:underline cursor-pointer">{lead.firstName} {lead.lastName}</td>
                    <td className="px-5 py-3.5 text-slate-500">{lead.company || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{lead.firstName.toLowerCase()}@example.com</td>
                    <td className="px-5 py-3.5 text-slate-500">+251 91 123 4567</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3 text-xs font-medium text-slate-500">
              <span>Total Records {todaysLeads.length}</span>
              <div className="flex items-center gap-1">
                <span className="cursor-pointer hover:text-slate-800 font-bold">{'<'}</span>
                <span className="mx-2">1 to {Math.min(4, todaysLeads.length)}</span>
                <span className="cursor-pointer hover:text-slate-800 font-bold">{'>'}</span>
              </div>
            </div>
          </div>
        )}
      </Card>


      {/* Global Open Tasks */}
      <Card title="Global Open Tasks" icon={ClipboardList} href="/tasks">
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
              {tasks.slice(0, 8).map((task: Task) => (
                <tr key={task.id}>
                  <td className="px-4 py-2.5 font-medium">{task.title}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{fmtDate(task.dueDate)}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={task.status} />
                  </td>
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
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role details
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Admin report data
  const [salesMetrics, setSalesMetrics] = useState<ReportMetric[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceReport[]>([]);

  // Finance data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [paymentAging, setPaymentAging] = useState<PaymentAgingRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch user roles from access token
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("betflow-auth") ??
          window.sessionStorage.getItem("betflow-auth")
        : null;

    let roles: string[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const token = parsed.accessToken;
        if (token) {
          const base64Url = token.split(".")[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const rawBinary = window.atob(base64);
            const jsonPayload = decodeURIComponent(
              rawBinary
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            roles = JSON.parse(jsonPayload).roles ?? [];
          }
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
    setUserRoles(roles);

    try {
      const primaryRole = roles[0] || "Agent";

      if (primaryRole === "Owner" || primaryRole === "Admin") {
        const [salesData, agentPerformanceData, leadsData, tasksData, visitsData, dealsData] = await Promise.all([
          apiFetch<any>("/reports/sales").catch(() => ({ metrics: [] })),
          apiFetch<any[]>("/reports/agents").catch(() => []),
          apiFetch<any[]>("/leads").catch(() => []),
          apiFetch<any[]>("/tasks?open=true").catch(() => []),
          apiFetch<any[]>("/site-visits").catch(() => []),
          apiFetch<any[]>("/deals").catch(() => []),
        ]);
        setSalesMetrics(salesData.metrics ?? []);
        setAgentPerformance(agentPerformanceData);
        setLeads(leadsData);
        setTasks(tasksData);
        setVisits(visitsData);
        setDeals([...dealsData].sort((a, b) => Number(b.value) - Number(a.value)));
      } else if (primaryRole === "Finance") {
        const [paymentsData, contractsData, paymentAgingData, salesData] =
          await Promise.all([
            apiFetch<Payment[]>("/payments"),
            apiFetch<Contract[]>("/contracts"),
            apiFetch<PaymentAgingRow[]>("/reports/payment-aging"),
            apiFetch<{ metrics: ReportMetric[] }>("/reports/sales"),
          ]);
        setPayments(paymentsData);
        setContracts(contractsData);
        setPaymentAging(paymentAgingData);
        setSalesMetrics(salesData.metrics ?? []);
      } else {
        // Agent or default
        const [tasksData, visitsData, dealsData, leadsData] = await Promise.all([
          apiFetch<Task[]>("/tasks?open=true"),
          apiFetch<SiteVisit[]>("/site-visits"),
          apiFetch<Deal[]>("/deals"),
          apiFetch<Lead[]>("/leads"),
        ]);
        setTasks(tasksData);
        setVisits(visitsData);
        setDeals([...dealsData].sort((a, b) => Number(b.value) - Number(a.value)));
        setLeads(leadsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const primaryRole = userRoles[0] || "Agent";
  const todaysLeads = leads.filter((lead) => isToday(lead.createdAt));

  return (
    <DashboardShell
      title="Home"
      description={`CRM overview tailored for the ${primaryRole} role.`}
      active="Dashboard"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading dashboard view…</p>
      ) : (
        <>
          {/* 1. ADMIN / OWNER DASHBOARD VIEW */}
          {(primaryRole === "Owner" || primaryRole === "Admin") && (
            <>

              <ZohoOperationalGrid tasks={tasks} visits={visits} todaysLeads={todaysLeads} deals={deals} />

              <div className="grid gap-4 xl:grid-cols-2">
              </div>

            </>
          )}

          {/* 2. FINANCE DASHBOARD VIEW */}
          {primaryRole === "Finance" && (
            <>
              {/* Cash & Sales Overview */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {salesMetrics.map((m, idx) => (
                  <div key={idx} className="rounded-lg border border-zinc-200 bg-white p-4">
                    <p className="text-sm font-medium text-zinc-500">{m.label}</p>
                    <p className="text-2xl font-bold mt-1 text-zinc-900">{m.value}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{m.detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {/* Payment Aging Report */}
                <Card title="Aged Receivables" icon={PiggyBank} href="/reports">
                  {paymentAging.length === 0 ? (
                    <Empty label="No aging analysis recorded." />
                  ) : (
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-zinc-50 text-zinc-500">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Aging Range</th>
                          <th className="px-4 py-2.5 font-medium">Amount Due</th>
                          <th className="px-4 py-2.5 font-medium">Invoices Count</th>
                          <th className="px-4 py-2.5 font-medium">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {paymentAging.map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 font-medium">{row.range}</td>
                            <td className="px-4 py-2.5 text-zinc-900 font-semibold">
                              {money(row.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-600">{row.count}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                                {row.percentage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>

                {/* Recent Payments Received */}
                <Card title="Recent Collections" icon={Receipt} href="/payments">
                  {payments.length === 0 ? (
                    <Empty label="No payments recorded." />
                  ) : (
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-zinc-50 text-zinc-500">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Date</th>
                          <th className="px-4 py-2.5 font-medium">Amount</th>
                          <th className="px-4 py-2.5 font-medium">Method</th>
                          <th className="px-4 py-2.5 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {payments.slice(0, 8).map((pay) => (
                          <tr key={pay.id}>
                            <td className="px-4 py-2.5 text-zinc-600">{fmtDate(pay.date)}</td>
                            <td className="px-4 py-2.5 text-zinc-900 font-medium">
                              {money(pay.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-zinc-600">{pay.method}</td>
                            <td className="px-4 py-2.5">
                              <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>

                {/* Contracts Overview */}
                <div className="xl:col-span-2">
                  <Card title="Contracts & Agreements" icon={FileText} href="/contracts">
                    {contracts.length === 0 ? (
                      <Empty label="No active contracts." />
                    ) : (
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500">
                          <tr>
                            <th className="px-4 py-2.5 font-medium">Agreement Title</th>
                            <th className="px-4 py-2.5 font-medium">Value</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium">Created Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {contracts.slice(0, 5).map((con) => (
                            <tr key={con.id}>
                              <td className="px-4 py-2.5 font-medium">{con.title}</td>
                              <td className="px-4 py-2.5 text-zinc-900 font-semibold">
                                {money(con.value)}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={cn(
                                    "rounded px-2 py-0.5 text-xs font-medium",
                                    con.status === "SIGNED"
                                      ? "bg-emerald-50 text-emerald-800"
                                      : "bg-amber-50 text-amber-800"
                                  )}
                                >
                                  {con.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-zinc-600">{fmtDate(con.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* 3. AGENT / GENERAL DASHBOARD VIEW */}
          {primaryRole !== "Owner" && primaryRole !== "Admin" && primaryRole !== "Finance" && (
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
                            <td className="px-4 py-2.5">
                              <StatusBadge status={task.status} />
                            </td>
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
                            <td className="px-4 py-2.5">
                              <StatusBadge status={visit.status} />
                            </td>
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
                            <td className="px-4 py-2.5 text-zinc-600">
                              {lead.source?.name ?? "—"}
                            </td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={lead.status} />
                            </td>
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
        </>
      )}
    </DashboardShell>
  );
}
