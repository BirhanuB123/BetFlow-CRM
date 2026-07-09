"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Trash2, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  assignee: { id: string; firstName: string; lastName: string } | null;
  entityType: string | null;
  entityId: string | null;
};

type UserOption = { id: string; name: string };

const statusClass: Record<string, string> = {
  TODO: "bg-zinc-100 text-zinc-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  DONE: "bg-emerald-50 text-emerald-700",
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
  const [filter, setFilter] = useState<TaskStatus | "ALL" | "OPEN">("OPEN");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
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
      // Assignee options need Owner/Admin; tolerate a 403 for regular users.
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

  const visible = useMemo(() => {
    if (filter === "ALL") return tasks;
    if (filter === "OPEN") return tasks.filter((t) => t.status !== "DONE");
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

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
          dueDate: form.dueDate || undefined,
          assigneeId: form.assigneeId || undefined,
          status: form.status,
        }),
      });
      setForm({ title: "", description: "", dueDate: "", assigneeId: "", status: "TODO" });
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
        <Link href={`/customers/${task.entityId}`} className="text-[#334cff] hover:underline">
          Customer
        </Link>
      );
    }
    return task.entityType;
  };

  const filters: Array<{ key: TaskStatus | "ALL" | "OPEN"; label: string }> = [
    { key: "OPEN", label: "Open" },
    { key: "ALL", label: "All" },
    { key: "TODO", label: "To do" },
    { key: "IN_PROGRESS", label: "In progress" },
    { key: "DONE", label: "Done" },
  ];

  return (
    <DashboardShell
      title="Tasks"
      description="Follow-up work across leads, customers, and deals."
      active="Tasks"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  filter === f.key
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
            {showForm ? "Cancel" : "New task"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
          >
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm sm:col-span-2"
            />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm sm:col-span-2"
            />
            <label className="grid gap-1 text-xs font-medium text-zinc-500">
              Due date
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-zinc-500">
              Assignee
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
                disabled={users.length === 0}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create task"}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="border-b border-zinc-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading tasks…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No tasks in this view.</p>
        ) : (
          <CrmTable
            columns={["Task", "Assignee", "Related to", "Due", "Status", ""]}
            rows={visible.map((task) => [
              <div key="title">
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-zinc-500">{task.description}</p>
                )}
              </div>,
              task.assignee
                ? `${task.assignee.firstName} ${task.assignee.lastName}`
                : "Unassigned",
              relatedTo(task),
              fmtDate(task.dueDate),
              <select
                key="status"
                value={task.status}
                onChange={(e) => changeStatus(task.id, e.target.value)}
                className={cn(
                  "h-7 rounded-md border-0 px-2 text-xs font-medium",
                  statusClass[task.status] ?? "bg-zinc-100 text-zinc-700",
                )}
                aria-label={`Status for ${task.title}`}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>,
              <button
                key="delete"
                type="button"
                onClick={() => handleDelete(task.id)}
                className="text-zinc-400 transition-colors hover:text-red-600"
                aria-label="Delete task"
              >
                <Trash2 className="size-4" />
              </button>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
