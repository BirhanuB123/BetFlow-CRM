"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const UNIT_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"] as const;
type UnitStatus = (typeof UNIT_STATUSES)[number];

type ApiUnit = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  price: string;
  area: number | null;
  floor: {
    id: string;
    floorNumber: number;
    name: string | null;
    building: {
      id: string;
      name: string;
      project: { id: string; name: string };
    };
  };
  _count: { deals: number; reservations: number; contracts: number };
};

const statusClass: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  RESERVED: "bg-amber-100 text-amber-700",
  SOLD: "bg-zinc-200 text-zinc-700",
};

function formatPrice(value: string) {
  return formatCurrency(value);
}

export default function UnitsPage() {
  const [units, setUnits] = useState<ApiUnit[]>([]);
  const [filter, setFilter] = useState<UnitStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch all units so the stat cards stay accurate; filter client-side.
      const data = await apiFetch<ApiUnit[]>("/units");
      setUnits(data);
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

  return (
    <DashboardShell
      title="Units"
      description="Unit status, pricing, and availability controls."
      active="Units"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={cn(
            "rounded-lg border bg-white p-4 text-left transition",
            filter === "ALL" ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400",
          )}
        >
          <p className="text-sm font-medium text-zinc-500">All units</p>
          <p className="mt-3 text-2xl font-semibold">{units.length}</p>
        </button>
        {UNIT_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-lg border bg-white p-4 text-left transition",
              filter === status ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400",
            )}
          >
            <p className="text-sm font-medium text-zinc-500">
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </p>
            <p className="mt-3 text-2xl font-semibold">{counts[status]}</p>
            <span
              className={cn(
                "mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium",
                statusClass[status],
              )}
            >
              Unit status
            </span>
          </button>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Unit availability</h2>
            <p className="text-sm text-zinc-500">
              Live inventory synced with reservations and contracts.
            </p>
          </div>
        </div>

        {error && (
          <p className="border-b border-zinc-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading units…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No units match this filter.</p>
        ) : (
          <CrmTable
            columns={[
              "Unit",
              "Project",
              "Building",
              "Floor",
              "Type",
              "Area",
              "Price",
              "Status",
              "Override",
            ]}
            rows={visible.map((unit) => [
              <span key="unit" className="font-medium">
                {unit.unitNumber}
              </span>,
              unit.floor.building.project.name,
              unit.floor.building.name,
              unit.floor.name ?? `Floor ${unit.floor.floorNumber}`,
              unit.type,
              unit.area != null ? `${unit.area.toLocaleString()} sqm` : "—",
              formatPrice(unit.price),
              <span
                key="status"
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  statusClass[unit.status] ?? "bg-zinc-100 text-zinc-700",
                )}
              >
                {unit.status}
              </span>,
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
    </DashboardShell>
  );
}
