"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  ChevronDown,
  ChevronRight,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { NotesPanel } from "@/components/notes/notes-panel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const UNIT_TYPES = ["APARTMENT", "OFFICE", "SHOP", "STUDIO", "PENTHOUSE", "VILLA"];

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  unitsCount: number;
  _count: { buildings: number };
  buildings: BuildingNode[];
};
type BuildingNode = {
  id: string;
  name: string;
  floorsCount: number;
  unitsCount: number;
  _count: { floors: number };
};
type FloorNode = {
  id: string;
  floorNumber: number;
  name: string | null;
  _count: { units: number };
};
type UnitNode = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  price: string;
  area: number | null;
};

function money(v: string) {
  return formatCurrency(v);
}
const input = "h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400";
const unitStatusClass: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  RESERVED: "bg-amber-100 text-amber-700",
  SOLD: "bg-zinc-200 text-zinc-700",
};

// ---- Floor (with its units) ------------------------------------------------
function FloorSection({
  floor,
  onCountsChanged,
  onFloorDeleted,
}: {
  floor: FloorNode;
  onCountsChanged: () => void;
  onFloorDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState<UnitNode[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ unitNumber: "", type: "APARTMENT", price: "", area: "" });
  const [err, setErr] = useState<string | null>(null);

  const loadUnits = useCallback(async () => {
    setErr(null);
    try {
      setUnits(await apiFetch<UnitNode[]>(`/units?floorId=${floor.id}`));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load units");
    }
  }, [floor.id]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && units === null) void loadUnits();
  };

  const addUnit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await apiFetch("/units", {
        method: "POST",
        body: JSON.stringify({
          floorId: floor.id,
          unitNumber: form.unitNumber,
          type: form.type,
          price: form.price,
          area: form.area ? Number(form.area) : null,
        }),
      });
      setForm({ unitNumber: "", type: "APARTMENT", price: "", area: "" });
      setShowForm(false);
      await loadUnits();
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add unit");
    }
  };

  const deleteUnit = async (id: string) => {
    setErr(null);
    try {
      await apiFetch(`/units/${id}`, { method: "DELETE" });
      await loadUnits();
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete unit");
    }
  };

  const deleteFloor = async () => {
    if (!window.confirm("Delete this floor?")) return;
    setErr(null);
    try {
      await apiFetch(`/properties/floors/${floor.id}`, { method: "DELETE" });
      onFloorDeleted();
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete floor");
    }
  };

  return (
    <div className="rounded-md border border-zinc-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={toggle} className="flex flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronRight className="size-4 text-zinc-400" />}
          <Layers className="size-4 text-zinc-400" />
          <span className="text-sm font-medium">
            {floor.name || `Floor ${floor.floorNumber}`}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
            {floor._count.units} units
          </span>
        </button>
        <button type="button" onClick={deleteFloor} className="text-zinc-300 hover:text-red-600" aria-label="Delete floor">
          <Trash2 className="size-4" />
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-100 p-3">
          {err && <p className="mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{err}</p>}
          {units === null ? (
            <p className="text-xs text-zinc-400">Loading units…</p>
          ) : units.length === 0 ? (
            <p className="text-xs text-zinc-400">No units on this floor.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {units.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-1.5 text-sm">
                  <span className="w-24 font-medium">{u.unitNumber}</span>
                  <span className="w-24 text-zinc-500">{u.type}</span>
                  <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", unitStatusClass[u.status] ?? "bg-zinc-100 text-zinc-600")}>{u.status}</span>
                  <span className="ml-auto text-zinc-600">{money(u.price)}</span>
                  <button type="button" onClick={() => deleteUnit(u.id)} className="text-zinc-300 hover:text-red-600" aria-label="Delete unit">
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showForm ? (
            <form onSubmit={addUnit} className="mt-3 grid gap-2 sm:grid-cols-4">
              <input required className={input} placeholder="Unit no. *" value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} />
              <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label="Unit type">
                {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="number" min="0" step="0.01" className={input} placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input type="number" min="0" className={input} placeholder="Area (sqm)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              <div className="sm:col-span-4 flex gap-2">
                <Button type="submit" size="sm">Add unit</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setShowForm(true)} className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Plus className="size-3.5" /> Add unit
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Building (with its floors) --------------------------------------------
function BuildingSection({
  building,
  onCountsChanged,
}: {
  building: BuildingNode;
  onCountsChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [floors, setFloors] = useState<FloorNode[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ floorNumber: "", name: "" });
  const [err, setErr] = useState<string | null>(null);

  const loadFloors = useCallback(async () => {
    setErr(null);
    try {
      setFloors(await apiFetch<FloorNode[]>(`/properties/floors?buildingId=${building.id}`));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load floors");
    }
  }, [building.id]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && floors === null) void loadFloors();
  };

  const addFloor = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await apiFetch("/properties/floors", {
        method: "POST",
        body: JSON.stringify({
          buildingId: building.id,
          floorNumber: Number(form.floorNumber),
          name: form.name || null,
        }),
      });
      setForm({ floorNumber: "", name: "" });
      setShowForm(false);
      await loadFloors();
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add floor");
    }
  };

  const deleteBuilding = async () => {
    if (!window.confirm("Delete this building?")) return;
    setErr(null);
    try {
      await apiFetch(`/properties/buildings/${building.id}`, { method: "DELETE" });
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete building");
    }
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <button type="button" onClick={toggle} className="flex flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronRight className="size-4 text-zinc-400" />}
          <Building className="size-4 text-zinc-500" />
          <span className="font-semibold">{building.name}</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">{building._count.floors} floors</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">{building.unitsCount} units</span>
        </button>
        <button type="button" onClick={deleteBuilding} className="text-zinc-300 hover:text-red-600" aria-label="Delete building">
          <Trash2 className="size-4" />
        </button>
      </div>

      {open && (
        <div className="space-y-2 p-4">
          {err && <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{err}</p>}
          {floors === null ? (
            <p className="text-sm text-zinc-400">Loading floors…</p>
          ) : floors.length === 0 ? (
            <p className="text-sm text-zinc-400">No floors yet.</p>
          ) : (
            floors.map((f) => (
              <FloorSection key={f.id} floor={f} onCountsChanged={onCountsChanged} onFloorDeleted={loadFloors} />
            ))
          )}

          {showForm ? (
            <form onSubmit={addFloor} className="mt-2 grid gap-2 sm:grid-cols-3">
              <input required type="number" className={input} placeholder="Floor number *" value={form.floorNumber} onChange={(e) => setForm({ ...form, floorNumber: e.target.value })} />
              <input className={input} placeholder="Label (e.g. Level 3)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Add floor</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Plus className="size-3.5" /> Add floor
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ---- Page ------------------------------------------------------------------
export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", floorsCount: "1" });
  const [timelineKey, setTimelineKey] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProject(await apiFetch<ProjectDetail>(`/projects/${id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const refresh = () => {
    void load();
    setTimelineKey((k) => k + 1);
  };

  const addBuilding = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/properties/buildings", {
        method: "POST",
        body: JSON.stringify({
          projectId: id,
          name: form.name,
          floorsCount: form.floorsCount ? Number(form.floorsCount) : 1,
        }),
      });
      setForm({ name: "", floorsCount: "1" });
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add building");
    }
  };

  return (
    <DashboardShell
      title={project ? project.name : "Project"}
      description="Buildings, floors, and unit inventory."
      active="Projects"
    >
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      {error && <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading project…</p>
      ) : !project ? (
        <p className="p-6 text-sm text-zinc-500">Project not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  {project.description && <p className="mt-1 text-sm text-zinc-500">{project.description}</p>}
                  <div className="mt-3 flex gap-6 text-sm text-zinc-600">
                    <span><span className="font-semibold">{project._count.buildings}</span> buildings</span>
                    <span><span className="font-semibold">{project.unitsCount}</span> units</span>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium">{project.status}</span>
                  </div>
                </div>
                <Button onClick={() => setShowForm((v) => !v)}>
                  <Plus className="size-4" /> Add building
                </Button>
              </div>

              {showForm && (
                <form onSubmit={addBuilding} className="mt-4 grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-3">
                  <input required className={cn(input, "sm:col-span-2")} placeholder="Building name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input type="number" min="1" className={input} placeholder="Floors" value={form.floorsCount} onChange={(e) => setForm({ ...form, floorsCount: e.target.value })} />
                  <div className="sm:col-span-3">
                    <Button type="submit" size="sm">Create building</Button>
                  </div>
                </form>
              )}
            </section>

            {project.buildings.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
                No buildings yet. Add one to start building out inventory.
              </p>
            ) : (
              project.buildings.map((b) => (
                <BuildingSection key={b.id} building={b} onCountsChanged={refresh} />
              ))
            )}
          </div>

          <div className="space-y-6 lg:col-span-1">
            <NotesPanel entityType="Project" entityId={project.id} onChange={() => setTimelineKey((k) => k + 1)} />
            <ActivityTimeline key={timelineKey} entityType="Project" entityId={project.id} title="Project activity" />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
