"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Trash2,
  X,
  FileText,
  Building2,
  Landmark,
  FileSignature,
  Coins,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Sparkles,
  Search,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

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
  IN_PROGRESS:
    "bg-primary/10 text-[#233b66] border-primary/20 font-semibold",
  DONE: "bg-success/10 text-success border-success/20",
};

const priorityClass: Record<string, string> = {
  HIGH: "bg-destructive/10 text-destructive border-destructive/20 font-bold",
  MEDIUM: "bg-warning/10 text-warning border-warning/20 font-medium",
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
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TasksView() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [filter, setFilter] = useState<
    "OPEN" | "ALL" | "HIGH_PRIORITY" | "DUE_TODAY" | "DONE"
  >("OPEN");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Selections state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set(),
  );

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "PROPOSAL_PREPARATION" as TaskCategory,
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
    assigneeId: "",
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resTasks, resUsers] = await Promise.all([
        apiFetch("/tasks"),
        apiFetch("/users").catch(() => []),
      ]);

      if (Array.isArray(resTasks)) {
        setTasks(resTasks);
      } else {
        setTasks([]);
      }

      if (Array.isArray(resUsers)) {
        setUsers(resUsers);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const changeStatus = async (id: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
    try {
      await apiFetch(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      void fetchTasks();
    }
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    try {
      await apiFetch(`/tasks/${id}`, { method: "DELETE" });
    } catch {
      void fetchTasks();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedTaskIds.size} selected task(s)?`,
      )
    )
      return;

    const idsArr = Array.from(selectedTaskIds);
    setTasks((prev) => prev.filter((t) => !selectedTaskIds.has(t.id)));
    setSelectedTaskIds(new Set());

    try {
      await Promise.all(
        idsArr.map((id) =>
          apiFetch(`/tasks/${id}`, { method: "DELETE" }).catch(() => null),
        ),
      );
    } finally {
      void fetchTasks();
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedTaskIds.size === 0) return;

    const idsArr = Array.from(selectedTaskIds);
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.has(t.id) ? { ...t, status: newStatus } : t,
      ),
    );
    setSelectedTaskIds(new Set());

    try {
      await Promise.all(
        idsArr.map((id) =>
          apiFetch(`/tasks/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus }),
          }).catch(() => null),
        ),
      );
    } finally {
      void fetchTasks();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        assigneeId: form.assigneeId || null,
      };

      const newTask = await apiFetch<ApiTask>("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (newTask && newTask.id) {
        setTasks((prev) => [newTask, ...prev]);
      }
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        category: "PROPOSAL_PREPARATION",
        priority: "MEDIUM",
        dueDate: "",
        assigneeId: "",
      });
    } catch (err: any) {
      alert(err?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const open = tasks.filter((t) => t.status !== "DONE").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const high = tasks.filter(
      (t) => t.priority === "HIGH" && t.status !== "DONE",
    ).length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const dueToday = tasks.filter(
      (t) =>
        t.dueDate &&
        t.status !== "DONE" &&
        t.dueDate.slice(0, 10) === todayStr,
    ).length;

    return { total, open, done, high, dueToday };
  }, [tasks]);

  // Filtered task list
  const visible = useMemo(() => {
    return tasks.filter((t) => {
      // Main tab filter
      if (filter === "OPEN" && t.status === "DONE") return false;
      if (filter === "DONE" && t.status !== "DONE") return false;
      if (filter === "HIGH_PRIORITY" && t.priority !== "HIGH") return false;
      if (filter === "DUE_TODAY") {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (!t.dueDate || t.dueDate.slice(0, 10) !== todayStr) return false;
      }

      // Priority filter dropdown
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter)
        return false;

      // Assignee filter dropdown
      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED" && t.assignee !== null)
          return false;
        if (
          assigneeFilter !== "UNASSIGNED" &&
          t.assignee?.id !== assigneeFilter
        )
          return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q) || false;
        const matchAssignee = t.assignee
          ? `${t.assignee.firstName} ${t.assignee.lastName}`
              .toLowerCase()
              .includes(q)
          : false;
        if (!matchTitle && !matchDesc && !matchAssignee) return false;
      }

      return true;
    });
  }, [tasks, filter, priorityFilter, assigneeFilter, searchQuery]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((t) => selectedTaskIds.has(t.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(visible.map((t) => t.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-[#233b66] rounded-lg">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t("tasks.title")}
            </h2>
            <p className="text-xs text-slate-500">
              {t("tasks.subtitle")}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 font-semibold text-xs h-9"
        >
          {showForm ? (
            <>
              <X className="size-4" /> {t("actions.cancel")}
            </>
          ) : (
            <>
              <Plus className="size-4" /> {t("tasks.newTask")}
            </>
          )}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>{t("tasks.pendingTasks")}</span>
            <Clock className="size-4 text-info" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">
            {metrics.open}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>{t("tasks.priorityHigh")}</span>
            <AlertTriangle className="size-4 text-destructive" />
          </div>
          <p className="text-xl font-extrabold text-destructive font-mono">
            {metrics.high}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>{t("dashboard.openTasks")}</span>
            <Sparkles className="size-4 text-warning" />
          </div>
          <p className="text-xl font-extrabold text-warning font-mono">
            {metrics.dueToday}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>{t("tasks.completedTasks")}</span>
            <CheckCircle2 className="size-4 text-success" />
          </div>
          <p className="text-xl font-extrabold text-success font-mono">
            {metrics.done}
          </p>
        </div>
      </div>

      {/* New Task Form Card */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-primary/20 bg-white p-5 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="size-4 text-[#233b66]" /> Create Action Task
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Prepare Pro-Forma Invoice for Abebe Tadesse"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#233b66] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workflow Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as TaskCategory,
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#233b66] focus:outline-none"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#233b66] focus:outline-none"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#233b66] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                value={form.assigneeId}
                onChange={(e) =>
                  setForm({ ...form, assigneeId: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#233b66] focus:outline-none"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u?.id} value={u?.id}>
                    {u?.firstName} {u?.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Add context or specific instructions..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#233b66] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="size-sm text-xs"
            >
              {saving ? t("actions.save") + "..." : t("actions.save")}
            </Button>
          </div>
        </form>
      )}

      {/* Main Content Area: Filters, Bulk Bar, and Table */}
      <section className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {/* Filters and Controls Header */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg self-start">
            {(
              [
                { id: "OPEN", label: t("tasks.pendingTasks") },
                { id: "HIGH_PRIORITY", label: t("tasks.priorityHigh") },
                { id: "DUE_TODAY", label: t("dashboard.openTasks") },
                { id: "DONE", label: t("tasks.completedTasks") },
                { id: "ALL", label: t("tasks.allTasks") },
              ] as const
            ).map((tTab) => (
              <button
                key={tTab.id}
                onClick={() => setFilter(tTab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                  filter === tTab.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50",
                )}
              >
                {tTab.label}
              </button>
            ))}
          </div>

          {/* Search and Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t("tasks.searchTasks")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#233b66] w-40 sm:w-48"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-[#233b66]"
            >
              <option value="ALL">{t("tasks.priority")}: {t("tasks.allTasks")}</option>
              <option value="HIGH">{t("tasks.priorityHigh")}</option>
              <option value="MEDIUM">{t("tasks.priorityMedium")}</option>
              <option value="LOW">{t("tasks.priorityLow")}</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-[#233b66]"
            >
              <option value="ALL">{t("tasks.assignee")}: {t("tasks.allTasks")}</option>
              <option value="UNASSIGNED">{t("dashboard.unassigned")}</option>
              {users.map((u) => (
                <option key={u?.id} value={u?.id}>
                  {u?.firstName} {u?.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedTaskIds.size > 0 && (
          <div className="bg-primary/10 border-b border-primary/10 px-4 py-2 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Check className="size-4 text-primary" />
              <span>{selectedTaskIds.size} task(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() => void handleBulkStatusChange("DONE")}
                className="bg-white hover:bg-success/10 hover:text-success border-slate-300 text-slate-700 text-[11px]"
              >
                Mark Selected Done
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => void handleBulkDelete()}
                className="bg-white hover:bg-destructive/10 hover:text-destructive border-slate-300 text-destructive text-[11px]"
              >
                <Trash2 className="size-3 mr-1" /> {t("actions.delete")}
              </Button>
            </div>
          </div>
        )}

        {/* Error / Loading / Table */}
        {error && (
          <div className="p-4 text-xs text-destructive bg-destructive/10 border-b border-destructive/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading tasks…
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {t("tasks.noTasksFound")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-5 py-3">{t("tasks.taskTitle")}</th>
                  <th className="px-5 py-3">{t("tasks.assignee")}</th>
                  <th className="px-5 py-3">{t("tasks.priority")}</th>
                  <th className="px-5 py-3">{t("tasks.dueDate")}</th>
                  <th className="px-5 py-3">{t("dashboard.status")}</th>
                  <th className="px-5 py-3 text-right">{t("actions.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((task) => {
                  const CategoryIcon =
                    (task.category && categoryIcons[task.category]) ||
                    ClipboardList;
                  const isSelected = selectedTaskIds.has(task.id);

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "hover:bg-slate-50/70 transition-colors",
                        isSelected && "bg-primary/10/30",
                      )}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(task.id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>

                      <td className="px-5 py-3 max-w-xs sm:max-w-md truncate">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 mt-0.5 shrink-0">
                            <CategoryIcon className="size-3.5" />
                          </div>
                          <div className="truncate">
                            <p
                              className={cn(
                                "font-semibold text-slate-900 truncate",
                                task.status === "DONE" &&
                                  "line-through text-slate-400",
                              )}
                            >
                              {task.title}
                            </p>
                            {task.category && (
                              <p className="text-[11px] text-slate-500">
                                {categoryLabels[task.category] || task.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <User className="size-3.5 text-slate-400" />
                            <span>
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] border",
                            priorityClass[task.priority || "LOW"],
                          )}
                        >
                          {task.priority || "LOW"}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-slate-600 font-mono">
                        {fmtDate(task.dueDate)}
                      </td>

                      <td className="px-5 py-3">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            void changeStatus(task.id, e.target.value)
                          }
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[11px] font-medium outline-none cursor-pointer",
                            statusClass[task.status] ||
                              "bg-slate-100 text-slate-700",
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
                              onClick={() =>
                                void changeStatus(task.id, "DONE")
                              }
                              className="h-7 text-[11px] px-2 shadow-2xs font-medium"
                            >
                              Mark Done
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => void handleDeleteSingle(task.id, e)}
                            className="rounded p-1.5 text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        <div className="border-t border-slate-200 px-5 py-2.5 text-xs text-slate-500">
          {loading
            ? "Loading…"
            : `Total Tasks: ${visible.length} ${visible.length !== tasks.length ? `(Filtered from ${tasks.length})` : ""}`}
        </div>
      </section>
    </div>
  );
}
