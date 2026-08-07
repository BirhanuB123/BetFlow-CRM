"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Plus,
  X,
  Search,
  DollarSign,
  TrendingUp,
  BarChart3,
  GripVertical,
  Trash2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Stage = { id: string; name: string; order: number; probability: number };
type DealCustomer = { id: string; firstName: string; lastName: string };
type DealUnit = { id: string; unitNumber: string; type: string } | null;

type ApiDeal = {
  id: string;
  name: string;
  value: string;
  stage: Stage;
  customer: DealCustomer;
  unit: DealUnit;
  createdAt: string;
};

type CustomerOption = { id: string; firstName: string; lastName: string };

type NewDeal = {
  name: string;
  value: string;
  customerId: string;
  stageId: string;
};

function formatValue(value: string | number) {
  return formatCurrency(value);
}

export default function DealsPage() {
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [form, setForm] = useState<NewDeal>({
    name: "",
    value: "",
    customerId: "",
    stageId: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealsData, stagesData, customersData] = await Promise.all([
        apiFetch<ApiDeal[]>("/deals"),
        apiFetch<Stage[]>("/deals/stages"),
        apiFetch<CustomerOption[]>("/customers"),
      ]);
      setDeals(dealsData);
      setStages(stagesData);
      setCustomers(customersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals;
    const term = search.trim().toLowerCase();
    return deals.filter((d) => {
      const nameMatch = d.name.toLowerCase().includes(term);
      const custMatch = `${d.customer.firstName} ${d.customer.lastName}`
        .toLowerCase()
        .includes(term);
      return nameMatch || custMatch;
    });
  }, [deals, search]);

  const dealsByStage = useMemo(() => {
    const map = new Map<string, ApiDeal[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const deal of filteredDeals) {
      const bucket = map.get(deal.stage.id);
      if (bucket) bucket.push(deal);
      else map.set(deal.stage.id, [deal]);
    }
    return map;
  }, [filteredDeals, stages]);

  // Economic metrics calculations
  const totalPipelineVolume = useMemo(() => {
    return filteredDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  }, [filteredDeals]);

  const weightedForecastVolume = useMemo(() => {
    return filteredDeals.reduce((sum, d) => {
      const val = Number(d.value) || 0;
      const prob = (d.stage?.probability ?? 0) / 100;
      return sum + val * prob;
    }, 0);
  }, [filteredDeals]);

  const avgDealValue = useMemo(() => {
    return filteredDeals.length > 0
      ? Math.round(totalPipelineVolume / filteredDeals.length)
      : 0;
  }, [filteredDeals, totalPipelineVolume]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiDeal>("/deals", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          value: form.value,
          customerId: form.customerId,
          stageId: form.stageId,
        }),
      });
      setForm({ name: "", value: "", customerId: "", stageId: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const moveStage = async (dealId: string, stageId: string) => {
    setError(null);
    // Optimistically update UI stage
    const targetStage = stages.find((s) => s.id === stageId);
    if (targetStage) {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d)),
      );
    }
    try {
      await apiFetch(`/deals/${dealId}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stageId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move deal");
      await load();
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal opportunity?"))
      return;
    try {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      await apiFetch(`/deals/${dealId}`, { method: "DELETE" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deal");
      await load();
    }
  };

  return (
    <DashboardShell
      title="Sales Kanban Pipeline"
      description="Track, manage, and move opportunities across your sales funnel."
      active="Deals"
    >
      <div className="space-y-6">
        {/* Toolbar: Search + Action */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-slate-500 sm:w-80">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              aria-label="Search deals"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by deal or customer name…"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <Button
            onClick={() => setShowForm((value) => !value)}
            disabled={customers.length === 0 || stages.length === 0}
            className="h-9 text-xs font-semibold"
          >
            {showForm ? (
              <X className="size-4 mr-1.5" />
            ) : (
              <Plus className="size-4 mr-1.5" />
            )}
            {showForm ? "Cancel" : "New Deal Opportunity"}
          </Button>
        </div>

        {/* Create Deal Form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
          >
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Deal Opportunity Name *"
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500"
            />
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="Deal Value ($) *"
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500"
            />
            <select
              required
              aria-label="Customer option"
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500"
            >
              <option value="">Select customer…</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
            <select
              required
              aria-label="Stage option"
              value={form.stageId}
              onChange={(e) => setForm({ ...form, stageId: e.target.value })}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500"
            >
              <option value="">Select stage…</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name} ({stage.probability}%)
                </option>
              ))}
            </select>
            <div className="col-span-full flex justify-end gap-2 pt-1">
              <Button
                type="submit"
                disabled={saving}
                className="h-9 text-xs font-semibold"
              >
                {saving ? "Saving Deal…" : "Save Opportunity"}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}

        {/* Interactive Kanban Board */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            Loading sales Kanban board…
          </div>
        ) : (
          <>
            <div className="grid gap-4 overflow-x-auto xl:grid-cols-4 pb-2">
              {stages.map((stage) => {
                const stageDeals = dealsByStage.get(stage.id) ?? [];
                const stageTotalVal = stageDeals.reduce(
                  (acc, d) => acc + (Number(d.value) || 0),
                  0,
                );

                return (
                  <section
                    key={stage.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dealId =
                        e.dataTransfer.getData("text/plain") || draggingDealId;
                      if (dealId) {
                        void moveStage(dealId, stage.id);
                        setDraggingDealId(null);
                      }
                    }}
                    className="min-w-72 flex-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 flex flex-col shadow-xs"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3 px-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            {stage.name}
                          </h2>
                          <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                            {stageDeals.length}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Win prob:{" "}
                          <span className="font-semibold text-slate-700">
                            {stage.probability}%
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-900 block">
                          {formatValue(stageTotalVal)}
                        </span>
                      </div>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-3 flex-1">
                      {stageDeals.length > 0 ? (
                        stageDeals.map((deal) => (
                          <article
                            key={deal.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", deal.id);
                              setDraggingDealId(deal.id);
                            }}
                            className={cn(
                              "group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md cursor-grab active:cursor-grabbing",
                              draggingDealId === deal.id &&
                                "opacity-50 border-dashed border-indigo-500",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <GripVertical className="size-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
                                <h3 className="font-bold text-slate-900 text-xs truncate">
                                  {deal.name}
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteDeal(deal.id)}
                                className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                aria-label="Delete deal"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-600 font-medium">
                              👤 {deal.customer.firstName}{" "}
                              {deal.customer.lastName}
                              {deal.unit
                                ? ` · 🏢 Unit ${deal.unit.unitNumber}`
                                : ""}
                            </p>

                            <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                              <span className="font-extrabold text-indigo-600">
                                {formatValue(deal.value)}
                              </span>
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                {Math.round(
                                  (Number(deal.value) || 0) *
                                    (stage.probability / 100),
                                )}{" "}
                                forecast
                              </span>
                            </div>

                            {/* Stage Selector Dropdown */}
                            <select
                              aria-label="Move stage"
                              value={deal.stage.id}
                              onChange={(e) =>
                                moveStage(deal.id, e.target.value)
                              }
                              className="mt-3 h-7 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-700 outline-none hover:border-indigo-300"
                            >
                              {stages.map((option) => (
                                <option key={option.id} value={option.id}>
                                  Stage: {option.name}
                                </option>
                              ))}
                            </select>
                          </article>
                        ))
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/50 p-4 text-center text-xs font-medium text-slate-400">
                          Drop deals here
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Opportunity Table View */}
            <section className="mt-6 rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50/70 p-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Opportunities Forecast Audit Table
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed financial breakdown of active sales opportunities.
                </p>
              </div>
              {filteredDeals.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500 font-medium">
                  No active opportunities found.
                </p>
              ) : (
                <CrmTable
                  columns={[
                    "Opportunity Name",
                    "Customer Account",
                    "Unit Linked",
                    "Raw Value",
                    "Stage",
                    "Win Prob %",
                    "Weighted Value",
                  ]}
                  rows={filteredDeals.map((deal) => {
                    const val = Number(deal.value) || 0;
                    const weighted = Math.round(
                      val * ((deal.stage?.probability ?? 0) / 100),
                    );
                    return [
                      <span key="name" className="font-bold text-indigo-600">
                        {deal.name}
                      </span>,
                      `${deal.customer.firstName} ${deal.customer.lastName}`,
                      deal.unit ? `Unit ${deal.unit.unitNumber}` : "—",
                      formatValue(deal.value),
                      <span
                        key="stage"
                        className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700"
                      >
                        {deal.stage.name}
                      </span>,
                      `${deal.stage.probability}%`,
                      <span
                        key="weighted"
                        className="font-bold text-emerald-600"
                      >
                        {formatValue(weighted)}
                      </span>,
                    ];
                  })}
                />
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
