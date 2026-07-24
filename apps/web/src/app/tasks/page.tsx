"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Trash2,
  X,
  FileText,
  Building2,
  Building,
  Landmark,
  FileSignature,
  Coins,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Sparkles,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

const TASK_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
type TaskPriority = (typeof TASK_PRIORITIES)[number];

const TASK_CATEGORIES = [
  "PROPOSAL_PREPARATION",
  "SITE_VISIT_PREP",
  "BANK_MORTGAGE_DOCS",
  "CONTRACT_DRAFTING",
  "PAYMENT_COLLECTION",
  "CLIENT_FOLLOWUP",
] as const;
type TaskCategory = (typeof TASK_CATEGORIES)[number];

type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  priority?: string;
  category?: string;
  assignee: { id: string; firstName: string; lastName: string } | null;
  entityType: string | null;
  entityId: string | null;
};

type UserOption = { id: string; firstName: string; lastName: string } | null;

const statusClass: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityClass: Record<string, string> = {
  HIGH: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
  LOW: "bg-slate-100 text-slate-600 border-slate-200 font-normal",
};

const categoryLabels: Record<string, string> = {
  PROPOSAL_PREPARATION: "Pro-Forma / Proposal Prep (ፕሮፎርማ)",
  SITE_VISIT_PREP: "Site Visit Prep (የቦታ ጉብኝት ዝግጅት)",
  BANK_MORTGAGE_DOCS: "Bank Mortgage Docs (የባንክ ብድር ሰነድ)",
  CONTRACT_DRAFTING: "Contract Drafting (ውል ማዘጋጀት)",
  PAYMENT_COLLECTION: "Payment Collection (ክፍያ መሰብሰብ)",
  CLIENT_FOLLOWUP: "Client Follow-Up (የደንበኛ ክትትል)",
};

const categoryIcons: Record<string, typeof FileText> = {
  PROPOSAL_PREPARATION: FileText,
  SITE_VISIT_PREP: Building2,
  BANK_MORTGAGE_DOCS: Landmark,
  CONTRACT_DRAFTING: FileSignature,
  PAYMENT_COLLECTION: Coins,
  CLIENT_FOLLOWUP: PhoneCall,
};

