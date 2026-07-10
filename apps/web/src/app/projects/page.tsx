"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Building2, Plus, Search, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "SELLING", "COMPLETED", "ON_HOLD"] as const;

type ApiProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  unitsCount: number;
  _count: { buildings: number };
};

const statusClass: Record<string, string> = {
  PLANNING: "bg-zinc-100 text-zinc-700",
  ACTIVE: "bg-sky-100 text-sky-700",
  SELLING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-rose-100 text-rose-700",
};

const inputClass =
  "h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400";

function label(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", status: "ACTIVE", description: "" });

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiFetch<ApiProject[]>("/projects");
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term),
    );
  }, [projects, query]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiProject>("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          status: form.status,
          description: form.description || null,
        }),
      });
      setForm({ name: "", status: "ACTIVE", description: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Projects"
      description="Developments, buildings, floors, and unit inventory."
      active="Projects"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-9 w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-zinc-500 sm:w-72">
          <Search className="size-4 shrink-0" />
          <input
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
          />
        </label>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "New project"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-3 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-3"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name *"
            className={cn(inputClass, "sm:col-span-2")}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={inputClass}
            aria-label="Status"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            className={cn(inputClass, "sm:col-span-3")}
          />
          <div className="sm:col-span-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {error && (
          <p className="border-b border-zinc-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading projects…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">
            {projects.length === 0 ? "No projects yet." : "No projects match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Buildings</th>
                  <th className="px-4 py-3 font-medium">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((project) => (
                  <tr key={project.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-2 font-medium text-blue-600 hover:underline"
                      >
                        <Building2 className="size-4 shrink-0 text-zinc-400" />
                        <span>
                          {project.name}
                          {project.description && (
                            <span className="block text-xs font-normal text-zinc-400">
                              {project.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", statusClass[project.status] ?? "bg-zinc-100 text-zinc-700")}>
                        {label(project.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{project._count.buildings}</td>
                    <td className="px-4 py-3 text-zinc-600">{project.unitsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-zinc-200 px-4 py-2.5 text-xs text-zinc-500">
          {loading ? "Loading…" : `${filtered.length} of ${projects.length} projects`}
        </div>
      </div>
    </DashboardShell>
  );
}