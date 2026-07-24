"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ScrollText,
  Plus,
  Trash2,
  X,
  FileCheck2,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Banknote,
  Coins,
  ShieldCheck,
  FileSignature,
  User,
  Sparkles,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ApiContract = {
  id: string;
  contractNumber: string | null;
  contractType: string;
  startDate: string;
  endDate: string | null;
  totalAmt: string;
  downPaymentAmt: string | null;
  paymentPlan: string | null;
  status: string;
  notes: string | null;
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string; type: string; status: string };
  deal: { id: string; name: string } | null;
  _count: { payments: number; schedules: number };
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type UnitOption = { id: string; unitNumber: string; type: string; price: number };

const statusClass: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING_SIGNATURE: "bg-amber-50 text-amber-700 border-amber-200",
  SIGNED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const contractTypeLabels: Record<string, string> = {
  SALES_AGREEMENT: "Property Sales Agreement (የሽያጭ ውል)",
  RESERVATION_AGREEMENT: "Reservation Agreement (የይዞታ ውል)",
  COMMERCIAL_LEASE: "Commercial Lease (የኪራይ ውል)",
};

const paymentPlanLabels: Record<string, string> = {
  INSTALLMENTS_24M: "Installment Plan (በክፍያ - 24 Months)",
  BANK_MORTGAGE_3070: "Bank Mortgage 30/70 (በባንክ)",
  FULL_CASH: "Full Cash Discount (በጥሬ ገንዘብ)",
  DIASPORA_USD: "Diaspora USD Foreign Currency",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "SIGNED" | "PENDING_SIGNATURE" | "ACTIVE" | "CANCELLED">("ALL");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeModalContract, setActiveModalContract] = useState<ApiContract | null>(null);

  const [form, setForm] = useState({
    contractNumber: "",
    contractType: "SALES_AGREEMENT",
    customerId: "",
    unitId: "",
    startDate: "",
    endDate: "",
    totalAmt: "",
    downPaymentAmt: "",
    paymentPlan: "INSTALLMENTS_24M",
    notes: "",
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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const visible = useMemo(() => {
    if (filter === "ALL") return contracts;
    return contracts.filter((c) => c.status === filter);
  }, [contracts, filter]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiContract>("/contracts", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          totalAmt: Number(form.totalAmt),
          downPaymentAmt: form.downPaymentAmt ? Number(form.downPaymentAmt) : undefined,
          status: "PENDING_SIGNATURE",
        }),
      });
      setForm({
        contractNumber: "",
        contractType: "SALES_AGREEMENT",
        customerId: "",
        unitId: "",
        startDate: "",
        endDate: "",
        totalAmt: "",
        downPaymentAmt: "",
        paymentPlan: "INSTALLMENTS_24M",
        notes: "",
      });
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this contract record?")) return;
    setError(null);
    try {
      await apiFetch(`/contracts/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contract");
    }
  };

  // KPI Calculations
  const totalVolumeETB = contracts.reduce((acc, c) => acc + (Number(c.totalAmt) || 0), 0);
  const totalDownpaymentsETB = contracts.reduce((acc, c) => acc + (Number(c.downPaymentAmt) || 0), 0);
  const signedCount = contracts.filter((c) => c.status === "SIGNED").length;
  const pendingCount = contracts.filter((c) => c.status === "PENDING_SIGNATURE").length;

  return (
    <DashboardShell
      title="Contracts & Sales Agreements"
      description="Manage property sales contracts, reservation agreements, downpayments, and automatic unit inventory status."
      active="Contracts"
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Contract Value (ETB)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totalVolumeETB)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Gross contract portfolio</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600">Downpayments Collected</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(totalDownpaymentsETB)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Total initial deposits</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-indigo-600">Signed Contracts & Sold</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{signedCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Units marked as SOLD</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-amber-600">Pending Signatures</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Awaiting client/admin signature</p>
          </div>
        </div>

        {/* Section Header & Creator Button */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ScrollText className="size-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Ethiopian Real Estate Contracts</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Execute sale agreements, track downpayments, and automatically mark property units as SOLD.
              </p>
            </div>
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={!showForm && (customers.length === 0 || units.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {showForm ? <X className="size-4 mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
              {showForm ? "Cancel Intake" : "New Contract Agreement"}
            </Button>
          </div>

          {/* New Contract Creation Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                Contract Agreement & Financial Terms
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Ref Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ET-CNT-2026-004 (Auto-generated if empty)"
                    value={form.contractNumber}
                    onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={form.contractType}
                    onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="SALES_AGREEMENT">Property Sales Agreement (የሽያጭ ውል)</option>
                    <option value="RESERVATION_AGREEMENT">Reservation Agreement (የይዞታ ውል)</option>
                    <option value="COMMERCIAL_LEASE">Commercial Lease (የኪራይ ውል)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer / Contact *</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Property Unit *</label>
                  <select
                    required
                    value={form.unitId}
                    onChange={(e) => {
                      const selUnit = units.find((u) => u.id === e.target.value);
                      setForm({
                        ...form,
                        unitId: e.target.value,
                        totalAmt: selUnit && selUnit.price ? String(selUnit.price) : form.totalAmt,
                      });
                    }}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select unit…</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} · {u.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Agreement Amount (ETB) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 8500000"
                    value={form.totalAmt}
                    onChange={(e) => setForm({ ...form, totalAmt: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Downpayment Deposit (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2500000 (30% Downpayment)"
                    value={form.downPaymentAmt}
                    onChange={(e) => setForm({ ...form, downPaymentAmt: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Plan Structure</label>
                  <select
                    value={form.paymentPlan}
                    onChange={(e) => setForm({ ...form, paymentPlan: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="INSTALLMENTS_24M">Installment Plan (በክፍያ - 24 Months)</option>
                    <option value="BANK_MORTGAGE_3070">Bank Mortgage 30/70 (በባንክ)</option>
                    <option value="FULL_CASH">Full Cash Discount (በጥሬ ገንዘብ)</option>
                    <option value="DIASPORA_USD">Diaspora USD Foreign Currency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start / Execution Date *</label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End / Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Notes & Special Clauses</label>
                  <textarea
                    rows={2}
                    placeholder="Special terms, payment milestone conditions, penalty clauses..."
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
                  {saving ? "Creating…" : "Save & Generate Contract Agreement"}
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

        {/* Contracts Grid Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Filter Tabs */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter("ALL")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                All Contracts ({contracts.length})
              </button>

              <button
                onClick={() => setFilter("SIGNED")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "SIGNED" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Signed & Executed ({signedCount})
              </button>

              <button
                onClick={() => setFilter("PENDING_SIGNATURE")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  filter === "PENDING_SIGNATURE" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Pending Signature ({pendingCount})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-slate-500">Loading sales contracts…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <ScrollText className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No contracts in this view</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click "New Contract Agreement" to log a new real estate sales contract or reservation agreement.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Contract Ref & Type</th>
                    <th className="px-5 py-3">Customer / Buyer</th>
                    <th className="px-5 py-3">Property Unit</th>
                    <th className="px-5 py-3">Agreement Value (ETB)</th>
                    <th className="px-5 py-3">Downpayment & Plan</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">
                          {contract.contractNumber ?? `ET-CNT-${contract.id.slice(0, 8).toUpperCase()}`}
                        </p>
                        <span className="inline-block mt-0.5 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                          {contractTypeLabels[contract.contractType] ?? contract.contractType}
                        </span>
                      </td>

                      <td className="px-5 py-3 font-medium">
                        <Link
                          href={`/customers/${contract.customer.id}`}
                          className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                        >
                          <User className="size-3.5 text-indigo-500" />
                          {contract.customer.firstName} {contract.customer.lastName}
                        </Link>
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                          <Building className="size-3.5 text-slate-400" />
                          Unit {contract.unit.unitNumber}
                        </span>
                      </td>

                      <td className="px-5 py-3 font-bold text-slate-900">
                        {formatCurrency(contract.totalAmt)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          {contract.downPaymentAmt ? (
                            <span className="font-bold text-emerald-700">
                              {formatCurrency(contract.downPaymentAmt)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No deposit</span>
                          )}
                          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                            {paymentPlanLabels[contract.paymentPlan ?? ""] ?? "Standard Plan"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                            statusClass[contract.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                          )}
                        >
                          {contract.status === "SIGNED" && <CheckCircle2 className="size-3 text-emerald-600" />}
                          {contract.status === "PENDING_SIGNATURE" && <Clock className="size-3 text-amber-600" />}
                          {contract.status === "CANCELLED" && <XCircle className="size-3 text-rose-600" />}
                          {contract.status}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveModalContract(contract)}
                            className="rounded bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="View Contract Specs"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {contract.status !== "SIGNED" ? (
                            <Button
                              size="xs"
                              onClick={() => markSigned(contract.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2 shadow-2xs"
                            >
                              <FileCheck2 className="size-3 mr-1" />
                              Mark Signed
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <ShieldCheck className="size-3" />
                              Unit Sold
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(contract.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete contract"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Contract Specification Sheet Modal */}
        {activeModalContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="size-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Contract Agreement Specifications</h3>
                </div>
                <button
                  onClick={() => setActiveModalContract(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-indigo-50/60 p-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">Contract Reference</p>
                    <p className="text-sm font-bold text-indigo-950">
                      {activeModalContract.contractNumber ?? `ET-CNT-${activeModalContract.id.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold border", statusClass[activeModalContract.status])}>
                    {activeModalContract.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer / Customer</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      {activeModalContract.customer.firstName} {activeModalContract.customer.lastName}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Property Unit</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      Unit {activeModalContract.unit.unitNumber} ({activeModalContract.unit.type})
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agreement Value</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatCurrency(activeModalContract.totalAmt)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Downpayment</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {activeModalContract.downPaymentAmt ? formatCurrency(activeModalContract.downPaymentAmt) : "None"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Plan</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {paymentPlanLabels[activeModalContract.paymentPlan ?? ""] ?? "Standard Plan"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution Date</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {fmtDate(activeModalContract.startDate)}
                    </p>
                  </div>
                </div>

                {activeModalContract.notes && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-700 mb-1">Contract Notes & Clauses</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{activeModalContract.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setActiveModalContract(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
                >
                  Close Specification Sheet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