function label(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"OPEN" | "ALL" | "HIGH_PRIORITY" | "DUE_TODAY" | "DONE">("OPEN");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "PROPOSAL_PREPARATION" as TaskCategory,
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
    assigneeId: "",
    status: "TODO" as TaskStatus,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasksData = await apiFetch<ApiTask[]>("/tasks");
      setTasks(tasksData);
      try {
        const usersData = await apiFetch<UserOption[]>("/users");
        setUsers(usersData);
      } catch {
        setUsers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const visible = useMemo(() => {
    if (filter === "ALL") return tasks;
    if (filter === "OPEN") return tasks.filter((t) => t.status !== "DONE");
    if (filter === "HIGH_PRIORITY") return tasks.filter((t) => t.priority === "HIGH");
    if (filter === "DUE_TODAY") {
      return tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= startOfDay && new Date(t.dueDate) <= endOfDay);
    }
    if (filter === "DONE") return tasks.filter((t) => t.status === "DONE");
    return tasks;
  }, [tasks, filter, startOfDay, endOfDay]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiTask>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          assigneeId: form.assigneeId || undefined,
          status: form.status,
        }),
      });
      setForm({
        title: "",
        description: "",
        category: "PROPOSAL_PREPARATION",
        priority: "MEDIUM",
        dueDate: "",
        assigneeId: "",
        status: "TODO",
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    setError(null);
    try {
      await apiFetch(`/tasks/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const relatedTo = (task: ApiTask) => {
    if (!task.entityType) return "—";
    if (task.entityType === "Customer" && task.entityId) {
      return (
        <Link href={`/customers/${task.entityId}`} className="font-semibold text-indigo-600 hover:underline">
          Customer
        </Link>
      );
    }
    return task.entityType;
  };

  const overdueCount = tasks.filter(
    (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < startOfDay
  ).length;
  const dueTodayCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= startOfDay && new Date(t.dueDate) <= endOfDay
  ).length;
  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH" && t.status !== "DONE").length;
  const completedCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <DashboardShell
      title="Real Estate Task Operations"
      description="Track pro-forma preparation, site visit logistics, bank mortgage document collection, and sales contracts."
      active="Tasks"
    >
      <div className="space-y-6">
        {/* Top KPI Queue Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-rose-600">Overdue Tasks</p>
              <AlertTriangle className="size-4 text-rose-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-rose-700">{overdueCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Past due deadline</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-600">Due Today</p>
              <Clock className="size-4 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-blue-700">{dueTodayCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Today's action items</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-600">High Priority Tasks</p>
              <Sparkles className="size-4 text-indigo-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{highPriorityCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Urgent sales tasks</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-600">Completed Tasks</p>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{completedCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Finished actions</p>
          </div>
        </div>

        {/* Section Header & Task Creator Button */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Ethiopian Real Estate Sales Tasks</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Organize pro-forma invoices, site visit arrangements, bank mortgage documents, & sales contracts.
              </p>
            </div>
            <Button
              onClick={() => setShowForm((v) => !v)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {showForm ? <X className="size-4 mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
              {showForm ? "Cancel Intake" : "Create New Task"}
            </Button>
          </div>

          {/* New Task Creator Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                Task Creation & Assignment Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title / Objective *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Prepare Pro-Forma Invoice for Bole 3-Bed Unit 14B"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Real Estate Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {TASK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="HIGH">High Priority (Urgent Action)</option>
                    <option value="MEDIUM">Medium Priority (Normal)</option>
                    <option value="LOW">Low Priority (Flexible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee Agent</label>
                  <select
                    value={form.assigneeId}
                    onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Unassigned (Open Team Task)</option>
                    {users.filter(Boolean).map((u) => (
                      <option key={u!.id} value={u!.id}>
                        {u!.firstName} {u!.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Instructions & Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Client requested 30% downpayment breakdown over 24 months with 30/70 bank mortgage calculation..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-indigo-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm">
                  {saving ? "Saving…" : "Create Real Estate Task"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
        </section>

        {/* Task Grid Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Table Filter Tabs */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter("OPEN")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "OPEN" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Open Tasks ({tasks.filter((t) => t.status !== "DONE").length})
              </button>

              <button
                onClick={() => setFilter("HIGH_PRIORITY")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "HIGH_PRIORITY" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                High Priority ({highPriorityCount})
              </button>

              <button
                onClick={() => setFilter("DUE_TODAY")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "DUE_TODAY" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Due Today ({dueTodayCount})
              </button>

              <button
                onClick={() => setFilter("DONE")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "DONE" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Completed ({completedCount})
              </button>

              <button
                onClick={() => setFilter("ALL")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                All ({tasks.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-slate-500">Loading sales tasks…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <ClipboardList className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No tasks in this view</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                You're all caught up! Click "Create New Task" to log a new real estate action item.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Task & Category</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Assignee</th>
                    <th className="px-5 py-3">Related To</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((task) => {
                    const CategoryIcon = categoryIcons[task.category ?? "CLIENT_FOLLOWUP"] ?? FileText;

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-start gap-2.5">
                            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 border border-indigo-100">
                              <CategoryIcon className="size-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{task.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {categoryLabels[task.category ?? "CLIENT_FOLLOWUP"] ?? "General Task"}
                              </p>
                              {task.description && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[220px] mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider border",
                              priorityClass[task.priority ?? "MEDIUM"] ?? priorityClass.MEDIUM
                            )}
                          >
                            {task.priority ?? "MEDIUM"}
                          </span>
                        </td>

                        <td className="px-5 py-3 font-medium text-slate-700">
                          {task.assignee ? (
                            <span className="inline-flex items-center gap-1.5">
                              <User className="size-3 text-slate-400" />
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="px-5 py-3 text-slate-600">{relatedTo(task)}</td>

                        <td className="px-5 py-3 font-medium text-slate-600">
                          {fmtDate(task.dueDate)}
                        </td>

                        <td className="px-5 py-3">
                          <select
                            value={task.status}
                            onChange={(e) => changeStatus(task.id, e.target.value)}
                            className={cn(
                              "h-7 rounded-md border-0 px-2.5 text-xs font-semibold shadow-2xs cursor-pointer",
                              statusClass[task.status] ?? "bg-slate-100 text-slate-700"
                            )}
                            aria-label={`Status for ${task.title}`}
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {label(s)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {task.status !== "DONE" && (
                              <Button
                                size="xs"
                                onClick={() => changeStatus(task.id, "DONE")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2 shadow-2xs"
                              >
                                Mark Done
                              </Button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(task.id)}
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
