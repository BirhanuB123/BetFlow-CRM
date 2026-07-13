"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ApiPayment = {
  id: string;
  amount: string;
  method: string;
  status: string;
  date: string;
  contract: { id: string; status: string } | null;
  reservation: { id: string; status: string } | null;
};

type ContractOption = {
  id: string;
  customer: { firstName: string; lastName: string };
  unit: { unitNumber: string };
};
type ReservationOption = {
  id: string;
  customer: { firstName: string; lastName: string };
  unit: { unitNumber: string };
};

const PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER", "CHECK"] as const;
type TargetType = "contract" | "reservation";

const statusClass: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-rose-100 text-rose-700",
};

function formatAmount(value: string | number) {
  return formatCurrency(value);
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [reservations, setReservations] = useState<ReservationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    targetType: "contract" as TargetType,
    targetId: "",
    amount: "",
    method: "TRANSFER" as (typeof PAYMENT_METHODS)[number],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsData, contractsData, reservationsData] = await Promise.all([
        apiFetch<ApiPayment[]>("/payments"),
        apiFetch<ContractOption[]>("/contracts"),
        apiFetch<ReservationOption[]>("/reservations"),
      ]);
      setPayments(paymentsData);
      setContracts(contractsData);
      setReservations(reservationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalCollected = useMemo(
    () =>
      payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments],
  );

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiPayment>("/payments", {
        method: "POST",
        body: JSON.stringify({
          amount: form.amount,
          method: form.method,
          ...(form.targetType === "contract"
            ? { contractId: form.targetId }
            : { reservationId: form.targetId }),
        }),
      });
      setForm({ ...form, targetId: "", amount: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this payment?")) return;
    setError(null);
    try {
      await apiFetch(`/payments/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment");
    }
  };

  const targetOptions =
    form.targetType === "contract" ? contracts : reservations;

  return (
    <DashboardShell
      title="Payments"
      description="Record and track payments against contracts and reservations."
      active="Payments"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total collected"
          value={formatAmount(totalCollected)}
          detail="Completed payments"
        />
        <StatCard
          label="Payments recorded"
          value={String(payments.length)}
          detail="All statuses"
        />
        <StatCard
          label="Against contracts"
          value={String(payments.filter((p) => p.contract).length)}
          detail="Contract-linked"
        />
        <StatCard
          label="Against reservations"
          value={String(payments.filter((p) => p.reservation).length)}
          detail="Deposit-linked"
        />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Payment tracking</h2>
            <p className="text-sm text-zinc-500">
              Each payment is tied to exactly one contract or reservation.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((value) => !value)}
            disabled={
              !showForm && contracts.length === 0 && reservations.length === 0
            }
          >
            {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
            {showForm ? "Cancel" : "Record payment"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
          >
            <select
              value={form.targetType}
              onChange={(e) =>
                setForm({
                  ...form,
                  targetType: e.target.value as TargetType,
                  targetId: "",
                })
              }
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="contract">Against a contract</option>
              <option value="reservation">Against a reservation</option>
            </select>
            <select
              required
              value={form.targetId}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="">Select {form.targetType}…</option>
              {targetOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.customer.firstName} {option.customer.lastName} · Unit{" "}
                  {option.unit.unitNumber}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <select
              value={form.method}
              onChange={(e) =>
                setForm({
                  ...form,
                  method: e.target.value as (typeof PAYMENT_METHODS)[number],
                })
              }
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Recording…" : "Record payment"}
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
          <p className="p-6 text-sm text-zinc-500">Loading payments…</p>
        ) : payments.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No payments recorded yet.</p>
        ) : (
          <CrmTable
            columns={["Amount", "Method", "Against", "Date", "Status", ""]}
            rows={payments.map((payment) => [
              <span key="amount" className="font-medium">
                {formatAmount(payment.amount)}
              </span>,
              payment.method,
              payment.contract
                ? `Contract ${payment.contract.id.slice(0, 8)}`
                : payment.reservation
                  ? `Reservation ${payment.reservation.id.slice(0, 8)}`
                  : "—",
              new Date(payment.date).toLocaleDateString(),
              <span
                key="status"
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  statusClass[payment.status] ?? "bg-zinc-100 text-zinc-700",
                )}
              >
                {payment.status}
              </span>,
              <button
                key="delete"
                onClick={() => handleDelete(payment.id)}
                className="text-zinc-400 transition-colors hover:text-red-600"
                aria-label="Delete payment"
              >
                <Trash2 className="size-4" />
              </button>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
