"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ApiContract = {
  id: string;
  startDate: string;
  endDate: string | null;
  totalAmt: string;
  status: string;
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string; type: string; status: string };
  deal: { id: string; name: string } | null;
  _count: { payments: number; schedules: number };
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type UnitOption = { id: string; unitNumber: string; type: string };

const statusClass: Record<string, string> = {
  ACTIVE: "bg-sky-100 text-sky-700",
  PENDING_SIGNATURE: "bg-amber-100 text-amber-700",
  SIGNED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

function formatAmount(value: string) {
  return formatCurrency(value);
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    unitId: "",
    startDate: "",
    totalAmt: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contractsData, customersData, unitsData] = await Promise.all([
        apiFetch<ApiContract[]>("/contracts"),
        apiFetch<CustomerOption[]>("/customers"),
        apiFetch<UnitOption[]>("/units"),
      ]);
      setContracts(contractsData);
      setCustomers(customersData);
      setUnits(unitsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiContract>("/contracts", {
        method: "POST",
        body: JSON.stringify({ ...form, status: "PENDING_SIGNATURE" }),
      });
      setForm({ customerId: "", unitId: "", startDate: "", totalAmt: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract");
    } finally {
      setSaving(false);
    }
  };

  const markSigned = async (id: string) => {
    setError(null);
    try {
      await apiFetch(`/contracts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "SIGNED" }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign contract");
    }
  };

  return (
    <DashboardShell
      title="Contracts"
      description="Sale agreements linked to units, customers, and deals."
      active="Contracts"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Contracts</h2>
            <p className="text-sm text-zinc-500">
              Signing a contract marks its unit as sold.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((value) => !value)}
            disabled={!showForm && (customers.length === 0 || units.length === 0)}
          >
            {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
            {showForm ? "Cancel" : "New contract"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
          >
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
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="">Select unit…</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unitNumber} · {unit.type}
                </option>
              ))}
            </select>
            <label className="grid gap-1 text-xs font-medium text-zinc-500">
              Start date
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-zinc-500">
              Total amount
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.totalAmt}
                onChange={(e) => setForm({ ...form, totalAmt: e.target.value })}
                placeholder="0.00"
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create contract"}
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
          <p className="p-6 text-sm text-zinc-500">Loading contracts…</p>
        ) : contracts.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No contracts yet.</p>
        ) : (
          <CrmTable
            columns={[
              "Customer",
              "Unit",
              "Total",
              "Start",
              "Payments",
              "Status",
              "Actions",
            ]}
            rows={contracts.map((contract) => [
              <span key="customer" className="font-medium">
                {contract.customer.firstName} {contract.customer.lastName}
              </span>,
              `Unit ${contract.unit.unitNumber}`,
              formatAmount(contract.totalAmt),
              new Date(contract.startDate).toLocaleDateString(),
              contract._count.payments,
              <span
                key="status"
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  statusClass[contract.status] ?? "bg-zinc-100 text-zinc-700",
                )}
              >
                {contract.status}
              </span>,
              contract.status !== "SIGNED" ? (
                <Button
                  key="sign"
                  size="xs"
                  onClick={() => markSigned(contract.id)}
                >
                  Mark signed
                </Button>
              ) : (
                <span key="sign" className="text-xs text-zinc-400">
                  Unit sold
                </span>
              ),
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
