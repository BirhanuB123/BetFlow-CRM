"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  FilePlus2,
  Plus,
  X,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Coins,
  ShieldAlert,
  User,
  Sparkles,
  Receipt,
  CalendarDays,
  Lock,
  Unlock,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ApiReservation = {
  id: string;
  reservationNumber: string | null;
  amount: string;
  holdPeriodDays: number;
  expiryDate: string | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
  status: string;
  date: string;
  notes: string | null;
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string; type: string; status: string; price: string };
  _count: { payments: number };
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type UnitOption = { id: string; unitNumber: string; type: string; price: string };

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  CONVERTED_TO_CONTRACT: "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
};

const paymentMethodLabels: Record<string, string> = {
  BANK_TRANSFER: "CBE / Bank Transfer (የባንክ ሐዋላ)",
  TELEBIRR: "Telebirr (ቴሌብር)",
  CBE_BIRR: "CBE Birr (ሲቢኢ ብር)",
  CASH_DEPOSIT: "Cash Deposit (በጥሬ ገንዘብ)",
  CHECK: "Check (በቼክ)",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysRemaining(iso: string | null) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const now = new Date().getTime();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "APPROVED" | "EXPIRED" | "CANCELLED">("ACTIVE");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<ApiReservation | null>(null);

  const [form, setForm] = useState({
    reservationNumber: "",
    customerId: "",
    unitId: "",
    amount: "",
    holdPeriodDays: "14",
    paymentMethod: "BANK_TRANSFER",
    receiptNumber: "",
    notes: "",
  });

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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const visible = useMemo(() => {
    if (filter === "ALL") return reservations;
    if (filter === "ACTIVE") {
      return reservations.filter((r) => r.status === "PENDING" || r.status === "APPROVED");
    }
    return reservations.filter((r) => r.status === filter);
  }, [reservations, filter]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiReservation>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          holdPeriodDays: Number(form.holdPeriodDays),
          status: "APPROVED",
        }),
      });
      setForm({
        reservationNumber: "",
        customerId: "",
        unitId: "",
        amount: "",
        holdPeriodDays: "14",
        paymentMethod: "BANK_TRANSFER",
        receiptNumber: "",
        notes: "",
      });
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

  // KPI Calculations
  const activeCount = reservations.filter((r) => r.status === "PENDING" || r.status === "APPROVED").length;
  const totalDepositVolumeETB = reservations.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const expiringSoonCount = reservations.filter((r) => {
    if (r.status !== "PENDING" && r.status !== "APPROVED") return false;
    const diff = daysRemaining(r.expiryDate);
    return diff !== null && diff <= 3 && diff >= 0;
  }).length;
  const releasedCount = reservations.filter((r) => r.status === "EXPIRED" || r.status === "CANCELLED").length;

  return (
    <DashboardShell
      title="Property Unit Holds & Reservations"
      description="Reserve units post-site-visit, track deposit receipts, and manage automatic inventory locking & release windows."
      active="Reservations"
    >
      <div className="space-y-6">
        {/* Top KPI Queue Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-600">Active Unit Holds</p>
              <Lock className="size-4 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-blue-700">{activeCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Units locked on hold</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-600">Deposit Receipts (ETB)</p>
              <Coins className="size-4 text-emerald-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(totalDepositVolumeETB)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Total hold deposits</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-600">Expiring Within 3 Days</p>
              <ShieldAlert className="size-4 text-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-700">{expiringSoonCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Holds near expiration</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Released / Expired</p>
              <Unlock className="size-4 text-slate-400" />
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-700">{releasedCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Returned to AVAILABLE</p>
          </div>
        </div>

        {/* Section Header & Form Trigger */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FilePlus2 className="size-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Ethiopian Real Estate Unit Holds</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Freeze units post-site-visit, collect deposit receipts, and manage 7/14-day expiration windows.
              </p>
            </div>
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={!showForm && (customers.length === 0 || availableUnits.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {showForm ? <X className="size-4 mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
              {showForm ? "Cancel Intake" : "New Unit Reservation"}
            </Button>
          </div>

          {/* New Reservation Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                Unit Hold & Deposit Receipt Intake
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reservation Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BF-RES-2026-015 (Auto-generated if empty)"
                    value={form.reservationNumber}
                    onChange={(e) => setForm({ ...form, reservationNumber: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Buyer / Customer *</label>
                  <select
                    required
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select customer…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Available Unit *</label>
                  <select
                    required
                    value={form.unitId}
                    onChange={(e) => {
                      const unit = availableUnits.find((u) => u.id === e.target.value);
                      const suggestedDeposit = unit && unit.price ? Math.round(Number(unit.price) * 0.05) : "";
                      setForm({
                        ...form,
                        unitId: e.target.value,
                        amount: suggestedDeposit ? String(suggestedDeposit) : form.amount,
                      });
                    }}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select available unit…</option>
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} · {u.type} · {formatCurrency(u.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reservation Deposit Amount (ETB) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 250000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hold Expiration Window</label>
                  <select
                    value={form.holdPeriodDays}
                    onChange={(e) => setForm({ ...form, holdPeriodDays: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="7">7 Days Standard Hold</option>
                    <option value="14">14 Days Extended Hold (Recommended)</option>
                    <option value="30">30 Days Diaspora Buyer Window</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="BANK_TRANSFER">CBE / Bank Transfer (የባንክ ሐዋላ)</option>
                    <option value="TELEBIRR">Telebirr (ቴሌብር)</option>
                    <option value="CBE_BIRR">CBE Birr (ሲቢኢ ብር)</option>
                    <option value="CASH_DEPOSIT">Cash Deposit (በጥሬ ገንዘብ)</option>
                    <option value="CHECK">Check (በቼክ)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Receipt / Transaction Ref Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CBE Transaction Ref FT2620689431..."
                    value={form.receiptNumber}
                    onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Special Reservation Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Buyer will submit bank loan documents within 10 days..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-indigo-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm">
                  {saving ? "Reserving…" : "Reserve & Lock Unit Inventory"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
        </section>

        {/* Reservations Queue Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Table Filter Tabs */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter("ACTIVE")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "ACTIVE" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Active Holds ({activeCount})
              </button>

              <button
                onClick={() => setFilter("APPROVED")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "APPROVED" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Approved ({reservations.filter((r) => r.status === "APPROVED").length})
              </button>

              <button
                onClick={() => setFilter("EXPIRED")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "EXPIRED" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Expired / Released ({reservations.filter((r) => r.status === "EXPIRED").length})
              </button>

              <button
                onClick={() => setFilter("ALL")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                All Holds ({reservations.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-slate-500">Loading reservation queue…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <FilePlus2 className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No unit holds in this view</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click "New Unit Reservation" to lock an available property unit for a prospective buyer.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Reservation Code & Unit</th>
                    <th className="px-5 py-3">Buyer / Customer</th>
                    <th className="px-5 py-3">Deposit Amount (ETB)</th>
                    <th className="px-5 py-3">Payment Method & Receipt</th>
                    <th className="px-5 py-3">Hold Expiration</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((reservation) => {
                    const isActive = reservation.status === "PENDING" || reservation.status === "APPROVED";
                    const remDays = daysRemaining(reservation.expiryDate);

                    return (
                      <tr key={reservation.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">
                            {reservation.reservationNumber ?? `BF-RES-${reservation.id.slice(0, 8).toUpperCase()}`}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-bold text-indigo-600">
                            <Building className="size-3" />
                            Unit {reservation.unit.unitNumber} ({reservation.unit.type})
                          </span>
                        </td>

                        <td className="px-5 py-3 font-medium">
                          <Link
                            href={`/customers/${reservation.customer.id}`}
                            className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                          >
                            <User className="size-3.5 text-indigo-500" />
                            {reservation.customer.firstName} {reservation.customer.lastName}
                          </Link>
                        </td>

                        <td className="px-5 py-3 font-bold text-emerald-700">
                          {formatCurrency(reservation.amount)}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-700">
                              {paymentMethodLabels[reservation.paymentMethod ?? ""] ?? "Bank Transfer"}
                            </span>
                            {reservation.receiptNumber && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ref: {reservation.receiptNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          {isActive && remDays !== null ? (
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="size-3.5 text-amber-500" />
                              <span
                                className={cn(
                                  "font-semibold text-xs",
                                  remDays <= 3 ? "text-rose-600 font-bold animate-pulse" : "text-slate-700"
                                )}
                              >
                                {remDays > 0 ? `${remDays} days left` : "Expires today"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">{fmtDate(reservation.expiryDate)}</span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                              statusClass[reservation.status] ?? "bg-slate-100 text-slate-700"
                            )}
                          >
                            {reservation.status === "APPROVED" && <Lock className="size-3 text-emerald-600" />}
                            {reservation.status === "PENDING" && <Clock className="size-3 text-amber-600" />}
                            {(reservation.status === "CANCELLED" || reservation.status === "EXPIRED") && (
                              <Unlock className="size-3 text-slate-500" />
                            )}
                            {reservation.status}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveVoucher(reservation)}
                              className="rounded bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="View Hold Voucher"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            {reservation.status === "PENDING" && (
                              <Button
                                size="xs"
                                onClick={() => changeStatus(reservation.id, "APPROVED")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2 shadow-2xs"
                              >
                                Approve Hold
                              </Button>
                            )}

                            {isActive && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => changeStatus(reservation.id, "CANCELLED")}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 h-7 text-[11px] px-2"
                              >
                                Release Unit
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Hold Voucher Modal */}
        {activeVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="size-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Unit Reservation Voucher</h3>
                </div>
                <button
                  onClick={() => setActiveVoucher(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-indigo-50/60 p-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">Reservation Reference</p>
                    <p className="text-sm font-bold text-indigo-950">
                      {activeVoucher.reservationNumber ?? `BF-RES-${activeVoucher.id.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold border", statusClass[activeVoucher.status])}>
                    {activeVoucher.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer / Customer</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      {activeVoucher.customer.firstName} {activeVoucher.customer.lastName}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reserved Unit</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      Unit {activeVoucher.unit.unitNumber} ({activeVoucher.unit.type})
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deposit Paid (ETB)</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {formatCurrency(activeVoucher.amount)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hold Expiration</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      {fmtDate(activeVoucher.expiryDate)} ({activeVoucher.holdPeriodDays} Days Hold)
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {paymentMethodLabels[activeVoucher.paymentMethod ?? ""] ?? "Bank Transfer"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Receipt Ref</p>
                    <p className="mt-1 text-xs font-mono font-semibold text-slate-800">
                      {activeVoucher.receiptNumber ?? "N/A"}
                    </p>
                  </div>
                </div>

                {activeVoucher.notes && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-700 mb-1">Reservation Terms & Notes</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{activeVoucher.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setActiveVoucher(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
                >
                  Close Voucher
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
