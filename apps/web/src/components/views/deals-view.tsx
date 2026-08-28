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
  GripVertical,
  Trash2,
  Pencil,
  LayoutGrid,
  List,
} from "lucide-react";

import { CrmTable } from "@/components/tables/crm-table";
import { PipelineBoard } from "@/components/tables/pipeline-board";
import { Button } from "@/components/ui/button";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { PipelineSkeleton } from "@/components/ui/skeleton-loaders";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import type {
  DealStage as Stage,
  ApiDeal,
  CustomerOption,
  NewDeal,
} from "@betflow/shared";

function formatValue(value: string | number) {
  return formatCurrency(value);
}

export function DealsView() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const [viewMode, setViewMode] = useState<"KANBAN" | "BOARD">("KANBAN");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
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
  const [editingDeal, setEditingDeal] = useState<{
    id: string;
    name: string;
    value: string;
    customerId: string;
    stageId: string;
  } | null>(null);

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

  const handleUpdateDeal = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingDeal) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiDeal>(`/deals/${editingDeal.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingDeal.name,
          value: editingDeal.value,
          customerId: editingDeal.customerId,
          stageId: editingDeal.stageId,
        }),
      });
      setEditingDeal(null);
      success("Deal updated successfully");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deal");
      toastError("Failed to update deal");
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

  const handleDeleteDeal = (dealId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Deal",
      message:
        "Are you sure you want to delete this deal opportunity? This action cannot be undone.",
      onConfirm: async () => {
        try {
          setDeals((prev) => prev.filter((d) => d.id !== dealId));
          await apiFetch(`/deals/${dealId}`, { method: "DELETE" });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          success("Deal deleted successfully");
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to delete deal",
          );
          toastError("Failed to delete deal");
          await load();
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Edit Deal Modal */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="size-4 text-primary" />
                Edit Deal Opportunity
              </h3>
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Opportunity Name *
                </label>
                <input
                  required
                  value={editingDeal.name}
                  onChange={(e) =>
                    setEditingDeal({ ...editingDeal, name: e.target.value })
                  }
                  placeholder="e.g. Saron Taddesse - Penthouse Deal"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deal Value Amount (ETB) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingDeal.value}
                  onChange={(e) =>
                    setEditingDeal({ ...editingDeal, value: e.target.value })
                  }
                  placeholder="Payment / deal value amount"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary font-mono font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Associated Client / Customer *
                </label>
                <select
                  required
                  aria-label="Customer option"
                  value={editingDeal.customerId}
                  onChange={(e) =>
                    setEditingDeal({
                      ...editingDeal,
                      customerId: e.target.value,
                    })
                  }
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="">Select customer…</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pipeline Stage *
                </label>
                <select
                  required
                  aria-label="Stage option"
                  value={editingDeal.stageId}
                  onChange={(e) =>
                    setEditingDeal({
                      ...editingDeal,
                      stageId: e.target.value,
                    })
                  }
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="">Select stage…</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.probability}% win probability)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDeal(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-9 text-xs font-semibold"
                >
                  {saving ? "Saving Changes…" : "Update Deal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metric Summary Cards */}
      <StatRow>
        <StatCard
          label="Total Pipeline Volume"
          value={formatValue(totalPipelineVolume)}
          detail={`${filteredDeals.length} active opportunities`}
          color="indigo"
        />
        <StatCard
          label="Weighted Forecast Volume"
          value={formatValue(weightedForecastVolume)}
          detail="Adjusted for stage probability"
          color="emerald"
        />
        <StatCard
          label="Average Deal Size"
          value={formatValue(avgDealValue)}
          detail="Average deal value"
          color="blue"
        />
      </StatRow>

      {/* Toolbar: Search + View Toggle + Action */}
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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle Button */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setViewMode("KANBAN")}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer",
                viewMode === "KANBAN"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <LayoutGrid className="size-3.5 shrink-0" />
              <span>Full Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("BOARD")}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer",
                viewMode === "BOARD"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <List className="size-3.5 shrink-0" />
              <span>Compact Board</span>
            </button>
          </div>

          <Button
            onClick={() => setShowForm((value) => !value)}
            disabled={customers.length === 0 || stages.length === 0}
            className="w-full sm:w-auto h-9 text-xs font-semibold"
          >
            {showForm ? (
              <X className="size-4 mr-1.5 shrink-0" />
            ) : (
              <Plus className="size-4 mr-1.5 shrink-0" />
            )}
            <span>{showForm ? "Cancel" : "New Deal Opportunity"}</span>
          </Button>
        </div>
      </div>

      {/* Create Deal Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="grid gap-3.5 rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Deal Opportunity Name *"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Deal Value ($) *"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
          />
          <select
            required
            aria-label="Customer option"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
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
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
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
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
          {error}
        </p>
      )}

      {/* Render View Mode */}
      {viewMode === "BOARD" ? (
        <PipelineBoard />
      ) : loading ? (
        <PipelineSkeleton columns={4} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:overflow-x-auto gap-4 pb-2">
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
                  className="w-full md:w-72 md:min-w-72 md:shrink-0 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 flex flex-col shadow-xs"
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3 px-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {stage.name}
                        </h2>
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
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
                      <span className="text-xs font-bold text-primary block">
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
                            "group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-grab active:cursor-grabbing",
                            draggingDealId === deal.id &&
                              "opacity-50 border-dashed border-primary",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <GripVertical className="size-4 text-slate-300 group-hover:text-primary/80 shrink-0" />
                              <h3 className="font-bold text-slate-900 text-xs truncate">
                                {deal.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingDeal({
                                    id: deal.id,
                                    name: deal.name,
                                    value: deal.value,
                                    customerId: deal.customer.id,
                                    stageId: deal.stage.id,
                                  })
                                }
                                className="text-slate-400 hover:text-primary p-0.5 cursor-pointer"
                                title="Edit deal details & payment amount"
                                aria-label="Edit deal"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDeal(deal.id)}
                                className="text-slate-400 hover:text-destructive p-0.5 cursor-pointer"
                                title="Delete deal"
                                aria-label="Delete deal"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="mt-2 text-xs text-slate-600 font-medium">
                            👤 {deal.customer.firstName}{" "}
                            {deal.customer.lastName}
                            {deal.unit
                              ? ` · 🏢 Unit ${deal.unit.unitNumber}`
                              : ""}
                          </p>

                          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                            <span className="font-extrabold text-primary">
                              {formatValue(deal.value)}
                            </span>
                            <span className="text-[11px] font-semibold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded">
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
                            onChange={(e) => moveStage(deal.id, e.target.value)}
                            className="mt-3 h-7 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-700 outline-none hover:border-primary/30"
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
                  "Actions",
                ]}
                rows={filteredDeals.map((deal) => {
                  const val = Number(deal.value) || 0;
                  const weighted = Math.round(
                    val * ((deal.stage?.probability ?? 0) / 100),
                  );
                  return [
                    <span key="name" className="font-bold text-primary">
                      {deal.name}
                    </span>,
                    `${deal.customer?.firstName ?? ""} ${deal.customer?.lastName ?? ""}`,
                    deal.unit ? `Unit ${deal.unit.unitNumber}` : "—",
                    formatValue(deal.value),
                    <span
                      key="stage"
                      className="inline-flex items-center rounded-md bg-primary/10 border border-primary/10 px-2 py-0.5 text-xs font-bold text-primary"
                    >
                      {deal.stage?.name}
                    </span>,
                    `${deal.stage?.probability ?? 0}%`,
                    <span key="weighted" className="font-bold text-success">
                      {formatValue(weighted)}
                    </span>,
                    <div key="actions" className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingDeal({
                            id: deal.id,
                            name: deal.name,
                            value: deal.value,
                            customerId: deal.customer?.id ?? "",
                            stageId: deal.stage?.id ?? "",
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Pencil className="size-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>,
                  ];
                })}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
