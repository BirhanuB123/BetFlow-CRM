"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Coins,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { formatDate as fmtDate } from "@/lib/date";

type ApiPayment = {
  id: string;
  amount: string;
  date: string;
  method: string;
  receiptNumber: string | null;
  status: string;
  notes: string | null;
  contract?: {
    id: string;
    status: string;
    customer?: { firstName: string; lastName: string };
    unit?: { unitNumber: string };
  } | null;
  reservation?: {
    id: string;
    status: string;
    customer?: { firstName: string; lastName: string };
    unit?: { unitNumber: string };
  } | null;
};

type ApiSchedule = {
  id: string;
  milestoneName: string;
  percentage: number;
  dueDate: string;
  amount: string;
  paidAmount: string;
  status: string;
  notes: string | null;
  gracePeriodDays?: number;
  penaltyRatePercent?: number;
  graceCutoffDate?: string;
  isWithinGrace?: boolean;
  isOverGrace?: boolean;
  lateDaysAfterGrace?: number;
  computedPenaltyAmount?: number;
  contract: {
    id: string;
    customer: { id: string; firstName: string; lastName: string; phone?: string | null };
    unit: { id: string; unitNumber: string; type: string };
  };
};

type ContractOption = {
  id: string;
  customer: { firstName: string; lastName: string };
  unit: { unitNumber: string };
};

const milestoneLabels: Record<string, string> = {
  DOWNPAYMENT_30: "1st Downpayment (30% - ውል ሲፈረም)",
  FOUNDATION_SLAB_20: "2nd Milestone (20% - መሠረት ሲጠናቀቅ)",
  STRUCTURE_SLAB_20: "3rd Milestone (20% - ፍሬም/ኮንክሪት ሲጠናቀቅ)",
  FINISHING_TILE_20: "4th Milestone (20% - ፊኒሺንግ ሲጀምር)",
  HANDOVER_KEYS_10: "Final Handover (10% - ቁልፍ እና ካርታ ሲረከብ)",
};

const methodLabels: Record<string, string> = {
  CBE_BANK_TRANSFER: "CBE / Bank Transfer (የባንክ ሐዋላ)",
  TELEBIRR: "Telebirr (ቴሌብር)",
  CBE_BIRR: "CBE Birr (ሲቢኢ ብር)",
  CASH_DEPOSIT: "Cash Deposit (በጥሬ ገንዘብ)",
  CHECK: "Check (በቼክ)",
};

const statusClass: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  PARTIALLY_PAID: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  OVERDUE: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
};

