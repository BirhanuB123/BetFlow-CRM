"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, Grid, Table as TableIcon, X, SquareStack, Building } from "lucide-react";

import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
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
  AVAILABLE: "bg-success/10 text-success border-success/30",
  RESERVED: "bg-warning/10 text-warning border-warning/30",
  SOLD: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusTileBg: Record<string, string> = {
  AVAILABLE:
    "bg-success/10 text-success border-success/30 hover:bg-success/10",
  RESERVED: "bg-warning/10 text-warning border-warning/30 hover:bg-warning/10",
  SOLD: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/10",
};

function formatPrice(value: string | number) {
  return formatCurrency(value);
}

interface UnitsViewProps {
  projectId?: string;
}

export function UnitsView({ projectId }: UnitsViewProps) {
  const { t } = useTranslation();
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
  const [downpaymentPct, setDownpaymentPct] = useState<number>(30);
  const [months, setMonths] = useState<number>(24);
  const [planCalc, setPlanCalc] = useState<PaymentPlanCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsData, stackingData] = await Promise.all([
        apiFetch<ApiUnit[]>("/units"),
        apiFetch<StackingBuilding[]>("/units/stacking-plan"),
      ]);

      let filteredUnits = unitsData;
      let filteredStacking = stackingData;

      if (projectId) {
        filteredUnits = unitsData.filter(
          (u) => u.floor?.building?.project?.id === projectId,
        );
        filteredStacking = stackingData.filter(
          (b) => b.project?.id === projectId,
        );
      }

      setUnits(filteredUnits);
      setStackingPlan(filteredStacking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load units");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

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

  const handleCalculatePlan = async () => {
    if (!calcUnit) return;
    setCalculating(true);
    try {
      const res = await apiFetch<PaymentPlanCalculation>(
        `/units/${calcUnit.id}/calculate-plan`,
        {
          method: "POST",
          body: JSON.stringify({
            downpaymentPercentage: downpaymentPct,
            installmentMonths: months,
          }),
        },
      );
      setPlanCalc(res);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to calculate plan");
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (calcUnit) {
      void handleCalculatePlan();
    } else {
      setPlanCalc(null);
    }
  }, [calcUnit, downpaymentPct, months]);

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "STACKING_PLAN" ? "default" : "outline"}
            onClick={() => setViewMode("STACKING_PLAN")}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Grid className="size-4" />
            Interactive Stacking Matrix
          </Button>
          <Button
            variant={viewMode === "TABLE" ? "default" : "outline"}
            onClick={() => setViewMode("TABLE")}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <TableIcon className="size-4" />
            Inventory Table
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-success">
            <span className="size-2.5 rounded-full bg-success" />
            {t("units.statusAvailable")} ({counts.AVAILABLE})
          </span>
          <span className="flex items-center gap-1 text-warning">
            <span className="size-2.5 rounded-full bg-warning" />
            {t("units.statusReserved")} ({counts.RESERVED})
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <span className="size-2.5 rounded-full bg-destructive" />
            {t("units.statusSold")} ({counts.SOLD})
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
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
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200/80">
              No building stacking data available for this selection.
            </div>
          ) : (
            stackingPlan.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs"
              >
                <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {b.name}
                      </h3>
                      {b.project?.stageInfo && (
                        <span className="inline-flex items-center rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-info border border-info/20">
                          {b.project.stageInfo.badge} ({b.project.stageInfo.progressPercentage}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Project: {b.project?.name || "Main Tower"} · Floor-by-Floor Unit Elevation Matrix
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {b.floors.length} Floors
                  </span>
                </div>

                {/* Floors Elevation Grid */}
                <div className="space-y-3">
                  {b.floors.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="w-28 shrink-0 text-xs font-bold text-slate-700">
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
                                "bg-white border-slate-200",
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
                                <span className="inline-block rounded bg-info/10/80 px-1.5 py-0.5 text-[9px] font-semibold text-info">
                                  {u.stageInfo.badge}
                                </span>
                              </div>
                            )}
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                              <span>{u.area ? `${u.area} m²` : "—"}</span>
                              <span 
                                className="font-semibold text-primary group-hover:underline flex items-center gap-0.5"
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
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-4 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Unit availability</h3>
              <p className="text-xs text-slate-500">
                Live inventory synced with reservations, construction stages, and contracts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as UnitStatus | "ALL")
                }
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700"
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
                <span key="unit" className="font-medium text-slate-900">
                  {unit.unitNumber}
                </span>,
                <div key="project-stage">
                  <div className="font-medium text-slate-800">{unit.floor.building.project.name}</div>
                  {unit.stageInfo && (
                    <div className="text-[10px] font-semibold text-info">
                      {unit.stageInfo.badge} ({unit.stageInfo.progressPercentage}%)
                    </div>
                  )}
                </div>,
                unit.floor.building.name,
                unit.floor.name ?? `Floor ${unit.floor.floorNumber}`,
                unit.type,
                unit.area ? `${unit.area} m²` : "—",
                formatPrice(unit.price),
                <span
                  key="status"
                  className={cn(
                    "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                    statusClass[unit.status] ?? "bg-slate-100 text-slate-700",
                  )}
                >
                  {unit.status}
                </span>,
                <Button
                  key="plan"
                  size="xs"
                  variant="outline"
                  onClick={() => setCalcUnit(unit)}
                  className="gap-1 text-[11px]"
                >
                  <Calculator className="size-3" /> Estimate
                </Button>,
                <select
                  key="override"
                  value={unit.status}
                  onChange={(e) => void overrideStatus(unit.id, e.target.value)}
                  className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] font-medium"
                >
                  {UNIT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>,
              ])}
            />
          )}
        </section>
      )}

      {/* Payment Plan Estimator Modal */}
      {calcUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-[#233b66]" />
                <h3 className="text-base font-bold text-slate-900">
                  Unit {calcUnit.unitNumber} Payment Estimator
                </h3>
              </div>
              <button
                onClick={() => setCalcUnit(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500 font-medium">Total Unit Price:</span>
                <span className="text-sm font-extrabold text-slate-900">{formatPrice(calcUnit.price)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Downpayment Percentage ({downpaymentPct}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={downpaymentPct}
                  onChange={(e) => setDownpaymentPct(Number(e.target.value))}
                  className="w-full accent-[#233b66]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Installment Term Months ({months} Months)
                </label>
                <input
                  type="range"
                  min="6"
                  max="48"
                  step="6"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full accent-[#233b66]"
                />
              </div>

              {planCalc && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Downpayment Amount:</span>
                    <span className="font-bold text-[#233b66]">{formatPrice(planCalc.downPaymentAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Handover Amount:</span>
                    <span className="font-semibold">{formatPrice(planCalc.handoverAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-primary/20 pt-2 text-slate-900 font-bold">
                    <span>Installment Amount:</span>
                    <span className="text-success text-sm">{formatPrice(planCalc.installmentAmount || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalcUnit(null)}
              >
                Close Calculator
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
