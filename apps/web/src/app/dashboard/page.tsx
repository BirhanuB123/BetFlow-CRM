"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Building2,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

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

const statusTone: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20 font-medium",
  DONE: "bg-success/10 text-success border-success/20 font-medium",
  SCHEDULED: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20 font-medium",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  NO_SHOW: "bg-warning/10 text-warning border-warning/20",
  NEW: "bg-slate-100 text-slate-700 border-slate-200",
  QUALIFIED: "bg-success/10 text-success border-success/20 font-medium",
  CONTACTED: "bg-primary/10 text-primary border-primary/20",
  FOLLOW_UP: "bg-warning/10 text-warning border-warning/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
        statusTone[status] ?? "bg-slate-100 text-slate-700 border-slate-200",
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function customerLink(person: NonNullable<PersonRef>) {
  return (
    <Link
      href={`/customers/${person.id}`}
      className="font-semibold text-primary hover:text-primary hover:underline"
    >
      {person.firstName} {person.lastName}
    </Link>
  );
}

function Card({
  title,
  subtitle,
  icon: Icon,
  badge,
  href,
  variant = "primary",
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  badge?: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section
      className={cn(
        "flex flex-col min-w-0 rounded-xl border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md",
        variant === "primary"
          ? "border-slate-200/90 min-h-[340px] ring-1 ring-slate-900/5"
          : "border-slate-200/70 min-h-[290px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-13 items-center justify-between border-b px-4 sm:px-5",
          variant === "primary"
            ? "border-slate-200/80 bg-slate-50/80"
            : "border-slate-100 bg-slate-50/40",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg shrink-0",
              variant === "primary" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500",
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[13.5px] font-bold text-slate-800 tracking-tight truncate">
                {title}
              </h2>
              {badge}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
        >
          <span>{t("dashboard.viewAll")}</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-auto">{children}</div>
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 p-4">
      <div className="rounded-full bg-slate-50 p-3 shadow-inner border border-slate-100">
        <ClipboardList className="size-5 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

function OperationalGrid({ tasks, visits, todaysLeads, deals }: any) {
  const { t } = useTranslation();
  const openTasks = tasks.filter((t: any) => t.status !== "DONE" && t.status !== "CANCELLED");

  return (
    <div className="space-y-6">
      {/* Tier 1: High-Priority Time-Sensitive Action Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Time-Sensitive Action Items
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {openTasks.length} pending · {visits.length} scheduled
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* 1. Open Tasks (Primary Time-Sensitive) */}
          <Card
            title={t("dashboard.openTasks")}
            subtitle="Requires immediate agent follow-up & action"
            icon={ClipboardList}
            href="/tasks"
            variant="primary"
            badge={
              openTasks.length > 0 ? (
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning border border-warning/30">
                  {openTasks.length} Pending
                </span>
              ) : (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success border border-success/30">
                  All Done
                </span>
              )
            }
          >
            {tasks.length === 0 ? (
              <Empty label={t("dashboard.noTasks")} />
            ) : (
              <div className="flex flex-col h-full">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">{t("dashboard.taskTitle")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.dueDate")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.status")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.assignee")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.slice(0, 6).map((task: any) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {task.title}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-medium">
                          {fmtDate(task.dueDate)}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {task.assignee
                            ? `${task.assignee.firstName} ${task.assignee.lastName}`
                            : t("dashboard.unassigned")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 2. Scheduled Meetings & Site Visits (Primary Time-Sensitive) */}
          <Card
            title={t("dashboard.scheduledMeetings")}
            subtitle="Today's property walkthroughs & buyer meetings"
            icon={CalendarDays}
            href="/site-visits"
            variant="primary"
            badge={
              visits.length > 0 ? (
                <span className="rounded-full bg-info/15 px-2 py-0.5 text-[10px] font-bold text-info border border-info/30">
                  {visits.length} Scheduled
                </span>
              ) : null
            }
          >
            {visits.length === 0 ? (
              <Empty label={t("dashboard.noVisits")} />
            ) : (
              <div className="flex flex-col h-full">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">{t("dashboard.meetingVisit")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.date")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.status")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.client")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.slice(0, 6).map((visit: any) => (
                      <tr
                        key={visit.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          Site Visit with{" "}
                          {visit.customer?.firstName ||
                            visit.lead?.firstName ||
                            t("dashboard.client")}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-medium">
                          {fmtDate(visit.date)}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={visit.status} />
                        </td>
                        <td className="px-4 py-2.5">
                          {visit.customer ? (
                            customerLink(visit.customer)
                          ) : visit.lead ? (
                            <span className="font-semibold text-primary">
                              {visit.lead.firstName} {visit.lead.lastName}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Tier 2: Pipeline Quick References & Record Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pipeline Activity & Quick Reference
          </h2>
          <span className="text-xs text-slate-400">
            {todaysLeads.length} leads today · {deals.length} active opportunities
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* 3. Recent Leads */}
          <Card
            title={t("dashboard.todaysLeads")}
            icon={UserRoundCheck}
            href="/pipeline?tab=leads"
            variant="secondary"
          >
            {todaysLeads.length === 0 && leadsCount(todaysLeads, deals) === 0 ? (
              <Empty label={t("dashboard.noLeads")} />
            ) : (
              <div className="flex flex-col h-full">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/60 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">{t("dashboard.leadName")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.company")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.source")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(todaysLeads.length > 0 ? todaysLeads : deals.slice(0, 5)).map(
                      (item: any) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-semibold text-primary hover:underline">
                            {item.firstName
                              ? `${item.firstName} ${item.lastName}`
                              : item.name}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {item.company || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-medium">
                            {item.source?.name || "Direct Referral"}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={item.status || "NEW"} />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 4. Top Active Deals */}
          <Card
            title={t("dashboard.topDeals")}
            icon={WalletCards}
            href="/pipeline?tab=deals"
            variant="secondary"
          >
            {deals.length === 0 ? (
              <Empty label={t("dashboard.noDeals")} />
            ) : (
              <div className="flex flex-col h-full">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/60 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">{t("dashboard.dealName")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.value")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.stage")}</th>
                      <th className="px-4 py-2.5">{t("dashboard.customer")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deals.slice(0, 5).map((deal: Deal) => (
                      <tr
                        key={deal.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {deal.name}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-primary">
                          {money(deal.value)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                            {deal.stage.name}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">{customerLink(deal.customer)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function leadsCount(todays: any[], deals: any[]) {
  return todays.length || deals.length;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role & user details
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [salesMetrics, setSalesMetrics] = useState<ReportMetric[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const raw =
      typeof window !== "undefined"
        ? (window.localStorage.getItem("betflow-auth") ??
          window.sessionStorage.getItem("betflow-auth"))
        : null;

    let roles: string[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const name = parsed.user?.firstName || parsed.firstName || "";
        if (name) setFirstName(name);

        const token = parsed.accessToken;
        if (token) {
          const base64Url = token.split(".")[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const rawBinary = window.atob(base64);
            const jsonPayload = decodeURIComponent(
              rawBinary
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(""),
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
      const [tasksData, visitsData, dealsData, leadsData, salesData] =
        await Promise.all([
          apiFetch<Task[]>("/tasks?open=true").catch(() => []),
          apiFetch<SiteVisit[]>("/site-visits").catch(() => []),
          apiFetch<Deal[]>("/deals").catch(() => []),
          apiFetch<Lead[]>("/leads").catch(() => []),
          apiFetch<{ metrics: ReportMetric[] }>("/reports/sales").catch(() => ({
            metrics: [],
          })),
        ]);

      setTasks(tasksData);
      setVisits(visitsData);
      setDeals(
        [...dealsData].sort((a, b) => Number(b.value) - Number(a.value)),
      );
      setLeads(leadsData);
      setSalesMetrics(salesData.metrics ?? []);
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
  const openTasksCount = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length;
  const todayVisits = visits.filter((v) => isToday(v.date)).length;

  const totalPipelineValue = deals.reduce(
    (acc, d) => acc + (Number(d.value) || 0),
    0,
  );

  const pipelineByStage = useMemo(() => {
    const stageMap = new Map<string, { stage: string; value: number; count: number }>();
    for (const deal of deals) {
      const stageName = deal.stage?.name || "Unassigned";
      const current = stageMap.get(stageName) || { stage: stageName, value: 0, count: 0 };
      current.value += Number(deal.value) || 0;
      current.count += 1;
      stageMap.set(stageName, current);
    }
    return Array.from(stageMap.values());
  }, [deals]);

  const hour = new Date().getHours();
  let timeGreeting = t("dashboard.greetingEvening");
  if (hour < 12) {
    timeGreeting = t("dashboard.greetingMorning");
  } else if (hour < 18) {
    timeGreeting = t("dashboard.greetingAfternoon");
  }

  const greetingLine = firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <DashboardShell
      title={t("dashboard.home")}
      description={`${greetingLine} · ${todayFormatted} — ${t("dashboard.overviewForRole")} ${primaryRole}.`}
      active="Dashboard"
    >
      {error && (
        <p className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </p>
      )}

      {loading ? (
        <>
          <CardSkeleton count={4} />
          <div className="mt-6">
            <CardSkeleton count={4} />
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Pipeline Stage Distribution Chart */}
          {pipelineByStage.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Pipeline Volume by Deal Stage
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live commercial breakdown of active deal opportunities across sales pipeline stages.
                    </p>
                  </div>
                </div>
                <Link
                  href="/pipeline?tab=deals"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>{t("dashboard.viewAll")}</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              <div className="h-56 sm:h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineByStage} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="stage"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(val) =>
                        val >= 1_000_000
                          ? `${(val / 1_000_000).toFixed(0)}M`
                          : val >= 1_000
                          ? `${(val / 1_000).toFixed(0)}k`
                          : String(val)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [money(Number(value) || 0), "Pipeline Volume"]}
                      labelFormatter={(label) => `Stage: ${label}`}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Operational Grid Cards */}
          <OperationalGrid
            tasks={tasks}
            visits={visits}
            todaysLeads={todaysLeads}
            deals={deals}
          />

          {/* Recent Activity Section */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <ActivityTimeline title="System Activity Audit Log" limit={15} />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