export function PaymentsView() {
  const { success, error: toastError } = useToast();
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"SCHEDULES" | "LOGS">("SCHEDULES");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState({
    contractId: "",
    amount: "",
    method: "CBE_BANK_TRANSFER",
    receiptNumber: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsData, schedulesData, contractsData] = await Promise.all([
        apiFetch<ApiPayment[]>("/payments"),
        apiFetch<ApiSchedule[]>("/payments/schedules"),
        apiFetch<ContractOption[]>("/contracts"),
      ]);
      setPayments(paymentsData);
      setSchedules(schedulesData);
      setContracts(contractsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load payment schedules",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const handleRecordPayment = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiPayment>("/payments", {
        method: "POST",
        body: JSON.stringify({
          contractId: form.contractId || undefined,
          amount: Number(form.amount),
          method: form.method,
          receiptNumber: form.receiptNumber || undefined,
          notes: form.notes || undefined,
          scheduleId: selectedScheduleId || undefined,
        }),
      });
      setForm({
        contractId: "",
        amount: "",
        method: "CBE_BANK_TRANSFER",
        receiptNumber: "",
        notes: "",
      });
      setSelectedScheduleId(null);
      setShowPaymentForm(false);
      success("Payment recorded and verified");
      await load();
    } catch (err) {
      toastError("Failed to record payment", err instanceof Error ? err.message : undefined);
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const openDepositModalForSchedule = (sched: ApiSchedule) => {
    setSelectedScheduleId(sched.id);
    const remaining = Math.max(
      0,
      Number(sched.amount) - Number(sched.paidAmount),
    );
    setForm({
      contractId: sched.contract.id,
      amount: String(remaining),
      method: "CBE_BANK_TRANSFER",
      receiptNumber: "",
      notes: `Payment for milestone: ${sched.milestoneName}`,
    });
    setShowPaymentForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Coins className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Payment Collection & Milestone Schedules
                </h2>
                <p className="text-xs text-slate-500">
                  Track buyer construction installment milestones, log bank receipts, and verify collections.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("SCHEDULES")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                  activeTab === "SCHEDULES"
                    ? "bg-white text-[#233b66] shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                Milestone Schedules
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("LOGS")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                  activeTab === "LOGS"
                    ? "bg-white text-[#233b66] shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                Payment Receipts Log ({payments.length})
              </button>
            </div>

            <Button
              onClick={() => {
                setSelectedScheduleId(null);
                setShowPaymentForm(true);
              }}
              className="h-9.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 shadow-sm gap-1.5"
            >
              <Plus className="size-4" />
              Record Payment
            </Button>
          </div>
        </div>
      </section>

      {/* Record Payment Form / Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="size-5 text-emerald-600" />
                Record Buyer Payment Receipt
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sales Contract / Buyer *
                </label>
                <select
                  required
                  value={form.contractId}
                  onChange={(e) =>
                    setForm({ ...form, contractId: e.target.value })
                  }
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600"
                >
                  <option value="">Select buyer contract…</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer.firstName} {c.customer.lastName} — Unit{" "}
                      {c.unit?.unitNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount Received (ETB) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="Payment amount"
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-emerald-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={form.method}
                    onChange={(e) =>
                      setForm({ ...form, method: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600"
                  >
                    {Object.entries(methodLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Reference / Receipt #
                </label>
                <input
                  type="text"
                  value={form.receiptNumber}
                  onChange={(e) =>
                    setForm({ ...form, receiptNumber: e.target.value })
                  }
                  placeholder="e.g. CBE-FT2026-00123"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Notes / Remittance Details
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Bank deposit confirmation, teller notes..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {saving ? "Saving..." : "Verify & Save Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-2xs">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "SCHEDULES" ? (
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : schedules.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Payment Schedules Found"
                description="No active installment schedules exist. Create a sales contract to generate payment milestones."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Milestone Name</th>
                    <th className="px-4 py-3">Buyer & Unit</th>
                    <th className="px-4 py-3">Milestone Amount</th>
                    <th className="px-4 py-3">Collected / Due</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {schedules.map((sched) => {
                    const total = Number(sched.amount) || 0;
                    const paid = Number(sched.paidAmount) || 0;
                    const rem = Math.max(0, total - paid);

                    return (
                      <tr
                        key={sched.id}
                        className="transition-colors hover:bg-slate-50/80 group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[11px]">
                              {sched.percentage}%
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900">
                                {milestoneLabels[sched.milestoneName] ||
                                  sched.milestoneName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <Link
                              href={`/customers/${sched.contract.customer.id}`}
                              className="font-bold text-slate-900 hover:text-[#233b66] hover:underline"
                            >
                              {sched.contract.customer.firstName}{" "}
                              {sched.contract.customer.lastName}
                            </Link>
                            <p className="text-[10px] text-slate-400">
                              Unit {sched.contract.unit.unitNumber}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-extrabold text-slate-900">
                          {formatCurrency(sched.amount)}
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <span className="font-extrabold text-emerald-700 block">
                              {formatCurrency(paid)} paid
                            </span>
                            {rem > 0 && (
                              <span className="text-[10px] text-rose-600 font-semibold">
                                {formatCurrency(rem)} remaining
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {fmtDate(sched.dueDate)}
                            </span>
                            {sched.isOverGrace && (
                              <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                                <AlertTriangle className="size-3" />
                                Overdue (+{sched.lateDaysAfterGrace}d)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold shadow-2xs uppercase tracking-wider",
                              statusClass[sched.status] || "bg-slate-100 text-slate-700",
                            )}
                          >
                            {sched.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          {rem > 0 && (
                            <Button
                              size="xs"
                              onClick={() => openDepositModalForSchedule(sched)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2.5 shadow-2xs gap-1"
                            >
                              <Plus className="size-3" />
                              Log Payment
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        /* LOGS TAB */
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : payments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Payment Receipts Logged"
                description="No buyer payments have been recorded yet."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Receipt / Ref #</th>
                    <th className="px-4 py-3">Buyer & Unit</th>
                    <th className="px-4 py-3">Amount (ETB)</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Date Recorded</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.map((p) => {
                    const buyer =
                      p.contract?.customer || p.reservation?.customer;
                    const unit =
                      p.contract?.unit || p.reservation?.unit;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[11px]">
                              💳
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900 font-mono">
                                {p.receiptNumber || `REC-${p.id.slice(0, 8)}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {buyer ? (
                            <div>
                              <p className="font-bold text-slate-900">
                                {buyer.firstName} {buyer.lastName}
                              </p>
                              {unit && (
                                <p className="text-[10px] text-slate-400">
                                  Unit {unit.unitNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 font-extrabold text-emerald-700">
                          {formatCurrency(p.amount)}
                        </td>

                        <td className="px-4 py-3 text-slate-700 text-[11px]">
                          {methodLabels[p.method] || p.method}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {fmtDate(p.date)}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            <ShieldCheck className="size-3 text-emerald-600" />
                            VERIFIED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
