"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, Grid, Table as TableIcon, X, SquareStack, Home, Banknote, TrendingUp } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { PaymentPlanCalculation } from "@betflow/shared";

const UNIT_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"] as const;
type UnitStatus = (typeof UNIT_STATUSES)[number];

type StageInfo = {
  stageKey: string;
  label: string;
  badge: string;
  isMilestoneReady: boolean;
  progressPercentage: number;
};

type ApiUnit = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  price: string;
  area: number | null;
  stageInfo?: StageInfo;
  floor: {
    id: string;
    floorNumber: number;
    name: string | null;
    building: {
      id: string;
      name: string;
      project: {
        id: string;
        name: string;
        constructionStage?: string;
        progressPercentage?: number;
      };
    };
  };
  _count: { deals: number; reservations: number; contracts: number };
};

type StackingUnit = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  price: string;
  area: number | null;
  stageInfo?: StageInfo;
};

type StackingFloor = {
  id: string;
  floorNumber: number;
  name: string | null;
  units: StackingUnit[];
};

type StackingBuilding = {
  id: string;
  name: string;
  project?: {
    id: string;
    name: string;
    constructionStage?: string;
    progressPercentage?: number;
    stageInfo?: StageInfo;
  } | null;
  floors: StackingFloor[];
};

const statusClass: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-300",
  RESERVED: "bg-amber-100 text-amber-800 border-amber-300",
  SOLD: "bg-rose-100 text-rose-800 border-rose-300",
};

const statusTileBg: Record<string, string> = {
  AVAILABLE:
    "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100",
  RESERVED: "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100",
  SOLD: "bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100",
};

function formatPrice(value: string | number) {
  return formatCurrency(value);
}

