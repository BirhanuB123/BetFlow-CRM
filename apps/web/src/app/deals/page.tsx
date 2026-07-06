"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

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

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatValue(value: string) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : currency.format(parsed);
}

export default function DealsPage() {
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const dealsByStage = useMemo(() => {
    const map = new Map<string, ApiDeal[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const deal of deals) {
      const bucket = map.get(deal.stage.id);
      if (bucket) bucket.push(deal);
      else map.set(deal.stage.id, [deal]);
    }
    return map;
  }, [deals, stages]);

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
    try {
      await apiFetch(`/deals/${dealId}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stageId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move deal");
    }
  };

  return (
    <DashboardShell
      title="Deals"
      description="Pipeline board and deal economics."
      active="Deals"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {deals.length} active {deals.length === 1 ? "deal" : "deals"} across{" "}
          {stages.length} stages.
        </p>
        <Button
          onClick={() => setShowForm((value) => !value)}
          disabled={customers.length === 0 || stages.length === 0}
        >
          {showForm ? <X /> : <Plus />}
          {showForm ? "Cancel" : "New deal"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Deal name"
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Value"
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          />
          <select
            required
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
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
            value={form.stageId}
            onChange={(e) => setForm({ ...form, stageId: e.target.value })}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
          >
            <option value="">Select stage…</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save deal"}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading deals…</p>
      ) : (
        <>
          <div className="grid gap-4 overflow-x-auto xl:grid-cols-4">
            {stages.map((stage) => {
              const stageDeals = dealsByStage.get(stage.id) ?? [];
              return (
                <section
                  key={stage.id}
                  className="min-w-64 rounded-lg border border-zinc-200 bg-white"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                    <h2 className="text-sm font-semibold">{stage.name}</h2>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="grid gap-3 p-3">
                    {stageDeals.length > 0 ? (
                      stageDeals.map((deal) => (
                        <article
                          key={deal.id}
                          className="rounded-md border border-zinc-200 p-3"
                        >
                          <p className="text-sm font-semibold">{deal.name}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {deal.customer.firstName} {deal.customer.lastName}
                            {deal.unit ? ` · Unit ${deal.unit.unitNumber}` : ""}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {formatValue(deal.value)}
                            </span>
                            <span className="text-zinc-500">
                              {deal.stage.probability}%
                            </span>
                          </div>
                          <select
                            value={deal.stage.id}
                            onChange={(e) => moveStage(deal.id, e.target.value)}
                            className="mt-3 h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs"
                            aria-label="Move deal to stage"
                          >
                            {stages.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                        No active deals
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-4">
              <h2 className="text-base font-semibold">Deal list</h2>
              <p className="text-sm text-zinc-500">
                Forecast view across active opportunities.
              </p>
            </div>
            {deals.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">No deals yet.</p>
            ) : (
              <CrmTable
                columns={[
                  "Deal",
                  "Customer",
                  "Unit",
                  "Value",
                  "Stage",
                  "Probability",
                ]}
                rows={deals.map((deal) => [
                  <span key="name" className="font-medium">
                    {deal.name}
                  </span>,
                  `${deal.customer.firstName} ${deal.customer.lastName}`,
                  deal.unit ? `Unit ${deal.unit.unitNumber}` : "—",
                  formatValue(deal.value),
                  deal.stage.name,
                  `${deal.stage.probability}%`,
                ])}
              />
            )}
          </section>
        </>
      )}
    </DashboardShell>
  );
}