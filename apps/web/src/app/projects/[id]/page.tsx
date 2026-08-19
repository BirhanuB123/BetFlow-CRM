"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Building2,
  ChevronDown,
  ChevronRight,
  Grid,
  Layers,
  Plus,
  Trash2,
  Pencil,
  MapPin,
  CheckCircle2,
  Video,
  ExternalLink,
  Coins,
  ShieldCheck,
  Zap,
  Car,
  Droplets,
  CalendarDays,
  Sparkles,
  Image as ImageIcon,
  X,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { NotesPanel } from "@/components/notes/notes-panel";
import { UnitsView } from "@/components/views/units-view";
import { apiFetch, apiUpload, API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const UNIT_TYPES = [
  "APARTMENT",
  "OFFICE",
  "SHOP",
  "STUDIO",
  "PENTHOUSE",
  "VILLA",
];
const PROJECT_STATUSES = [
  "PLANNING",
  "ACTIVE",
  "SELLING",
  "COMPLETED",
  "ON_HOLD",
] as const;

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  category?: string;
  location?: string | null;
  subCity?: string | null;
  constructionStage?: string;
  progressPercentage?: number;
  estimatedDelivery?: string | null;
  coverImage?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  amenities?: string[];
  totalAreaSqm?: number | null;
  avgPricePerSqm?: string | number | null;
  status: string;
  unitsCount: number;
  availableUnitsCount?: number;
  reservedUnitsCount?: number;
  soldUnitsCount?: number;
  totalValueETB?: number;
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

const categoryLabels: Record<string, string> = {
  RESIDENTIAL_TOWER: "G+12/G+20 Residential Tower",
  LUXURY_VILLA_COMPOUND: "Luxury Villa Compound",
  COMMERCIAL_PLAZA: "Commercial Plaza / Mall",
  MIXED_USE_DEVELOPMENT: "Mixed-Use Tower",
  TOWN_HOUSES: "Modern Townhouses",
};

const subCityLabels: Record<string, string> = {
  BOLE: "Bole (ቦሌ)",
  KIRKOS: "Kirkos / Kazanchis (ቂርቆስ)",
  NIFAS_SILK_LAFTO: "Nifas Silk / Sarbet (ንፋስ ስልክ)",
  YEKA: "Yeka / CMC (የካ)",
  ARADA: "Arada / Piazza (አራዳ)",
  GULLELE: "Gullele (ጉለሌ)",
};

const stageLabels: Record<string, string> = {
  EXCAVATION_FOUNDATION: "Excavation & Foundation (15%)",
  STRUCTURE_CONCRETE_SLAB: "Structure & Slab Casting (45%)",
  BRICKWORK_PLASTERING: "Blockwork & Plastering (65%)",
  FINISHING_TILING: "Finishing & Elevators (85%)",
  HANDOVER_READY: "Handover Ready & Key Delivery (100%)",
};

const DEFAULT_AMENITIES = [
  "24/7 Standby Backup Generator (ባክአፕ ጀነሬተር)",
  "Dual Passenger Elevators (ሁለት ሊፍት)",
  "Underground Parking (የከርሰ ምድር መኪና ማቆሚያ)",
  "Water Reservoir & Borehole (የውሃ ታንከር)",
  "CCTV & 24/7 Security System (የደህንነት ካሜራ)",
  "Children's Play Area & Terrace (የህፃናት መጫወቻ)",
];

const PRESET_RENDERS = [
  {
    name: "Bole Luxury High-Rise Render",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kazanchis Glass Tower Render",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "CMC Villa Compound Render",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mixed-Use Commercial Plaza",
    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
  },
];

function money(v: string) {
  return formatCurrency(v);
}
const input =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 shadow-2xs";

const unitStatusClass: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
  RESERVED: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
  SOLD: "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
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
  const [form, setForm] = useState({
    unitNumber: "",
    type: "APARTMENT",
    price: "",
    area: "",
  });

  // Floor edit state
  const [editingFloor, setEditingFloor] = useState(false);
  const [floorNameInput, setFloorNameInput] = useState(floor.name || "");
  const [floorNumberInput, setFloorNumberInput] = useState(
    String(floor.floorNumber),
  );

  // Unit edit state
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editUnitForm, setEditUnitForm] = useState({
    unitNumber: "",
    type: "APARTMENT",
    status: "AVAILABLE",
    price: "",
    area: "",
  });

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

  const startEditUnit = (u: UnitNode) => {
    setEditingUnitId(u.id);
    setEditUnitForm({
      unitNumber: u.unitNumber,
      type: u.type,
      status: u.status,
      price: u.price,
      area: u.area ? String(u.area) : "",
    });
  };

  const saveUnitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUnitId) return;
    setErr(null);
    try {
      await apiFetch(`/units/${editingUnitId}`, {
        method: "PATCH",
        body: JSON.stringify({
          unitNumber: editUnitForm.unitNumber,
          type: editUnitForm.type,
          status: editUnitForm.status,
          price: editUnitForm.price,
          area: editUnitForm.area ? Number(editUnitForm.area) : null,
        }),
      });
      setEditingUnitId(null);
      await loadUnits();
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update unit");
    }
  };

  const saveFloorEdit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await apiFetch(`/properties/floors/${floor.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: floorNameInput || null,
          floorNumber: Number(floorNumberInput),
        }),
      });
      setEditingFloor(false);
      onFloorDeleted();
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update floor");
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
    <div className="rounded-lg border border-slate-200/80 bg-white shadow-2xs">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {editingFloor ? (
          <form
            onSubmit={saveFloorEdit}
            className="flex flex-1 items-center gap-2"
          >
            <input
              type="number"
              className={cn(input, "w-20")}
              placeholder="Floor #"
              value={floorNumberInput}
              onChange={(e) => setFloorNumberInput(e.target.value)}
              required
            />
            <input
              type="text"
              className={cn(input, "flex-1")}
              placeholder="Floor Label (e.g. 7th floor)"
              value={floorNameInput}
              onChange={(e) => setFloorNameInput(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditingFloor(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={toggle}
              className="flex flex-1 items-center gap-2 text-left"
            >
              {open ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
              <Layers className="size-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-800">
                {floor.name || `Floor ${floor.floorNumber}`}
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {floor._count.units} units
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEditingFloor(true)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
              title="Edit Floor"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={deleteFloor}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
              title="Delete floor"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="border-t border-slate-100 p-3 bg-slate-50/50">
          {err && (
            <p className="mb-2 rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600">
              {err}
            </p>
          )}
          {units === null ? (
            <p className="text-xs text-slate-400">Loading units…</p>
          ) : units.length === 0 ? (
            <p className="text-xs text-slate-400">No units on this floor.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg bg-white border border-slate-200/80">
              {units.map((u) => (
                <li key={u.id} className="p-2 text-xs">
                  {editingUnitId === u.id ? (
                    <form
                      onSubmit={saveUnitEdit}
                      className="grid gap-2 sm:grid-cols-5 items-center bg-indigo-50/50 p-2 rounded-md"
                    >
                      <input
                        required
                        className={input}
                        placeholder="Unit No."
                        value={editUnitForm.unitNumber}
                        onChange={(e) =>
                          setEditUnitForm({
                            ...editUnitForm,
                            unitNumber: e.target.value,
                          })
                        }
                      />
                      <select
                        className={input}
                        value={editUnitForm.type}
                        onChange={(e) =>
                          setEditUnitForm({
                            ...editUnitForm,
                            type: e.target.value,
                          })
                        }
                      >
                        {UNIT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <select
                        className={input}
                        value={editUnitForm.status}
                        onChange={(e) =>
                          setEditUnitForm({
                            ...editUnitForm,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="SOLD">SOLD</option>
                      </select>
                      <input
                        required
                        type="number"
                        step="0.01"
                        className={input}
                        placeholder="Price ETB"
                        value={editUnitForm.price}
                        onChange={(e) =>
                          setEditUnitForm({
                            ...editUnitForm,
                            price: e.target.value,
                          })
                        }
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          className={cn(input, "w-20")}
                          placeholder="Area sqm"
                          value={editUnitForm.area}
                          onChange={(e) =>
                            setEditUnitForm({
                              ...editUnitForm,
                              area: e.target.value,
                            })
                          }
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] h-8 px-2.5"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUnitId(null)}
                          className="text-[11px] h-8 px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3 px-1 py-1">
                      <span className="w-24 font-bold text-slate-900">
                        Unit {u.unitNumber}
                      </span>
                      <span className="w-24 text-slate-500 font-medium">
                        {u.type}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider border",
                          unitStatusClass[u.status] ??
                            "bg-slate-100 text-slate-600",
                        )}
                      >
                        {u.status}
                      </span>
                      <span className="ml-auto font-bold text-slate-900">
                        {money(u.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditUnit(u)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                        title="Edit Unit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUnit(u.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        title="Delete unit"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {showForm ? (
            <form
              onSubmit={addUnit}
              className="mt-3 grid gap-2 sm:grid-cols-4 rounded-lg bg-white p-3 border border-indigo-100"
            >
              <input
                required
                className={input}
                placeholder="Unit no. *"
                value={form.unitNumber}
                onChange={(e) =>
                  setForm({ ...form, unitNumber: e.target.value })
                }
              />
              <select
                className={input}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                aria-label="Unit type"
              >
                {UNIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className={input}
                placeholder="Price (ETB) *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                type="number"
                min="0"
                className={input}
                placeholder="Area (sqm)"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
              <div className="sm:col-span-4 flex gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  Add unit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <Plus className="size-3.5" /> Add Unit to Floor
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

  // Building edit state
  const [editingBuilding, setEditingBuilding] = useState(false);
  const [buildingNameInput, setBuildingNameInput] = useState(building.name);

  const [err, setErr] = useState<string | null>(null);

  const loadFloors = useCallback(async () => {
    setErr(null);
    try {
      setFloors(
        await apiFetch<FloorNode[]>(
          `/properties/floors?buildingId=${building.id}`,
        ),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load floors");
    }
  }, [building.id]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && floors === null) void loadFloors();
  };

  const saveBuildingEdit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await apiFetch(`/properties/buildings/${building.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: buildingNameInput,
        }),
      });
      setEditingBuilding(false);
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update building");
    }
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
      await apiFetch(`/properties/buildings/${building.id}`, {
        method: "DELETE",
      });
      onCountsChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete building");
    }
  };

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-50/50 px-4 py-3 border-b border-slate-100">
        {editingBuilding ? (
          <form
            onSubmit={saveBuildingEdit}
            className="flex flex-1 items-center gap-2"
          >
            <Building className="size-4 text-indigo-600" />
            <input
              required
              className={cn(input, "flex-1")}
              placeholder="Building Name (e.g. Block A)"
              value={buildingNameInput}
              onChange={(e) => setBuildingNameInput(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditingBuilding(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={toggle}
              className="flex flex-1 items-center gap-2 text-left"
            >
              {open ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
              <Building className="size-4 text-indigo-600" />
              <span className="font-bold text-slate-900">{building.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {building._count.floors} floors
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {building.unitsCount} units
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEditingBuilding(true)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
              title="Edit Building Name"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={deleteBuilding}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
              title="Delete building"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="space-y-3 p-4">
          {err && (
            <p className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-600">
              {err}
            </p>
          )}
          {floors === null ? (
            <p className="text-xs text-slate-400">Loading floors…</p>
          ) : floors.length === 0 ? (
            <p className="text-xs text-slate-400">No floors added yet.</p>
          ) : (
            floors.map((f) => (
              <FloorSection
                key={f.id}
                floor={f}
                onCountsChanged={onCountsChanged}
                onFloorDeleted={loadFloors}
              />
            ))
          )}

          {showForm ? (
            <form
              onSubmit={addFloor}
              className="mt-3 grid gap-2 sm:grid-cols-3 rounded-lg bg-slate-50 p-3 border border-slate-200"
            >
              <input
                required
                type="number"
                className={input}
                placeholder="Floor number *"
                value={form.floorNumber}
                onChange={(e) =>
                  setForm({ ...form, floorNumber: e.target.value })
                }
              />
              <input
                className={input}
                placeholder="Label (e.g. 5th Floor)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  Add floor
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <Plus className="size-3.5" /> Add Floor Level to Building
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ---- Ethiopian Construction Milestones Widget -------------------------------
const ETHIOPIAN_STAGES = [
  {
    key: "EXCAVATION_FOUNDATION",
    name: "Excavation & Foundation",
    amharic: "መሠረት",
    targetPercent: 15,
  },
  {
    key: "STRUCTURE_CONCRETE_SLAB",
    name: "Structure & Slab Casting",
    amharic: "ፍሬም",
    targetPercent: 45,
  },
  {
    key: "BRICKWORK_PLASTERING",
    name: "Blockwork & Plastering",
    amharic: "ፕላስተር",
    targetPercent: 65,
  },
  {
    key: "FINISHING_TILING",
    name: "Finishing & Elevators",
    amharic: "ፊኒሺንግ",
    targetPercent: 85,
  },
  {
    key: "HANDOVER_READY",
    name: "Handover Ready & Key Delivery",
    amharic: "ርክክብ",
    targetPercent: 100,
  },
];

function ConstructionMilestonesWidget({
  project,
  onUpdate,
}: {
  project: ProjectDetail;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [stage, setStage] = useState(
    project.constructionStage || "STRUCTURE_CONCRETE_SLAB",
  );
  const [progress, setProgress] = useState(
    String(project.progressPercentage ?? 50),
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const currentProgress = project.progressPercentage ?? 50;
  const currentStageIndex = ETHIOPIAN_STAGES.findIndex(
    (s) => s.key === project.constructionStage,
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await apiFetch(`/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          constructionStage: stage,
          progressPercentage: Number(progress),
        }),
      });
      setIsEditing(false);
      onUpdate();
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : "Failed to update construction stage",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="size-4 text-indigo-600" />
            Construction Milestones (የግንባታ ደረጃ)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real estate build progress & delivery tracking
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
        >
          <Pencil className="size-3" />
          {isEditing ? "Cancel" : "Update Stage"}
        </button>
      </div>

      {err && (
        <p className="rounded bg-rose-50 p-2 text-xs text-rose-600">{err}</p>
      )}

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="space-y-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Current Milestone Stage
            </label>
            <select
              className="w-full h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              value={stage}
              onChange={(e) => {
                const newStage = e.target.value;
                setStage(newStage);
                const matched = ETHIOPIAN_STAGES.find(
                  (s) => s.key === newStage,
                );
                if (matched) setProgress(String(matched.targetPercent));
              }}
            >
              {ETHIOPIAN_STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.amharic} - {s.name} ({s.targetPercent}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Completion Progress ({progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
            >
              {saving ? "Saving…" : "Save Progress"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          {/* Overall Progress Gauge */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">
                Overall Site Progress
              </span>
              <span className="font-extrabold text-indigo-600">
                {currentProgress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* 5-Step Ethiopian Milestone Tracker */}
          <div className="space-y-2 pt-1">
            {ETHIOPIAN_STAGES.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stg.key}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all",
                    isCurrent
                      ? "border-indigo-300 bg-indigo-50/80 font-semibold text-indigo-950 shadow-2xs"
                      : isPast
                        ? "border-slate-200 bg-emerald-50/40 text-slate-700"
                        : "border-slate-100 bg-white text-slate-400 opacity-75",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0",
                        isPast
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                            ? "bg-indigo-600 text-white ring-2 ring-indigo-200"
                            : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {isPast ? <CheckCircle2 className="size-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <p className="font-bold leading-tight">
                        <span className="text-indigo-600 mr-1">
                          [{stg.amharic}]
                        </span>
                        {stg.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0",
                      isCurrent
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : isPast
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200",
                    )}
                  >
                    {stg.targetPercent}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ---- Main Project Detail Page ----------------------------------------------
export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [buildingForm, setBuildingForm] = useState({
    name: "",
    floorsCount: "1",
  });
  const [timelineKey, setTimelineKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "STACKING" | "GALLERY">(
    "INVENTORY",
  );

  const [editForm, setEditForm] = useState({
    name: "",
    category: "RESIDENTIAL_TOWER",
    subCity: "BOLE",
    location: "",
    constructionStage: "STRUCTURE_CONCRETE_SLAB",
    progressPercentage: "50",
    estimatedDelivery: "Q4 2027",
    coverImage: "",
    videoUrl: "",
    description: "",
    status: "SELLING",
    selectedAmenities: [] as string[],
    galleryUrls: [] as string[],
    newGalleryUrl: "",
  });

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiFetch<ProjectDetail>(`/projects/${id}`);
      setProject(data);
      setEditForm({
        name: data.name,
        category: data.category ?? "RESIDENTIAL_TOWER",
        subCity: data.subCity ?? "BOLE",
        location: data.location ?? "",
        constructionStage: data.constructionStage ?? "STRUCTURE_CONCRETE_SLAB",
        progressPercentage: String(data.progressPercentage ?? 50),
        estimatedDelivery: data.estimatedDelivery ?? "Q4 2027",
        coverImage: data.coverImage ?? "",
        videoUrl: data.videoUrl ?? "",
        description: data.description ?? "",
        status: data.status,
        selectedAmenities: data.amenities ?? [],
        galleryUrls: data.gallery ?? [],
        newGalleryUrl: "",
      });
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

  const handleUpdateProject = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ProjectDetail>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          subCity: editForm.subCity,
          location: editForm.location || undefined,
          constructionStage: editForm.constructionStage,
          progressPercentage: Number(editForm.progressPercentage),
          estimatedDelivery: editForm.estimatedDelivery || undefined,
          coverImage: editForm.coverImage || undefined,
          gallery: editForm.galleryUrls,
          videoUrl: editForm.videoUrl || undefined,
          amenities: editForm.selectedAmenities,
          description: editForm.description || undefined,
          status: editForm.status,
        }),
      });
      setShowEditModal(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (
      !window.confirm(
        `Are you sure you want to delete project "${project.name}"? This will delete all associated building blocks, floors, and units.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" });
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const addBuilding = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/properties/buildings", {
        method: "POST",
        body: JSON.stringify({
          projectId: id,
          name: buildingForm.name,
          floorsCount: buildingForm.floorsCount
            ? Number(buildingForm.floorsCount)
            : 1,
        }),
      });
      setBuildingForm({ name: "", floorsCount: "1" });
      setShowBuildingForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add building");
    }
  };

  const toggleAmenity = (amenity: string) => {
    setEditForm((prev) => {
      const exists = prev.selectedAmenities.includes(amenity);
      return {
        ...prev,
        selectedAmenities: exists
          ? prev.selectedAmenities.filter((a) => a !== amenity)
          : [...prev.selectedAmenities, amenity],
      };
    });
  };

  const addGalleryPhoto = () => {
    if (!editForm.newGalleryUrl.trim()) return;
    setEditForm((prev) => ({
      ...prev,
      galleryUrls: [...prev.galleryUrls, prev.newGalleryUrl.trim()],
      newGalleryUrl: "",
    }));
  };

  const removeGalleryPhoto = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (file: File, type: "cover" | "gallery") => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiUpload<{ url: string }>("/uploads/image", formData);
      const fullUrl = `${API_BASE_URL.replace("/api", "")}${res.url}`;

      if (type === "cover") {
        setEditForm({ ...editForm, coverImage: fullUrl });
      } else {
        setEditForm((prev) => ({
          ...prev,
          galleryUrls: [...prev.galleryUrls, fullUrl],
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title={project ? project.name : "Real Estate Development"}
      description="Buildings, floor plans, 3D renderings, and real-time unit inventory."
      active="Projects"
    >
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to All Projects
        </Link>

        {project && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Pencil className="size-3.5 mr-1" /> Edit Specs & Renderings
            </Button>
            <Button
              onClick={handleDeleteProject}
              variant="outline"
              className="h-8 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5 mr-1" /> Delete Project
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">Loading project specs…</p>
        </div>
      ) : !project ? (
        <p className="p-6 text-sm text-slate-500">Project not found.</p>
      ) : (
        <div className="space-y-6">
          {/* Edit Project Modal */}
          {showEditModal && (
            <form
              onSubmit={handleUpdateProject}
              className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 p-5 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <Pencil className="size-4 text-indigo-600" />
                  Edit Real Estate Project Details & Renderings
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="RESIDENTIAL_TOWER">
                      G+12/G+20 Residential Tower
                    </option>
                    <option value="LUXURY_VILLA_COMPOUND">
                      Luxury Villa Compound
                    </option>
                    <option value="COMMERCIAL_PLAZA">
                      Commercial Plaza / Mall
                    </option>
                    <option value="MIXED_USE_DEVELOPMENT">
                      Mixed-Use Tower
                    </option>
                    <option value="TOWN_HOUSES">Modern Townhouses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Addis Ababa Sub-City
                  </label>
                  <select
                    value={editForm.subCity}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subCity: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {Object.entries(subCityLabels).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Location / Landmark
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Construction Progress Stage
                  </label>
                  <select
                    value={editForm.constructionStage}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        constructionStage: e.target.value,
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {Object.entries(stageLabels).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Progress Percentage (0 - 100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.progressPercentage}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        progressPercentage: e.target.value,
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Delivery Target
                  </label>
                  <input
                    type="text"
                    value={editForm.estimatedDelivery}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        estimatedDelivery: e.target.value,
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="sm:col-span-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    3D Cover Render Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://... or upload file"
                      value={editForm.coverImage}
                      onChange={(e) =>
                        setEditForm({ ...editForm, coverImage: e.target.value })
                      }
                      className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, "cover");
                      }}
                      className="hidden"
                      id="edit-cover-upload"
                    />
                    <label
                      htmlFor="edit-cover-upload"
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors h-9"
                    >
                      <ImageIcon className="size-4 mr-1.5" /> Upload
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Quick Presets:
                    </span>
                    {PRESET_RENDERS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setEditForm({ ...editForm, coverImage: preset.url })
                        }
                        className="rounded bg-white px-2.5 py-1 text-[10px] font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Overview & Description
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-indigo-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  {saving ? "Saving Changes…" : "Save Project Changes"}
                </Button>
              </div>
            </form>
          )}

          {/* Project Hero Banner Header */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-3">
              {/* Cover Render Image */}
              <div className="relative h-56 lg:h-auto bg-slate-900 overflow-hidden">
                {project.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
                    <Building2 className="size-12 text-indigo-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-300">
                      {categoryLabels[
                        project.category ?? "RESIDENTIAL_TOWER"
                      ] ?? "Real Estate Project"}
                    </p>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20">
                    {subCityLabels[project.subCity ?? "BOLE"] ?? "Addis Ababa"}
                  </span>
                </div>
              </div>

              {/* Specs & Progress Details */}
              <div className="p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-extrabold text-slate-900">
                      {project.name}
                    </h1>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="size-3.5 text-indigo-500" />
                    {project.location ??
                      `${subCityLabels[project.subCity ?? "BOLE"] ?? "Addis Ababa"}`}
                  </p>

                  {project.description && (
                    <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Amenities Badges */}
                  {project.amenities && project.amenities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.amenities.map((am) => (
                        <span
                          key={am}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200"
                        >
                          <CheckCircle2 className="size-3 text-indigo-600" />
                          {am}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Real-time Inventory & Financial Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">
                      Gross Valuation
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {formatCurrency(project.totalValueETB || 0)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase">
                      Available Units
                    </p>
                    <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                      {project.availableUnitsCount ?? 0} Units
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase">
                      Reserved Holds
                    </p>
                    <p className="text-sm font-extrabold text-amber-800 mt-0.5">
                      {project.reservedUnitsCount ?? 0} Units
                    </p>
                  </div>

                  <div className="rounded-lg bg-indigo-50 p-2.5 border border-indigo-100">
                    <p className="text-[10px] font-semibold text-indigo-700 uppercase">
                      Sold Units
                    </p>
                    <p className="text-sm font-extrabold text-indigo-900 mt-0.5">
                      {project.soldUnitsCount ?? 0} Units
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Inventory Tree vs Activity Side Panel */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {/* Tab Selector: Building Inventory vs Media Gallery */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab("INVENTORY")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                    activeTab === "INVENTORY"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Building className="size-4" />
                  Building & Unit Inventory Tree ({
                    project.buildings.length
                  }{" "}
                  Blocks)
                </button>

                <button
                  onClick={() => setActiveTab("STACKING")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                    activeTab === "STACKING"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Grid className="size-4" />
                  Stacking Matrix & Calculator
                </button>

                <button
                  onClick={() => setActiveTab("GALLERY")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                    activeTab === "GALLERY"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <ImageIcon className="size-4" />
                  3D Renderings & Media Gallery
                </button>
              </div>

              {activeTab === "STACKING" ? (
                <UnitsView projectId={project.id} />
              ) : activeTab === "INVENTORY" ? (
                <>
                  <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Project Buildings & Blocks
                        </h3>
                        <p className="text-xs text-slate-500">
                          Manage blocks, floor levels, and unit pricing.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowBuildingForm((v) => !v)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                      >
                        <Plus className="size-3.5 mr-1" /> Add Building Block
                      </Button>
                    </div>

                    {showBuildingForm && (
                      <form
                        onSubmit={addBuilding}
                        className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 border border-slate-200 sm:grid-cols-3"
                      >
                        <input
                          required
                          className={cn(input, "sm:col-span-2")}
                          placeholder="Building name (e.g. Tower A) *"
                          value={buildingForm.name}
                          onChange={(e) =>
                            setBuildingForm({
                              ...buildingForm,
                              name: e.target.value,
                            })
                          }
                        />
                        <input
                          type="number"
                          min="1"
                          className={input}
                          placeholder="Floors count"
                          value={buildingForm.floorsCount}
                          onChange={(e) =>
                            setBuildingForm({
                              ...buildingForm,
                              floorsCount: e.target.value,
                            })
                          }
                        />
                        <div className="sm:col-span-3">
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                          >
                            Create Building
                          </Button>
                        </div>
                      </form>
                    )}
                  </section>

                  {project.buildings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-white">
                      <Building className="size-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-800">
                        No building blocks added yet
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Click "Add Building Block" to start adding floors and
                        units to this project.
                      </p>
                    </div>
                  ) : (
                    project.buildings.map((b) => (
                      <BuildingSection
                        key={b.id}
                        building={b}
                        onCountsChanged={refresh}
                      />
                    ))
                  )}
                </>
              ) : (
                /* Media & Gallery View */
                <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Project Design Renderings & Gallery
                      </h3>
                      <p className="text-xs text-slate-500">
                        Architectural models, site progress photos, and video
                        tours.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowEditModal(true)}
                      variant="outline"
                      className="text-xs"
                    >
                      <Plus className="size-3.5 mr-1" /> Add Gallery Photo
                    </Button>
                  </div>

                  {project.coverImage && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        3D Architectural Cover Render
                      </p>
                      <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={project.coverImage}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {project.gallery && project.gallery.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Site Construction & Architectural Photos
                      </p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {project.gallery.map((url, i) => (
                          <div
                            key={url + i}
                            className="h-36 rounded-lg border border-slate-200 overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`Gallery ${i}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.videoUrl && (
                    <div className="rounded-lg bg-sky-50 p-4 border border-sky-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="size-5 text-sky-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Virtual Video Walkthrough
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {project.videoUrl}
                          </p>
                        </div>
                      </div>
                      <a
                        href={project.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-700"
                      >
                        <ExternalLink className="size-3" /> Watch Video
                      </a>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Side Panel: Construction Milestones Tracker & Activity Timeline */}
            <div className="space-y-6 lg:col-span-1">
              <ConstructionMilestonesWidget
                project={project}
                onUpdate={refresh}
              />
              <ActivityTimeline
                key={timelineKey}
                entityType="Project"
                entityId={project.id}
                title="Project activity log"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