export default function UnitsPage() {
  const { success } = useToast();
  const [selectedUnit, setSelectedUnit] = useState<ApiUnit | null>(null);
  const [units, setUnits] = useState<ApiUnit[]>([]);
  const [stackingPlan, setStackingPlan] = useState<StackingBuilding[]>([]);
  const [viewMode, setViewMode] = useState<"STACKING_PLAN" | "TABLE">(
    "STACKING_PLAN",
  );
  const [filter, setFilter] = useState<UnitStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected unit for Payment Plan Modal
  const [calcUnit, setCalcUnit] = useState<ApiUnit | StackingUnit | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsData, stackingData] = await Promise.all([
        apiFetch<ApiUnit[]>("/units"),
        apiFetch<StackingBuilding[]>("/units/stacking-plan"),
      ]);
      setUnits(unitsData);
      setStackingPlan(stackingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load units");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const result: Record<UnitStatus, number> = {
      AVAILABLE: 0,
      RESERVED: 0,
      SOLD: 0,
    };
    for (const unit of units) {
      if (unit.status in result) result[unit.status as UnitStatus] += 1;
    }
    return result;
  }, [units]);

  const visible = useMemo(
    () => (filter === "ALL" ? units : units.filter((u) => u.status === filter)),
    [units, filter],
  );

  const overrideStatus = async (unitId: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/units/${unitId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update unit");
    }
  };

  const kpiAvailable = units.filter((u) => u.status === "AVAILABLE").length;
  const kpiReserved = units.filter((u) => u.status === "RESERVED").length;
  const kpiSold = units.filter((u) => u.status === "SOLD").length;
  const kpiTotalValue = units
    .filter((u) => u.status === "AVAILABLE")
    .reduce((acc, u) => acc + (Number(u.price) || 0), 0);

  return (
    <DashboardShell
      title="Units & Stacking Plan"
      description="Interactive real estate unit visualizer & payment schedule calculator."
      active="Units"
    >

      {/* Top Header & View Mode Selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "STACKING_PLAN" ? "default" : "outline"}
            onClick={() => setViewMode("STACKING_PLAN")}
            className="h-9 gap-1.5"
          >
            <Grid className="size-4" />
            Interactive Stacking Matrix
          </Button>
          <Button
            variant={viewMode === "TABLE" ? "default" : "outline"}
            onClick={() => setViewMode("TABLE")}
            className="h-9 gap-1.5"
          >
            <TableIcon className="size-4" />
            Inventory Table
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            Available ({counts.AVAILABLE})
          </span>
          <span className="flex items-center gap-1 text-amber-800">
            <span className="size-2.5 rounded-full bg-amber-500" />
            Reserved ({counts.RESERVED})
          </span>
          <span className="flex items-center gap-1 text-rose-800">
            <span className="size-2.5 rounded-full bg-rose-500" />
            Sold ({counts.SOLD})
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* 1. INTERACTIVE STACKING PLAN VIEW */}
      {viewMode === "STACKING_PLAN" ? (
        <section className="space-y-6">
          {loading ? (
            <div className="p-4">
              <CardSkeleton count={3} />
            </div>
          ) : stackingPlan.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500">
              No building stacking data available.
            </p>
          ) : (
            stackingPlan.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs"
              >
                <div className="mb-4 flex flex-col gap-2 border-b border-zinc-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-zinc-900">
                        {b.name}
                      </h2>
                      {b.project?.stageInfo && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                          {b.project.stageInfo.badge} ({b.project.stageInfo.progressPercentage}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Project: {b.project?.name || "Main Tower"} · Floor-by-Floor Unit Elevation Matrix
                    </p>
                  </div>
                  <span className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    {b.floors.length} Floors
                  </span>
                </div>

                {/* Floors Elevation Grid */}
                <div className="space-y-3">
                  {b.floors.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-col gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="w-28 shrink-0 text-xs font-bold text-zinc-700">
                        {f.name || `Floor ${f.floorNumber}`}
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {f.units.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            className={cn(
                              "group relative flex cursor-pointer flex-col justify-between rounded-lg border p-2.5 shadow-2xs transition-all hover:scale-105 min-w-[125px] text-left",
                              statusTileBg[u.status] ??
                                "bg-white border-zinc-200",
                            )}
                            onClick={() => {
                              const fullUnit = units.find((apiU) => apiU.id === u.id);
                              if (fullUnit) setSelectedUnit(fullUnit);
                            }}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span>Unit {u.unitNumber}</span>
                              <span className="text-[10px] opacity-75">
                                {u.type}
                              </span>
                            </div>
                            <div className="mt-2 text-xs font-extrabold">
                              {formatPrice(u.price)}
                            </div>
                            {u.stageInfo && (
                              <div className="mt-1">
                                <span className="inline-block rounded bg-blue-100/80 px-1.5 py-0.5 text-[9px] font-semibold text-blue-800">
                                  {u.stageInfo.badge}
                                </span>
                              </div>
                            )}
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                              <span>{u.area ? `${u.area} m²` : "—"}</span>
                              <span 
                                className="font-semibold text-indigo-600 group-hover:underline flex items-center gap-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCalcUnit(u);
                                }}
                              >
                                <Calculator className="size-3" /> Plan
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      ) : (
        /* 2. INVENTORY TABLE VIEW */
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
            <div>
              <h2 className="text-base font-semibold">Unit availability</h2>
              <p className="text-sm text-zinc-500">
                Live inventory synced with reservations, construction stages, and contracts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as UnitStatus | "ALL")
                }
                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium"
              >
                <option value="ALL">All Statuses</option>
                {UNIT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={6} cols={6} />
            </div>
          ) : visible.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No units found"
                description={
                  filter === "ALL"
                    ? "No building property units found in inventory database."
                    : `No units currently match the "${filter}" filter.`
                }
                actionText={filter !== "ALL" ? "Reset Filter" : undefined}
                onAction={() => setFilter("ALL")}
                icon={SquareStack}
              />
            </div>
          ) : (
            <CrmTable
              columns={[
                "Unit",
                "Project & Construction Stage",
                "Building",
                "Floor",
                "Type",
                "Area",
                "Price",
                "Status",
                "Payment Plan",
                "Override",
              ]}
              rows={visible.map((unit) => [
                <span key="unit" className="font-medium">
                  {unit.unitNumber}
                </span>,
                <div key="project-stage">
                  <div className="font-medium">{unit.floor.building.project.name}</div>
                  {unit.stageInfo && (
                    <div className="text-[10px] font-semibold text-blue-600">
                      {unit.stageInfo.badge} ({unit.stageInfo.progressPercentage}%)
                    </div>
                  )}
                </div>,
                unit.floor.building.name,
                unit.floor.name ?? `Floor ${unit.floor.floorNumber}`,
                unit.type,
                unit.area != null ? `${unit.area.toLocaleString()} sqm` : "—",
                formatPrice(unit.price),
                <span
                  key="status"
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium border",
                    statusClass[unit.status] ?? "bg-zinc-100 text-zinc-700",
                  )}
                >
                  {unit.status}
                </span>,
                <Button
                  key="plan"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-[#233b66] border-[#233b66]/30 hover:bg-[#233b66]/5"
                  onClick={() => setCalcUnit(unit)}
                >
                  <Calculator className="size-3" /> Mortgage Calc
                </Button>,
                <select
                  key="override"
                  value={unit.status}
                  onChange={(e) => overrideStatus(unit.id, e.target.value)}
                  className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs"
                  aria-label={`Override status for unit ${unit.unitNumber}`}
                >
                  {UNIT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>,
              ])}
            />
          )}
        </section>
      )}

      {/* PAYMENT PLAN CALCULATOR MODAL */}
      {calcUnit ? (
        <PaymentPlanModal unit={calcUnit} onClose={() => setCalcUnit(null)} />
      ) : null}

      {selectedUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedUnit(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <span className={cn("flex size-10 items-center justify-center rounded-xl border text-sm font-bold", statusTileBg[selectedUnit.status] ?? "bg-slate-50 border-slate-200")}>
                {selectedUnit.unitNumber}
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Unit {selectedUnit.unitNumber}</h2>
                <p className="text-xs text-slate-500">{selectedUnit.type} · Floor {selectedUnit.floor.floorNumber} · {selectedUnit.floor.building.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Status</p>
                <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold", statusClass[selectedUnit.status] ?? "bg-slate-100 text-slate-700")}>
                  {selectedUnit.status}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Price</p>
                <p className="font-bold text-slate-900">{formatPrice(selectedUnit.price)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Area</p>
                <p className="font-semibold text-slate-700">{selectedUnit.area ? `${selectedUnit.area} m²` : "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Project</p>
                <p className="font-semibold text-slate-700 truncate">{selectedUnit.floor.building.project.name}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{selectedUnit._count.deals}</span> deals
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{selectedUnit._count.reservations}</span> reservations
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{selectedUnit._count.contracts}</span> contracts
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function PaymentPlanModal({
  unit,
  onClose,
}: {
  unit: ApiUnit | StackingUnit;
  onClose: () => void;
}) {
  const [downPercent, setDownPercent] = useState(15);
  const [handoverPercent, setHandoverPercent] = useState(35);
  const [installments, setInstallments] = useState(4);
  const [calculation, setCalculation] = useState<PaymentPlanCalculation | null>(
    null,
  );
  const [calculating, setCalculating] = useState(false);

  const calculate = useCallback(async () => {
    setCalculating(true);
    try {
      const res = await apiFetch<PaymentPlanCalculation>(
        "/payments/calculate-plan",
        {
          method: "POST",
          body: JSON.stringify({
            unitPrice: Number(unit.price),
            downPaymentPercent: downPercent,
            handoverPercent: handoverPercent,
            installmentsCount: installments,
          }),
        },
      );
      setCalculation(res);
    } catch (err) {
      console.error("Failed to calculate plan", err);
    } finally {
      setCalculating(false);
    }
  }, [unit.price, downPercent, handoverPercent, installments]);

  useEffect(() => {
    void calculate();
  }, [calculate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-[#233b66]" />
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Payment Plan Calculator — Unit {unit.unitNumber}
              </h2>
              <p className="text-xs text-zinc-500">
                {unit.type} · Total Value: {formatPrice(unit.price)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Inputs Controls */}
        <div className="my-4 grid gap-3 sm:grid-cols-3 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
          <div>
            <label className="text-xs font-semibold text-zinc-600">
              Booking / Down %
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={downPercent}
              onChange={(e) => setDownPercent(Number(e.target.value))}
              className="mt-1 h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600">
              Installment Count
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="mt-1 h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium"
            >
              <option value={2}>2 Installments (Semi-Annual)</option>
              <option value={4}>4 Installments (Quarterly)</option>
              <option value={8}>8 Installments (Bi-Quarterly)</option>
              <option value={12}>12 Installments (Monthly)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600">
              Handover %
            </label>
            <input
              type="number"
              min="10"
              max="60"
              value={handoverPercent}
              onChange={(e) => setHandoverPercent(Number(e.target.value))}
              className="mt-1 h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium"
            />
          </div>
        </div>

        {/* Calculation Summary */}
        {calculating ? (
          <p className="p-4 text-center text-xs text-zinc-500">
            Calculating schedule...
          </p>
        ) : calculation ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#233b66]/5 p-3 border border-[#233b66]/20 text-center">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase">
                  Down Payment
                </p>
                <p className="text-sm font-bold text-[#233b66]">
                  {formatPrice(calculation.downPaymentAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase">
                  Milestone Payment
                </p>
                <p className="text-sm font-bold text-zinc-900">
                  {formatPrice(calculation.installmentAmount)} / step
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase">
                  Handover Payment
                </p>
                <p className="text-sm font-bold text-emerald-700">
                  {formatPrice(calculation.handoverAmount)}
                </p>
              </div>
            </div>

            {/* Itemized Installment Table */}
            <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-600 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Milestone Description</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {calculation.schedule.map((item) => (
                    <tr
                      key={item.installmentNumber}
                      className="hover:bg-zinc-50"
                    >
                      <td className="px-3 py-2 font-bold text-zinc-400">
                        {item.installmentNumber}
                      </td>
                      <td className="px-3 py-2 font-medium text-zinc-800">
                        {item.label}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-zinc-900">
                        {formatPrice(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-2 border-t border-zinc-100 pt-3">
          <Button variant="outline" onClick={onClose} className="h-9">
            Close Calculator
          </Button>
        </div>
      </div>
    </div>
  );
}
