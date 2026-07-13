"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FilePlus2, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ApiReservation = {
  id: string;
  amount: string;
  status: string;
  date: string;
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string; type: string; status: string };
  _count: { payments: number };
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type UnitOption = { id: string; unitNumber: string; type: string; price: string };

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-zinc-200 text-zinc-600",
};

function formatAmount(value: string) {
  return formatCurrency(value);
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: "", unitId: "", amount: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reservationsData, customersData, unitsData] = await Promise.all([
        apiFetch<ApiReservation[]>("/reservations"),
        apiFetch<CustomerOption[]>("/customers"),
        apiFetch<UnitOption[]>("/units?status=AVAILABLE"),
      ]);
      setReservations(reservationsData);
      setCustomers(customersData);
      setAvailableUnits(unitsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reservations");
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
      await apiFetch<ApiReservation>("/reservations", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ customerId: "", unitId: "", amount: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/reservations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update reservation");
    }
  };

  return (
    <DashboardShell
      title="Reservations"
      description="Reserve units, track deposits, and prevent inventory conflicts."
      active="Reservations"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Reservation queue</h2>
            <p className="text-sm text-zinc-500">
              Reserving a unit takes it off the market; cancelling releases it.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((value) => !value)}
            disabled={!showForm && (customers.length === 0 || availableUnits.length === 0)}
          >
            {showForm ? <X className="size-4" /> : <FilePlus2 className="size-4" />}
            {showForm ? "Cancel" : "New reservation"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3"
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
              <option value="">Select available unit…</option>
              {availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unitNumber} · {unit.type} · {formatAmount(unit.price)}
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
              placeholder="Deposit amount"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <div className="sm:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Reserving…" : "Reserve unit"}
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
          <p className="p-6 text-sm text-zinc-500">Loading reservations…</p>
        ) : reservations.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No reservations yet.</p>
        ) : (
          <CrmTable
            columns={["Customer", "Unit", "Deposit", "Date", "Payments", "Status", "Actions"]}
            rows={reservations.map((reservation) => {
              const isActive =
                reservation.status === "PENDING" || reservation.status === "APPROVED";

              return [
                <span key="customer" className="font-medium">
                  {reservation.customer.firstName} {reservation.customer.lastName}
                </span>,
                `Unit ${reservation.unit.unitNumber}`,
                formatAmount(reservation.amount),
                new Date(reservation.date).toLocaleDateString(),
                reservation._count.payments,
                <span
                  key="status"
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    statusClass[reservation.status] ?? "bg-zinc-100 text-zinc-700",
                  )}
                >
                  {reservation.status}
                </span>,
                <div key="actions" className="flex gap-2">
                  {reservation.status === "PENDING" && (
                    <Button
                      size="xs"
                      onClick={() => changeStatus(reservation.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                  )}
                  {isActive && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => changeStatus(reservation.id, "CANCELLED")}
                    >
                      Cancel
                    </Button>
                  )}
                  {!isActive && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => changeStatus(reservation.id, "PENDING")}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>,
              ];
            })}
          />
        )}
      </section>
    </DashboardShell>
  );
}
