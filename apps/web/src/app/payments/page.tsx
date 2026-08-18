"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Coins,
  Plus,
  Trash2,
  X,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  User,
  Sparkles,
  Layers,
  Banknote,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { formatDate as fmtDate } from "@/lib/date";
import { CONSTRUCTION_MILESTONES } from "@betflow/shared";

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

export default function RealEstatePaymentsPage() {
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
      notes: `Payment for ${milestoneLabels[sched.milestoneName] || sched.milestoneName}`,
    });
    setShowPaymentForm(true);
  };

  // KPI calculations
  const totalCollectionsETB = payments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0,
  );
  const totalScheduledETB = schedules.reduce(
    (acc, s) => acc + (Number(s.amount) || 0),
    0,
  );
  const totalPaidScheduledETB = schedules.reduce(
    (acc, s) => acc + (Number(s.paidAmount) || 0),
    0,
  );
  const totalPendingETB = Math.max(
    0,
    totalScheduledETB - totalPaidScheduledETB,
  );
  const overdueCount = schedules.filter(
    (s) => s.status !== "PAID" && new Date(s.dueDate) < new Date(),
  ).length;

  return (
    <DashboardShell
      title="Real Estate Milestone Payment Schedules (የክፍያ መርሃግብር)"
      description="Track construction stage milestones (Downpayment, Slab, Finishing, Handover) and verify bank deposit receipts."
      active="Payments"
    >
      <div className="space-y-6">

        {/* Section Header & Record Deposit Button */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-[#233b66]" />
                <h2 className="text-lg font-bold text-slate-900">
                  Construction Milestone Schedules (የክፍያ መርሃግብር)
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Log CBE bank deposit receipts, track 30/20/20/20/10 milestone
                progress, and issue receipts.
              </p>
            </div>
            <Button
              onClick={() => setShowPaymentForm((v) => !v)}
              className="bg-[#233b66] hover:bg-[#1a2d50] text-white font-medium shadow-sm transition-all"
            >
              {showPaymentForm ? (
                <X className="size-4 mr-1.5" />
              ) : (
                <Plus className="size-4 mr-1.5" />
              )}
              {showPaymentForm ? "Cancel Log" : "Log Deposit Receipt"}
            </Button>
          </div>

          {/* Record Deposit Modal / Form */}
          {showPaymentForm && (
            <form
              onSubmit={handleRecordPayment}
              className="mt-6 rounded-xl border border-[#233b66]/20 bg-gradient-to-b from-[#233b66]/5 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-[#233b66] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-[#233b66]" />
                Deposit Receipt & Milestone Allocation
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Contract / Customer *
                  </label>
                  <select
                    required
                    value={form.contractId}
                    onChange={(e) =>
                      setForm({ ...form, contractId: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select contract…</option>
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customer.firstName} {c.customer.lastName} · Unit{" "}
                        {c.unit.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Amount (ETB) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 1500000"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) =>
                      setForm({ ...form, method: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="CBE_BANK_TRANSFER">
                      CBE / Bank Transfer (የባንክ ሐዋላ)
                    </option>
                    <option value="TELEBIRR">Telebirr (ቴሌብር)</option>
                    <option value="CBE_BIRR">CBE Birr (ሲቢኢ ብር)</option>
                    <option value="CASH_DEPOSIT">
                      Cash Deposit (በጥሬ ገንዘብ)
                    </option>
                    <option value="CHECK">Check (በቼክ)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Receipt / Swift Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBE Ref FT2620689431..."
                    value={form.receiptNumber}
                    onChange={(e) =>
                      setForm({ ...form, receiptNumber: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Notes & Deposit Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd milestone installment for Bole 3-Bed unit structure completion..."
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-indigo-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm"
                >
                  {saving ? "Recording…" : "Record & Verify Deposit"}
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

        {/* Tab Selection */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab("SCHEDULES")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  activeTab === "SCHEDULES"
                    ? "bg-[#233b66] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/60",
                )}
              >
                <Layers className="size-3.5" />
                Milestone Schedules ({schedules.length})
              </button>

              <button
                onClick={() => setActiveTab("LOGS")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  activeTab === "LOGS"
                    ? "bg-[#233b66] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/60",
                )}
              >
                <Receipt className="size-3.5" />
                Deposit Receipts & Log ({payments.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : activeTab === "SCHEDULES" ? (
            /* Milestone Schedules View */
            schedules.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No milestone schedules found"
                  description="Create a sales contract to automatically generate standard 30/20/20/20/10 milestone payment schedules."
                  actionText="Log Deposit Receipt"
                  onAction={() => setShowPaymentForm(true)}
                  icon={Layers}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Buyer & Unit</th>
                      <th className="px-5 py-3">
                        Construction Milestone Stage
                      </th>
                      <th className="px-5 py-3">Target Amount (ETB)</th>
                      <th className="px-5 py-3">Paid Amount & Progress</th>
                      <th className="px-5 py-3">Due Date</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((sched) => {
                      const totalAmt = Number(sched.amount) || 0;
                      const paidAmt = Number(sched.paidAmount) || 0;
                      const pct =
                        totalAmt > 0
                          ? Math.min(
                              100,
                              Math.round((paidAmt / totalAmt) * 100),
                            )
                          : 0;
                      const isOverdue =
                        sched.status !== "PAID" &&
                        new Date(sched.dueDate) < new Date();

                      return (
                        <tr
                          key={sched.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-800">
                              {sched.contract.customer.firstName}{" "}
                              {sched.contract.customer.lastName}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                              <Building className="size-3" />
                              Unit {sched.contract.unit.unitNumber} (
                              {sched.contract.unit.type})
                            </span>
                          </td>

                          <td className="px-5 py-3">
                            <span className="font-semibold text-slate-700">
                              {milestoneLabels[sched.milestoneName] ??
                                sched.milestoneName}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                              {sched.percentage}% of agreement total
                            </span>
                          </td>

                          <td className="px-5 py-3 font-bold text-slate-900">
                            {formatCurrency(sched.amount)}
                          </td>

                          <td className="px-5 py-3 min-w-[170px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-emerald-700">
                                  {formatCurrency(sched.paidAmount)}
                                </span>
                                <span className="font-semibold text-slate-500">
                                  {pct}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    pct >= 100
                                      ? "bg-emerald-500"
                                      : pct > 0
                                        ? "bg-indigo-500"
                                        : "bg-slate-300",
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3 font-medium text-slate-600">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-900">{fmtDate(sched.dueDate)}</span>
                              {sched.isWithinGrace && (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded w-fit border border-amber-200">
                                  🛡️ Grace Period ({sched.gracePeriodDays ?? 15}d)
                                </span>
                              )}
                              {sched.isOverGrace && (
                                <span className="text-[10px] font-extrabold text-rose-900 bg-rose-100 px-1.5 py-0.2 rounded w-fit border border-rose-300">
                                  ⚠️ Overdue {sched.lateDaysAfterGrace}d Past Grace
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3">
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border w-fit",
                                  sched.isOverGrace || isOverdue
                                    ? statusClass.OVERDUE
                                    : (statusClass[sched.status] ??
                                        "bg-slate-100 text-slate-700"),
                                )}
                              >
                                {sched.status === "PAID" && (
                                  <CheckCircle2 className="size-3 text-emerald-600" />
                                )}
                                {(sched.isOverGrace || isOverdue) && (
                                  <AlertTriangle className="size-3 text-rose-600" />
                                )}
                                {sched.status !== "PAID" && !isOverdue && !sched.isOverGrace && (
                                  <Clock className="size-3 text-amber-600" />
                                )}
                                {sched.isOverGrace || isOverdue ? "OVERDUE" : sched.status}
                              </span>

                              {sched.computedPenaltyAmount && sched.computedPenaltyAmount > 0 ? (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 w-fit">
                                  + {formatCurrency(sched.computedPenaltyAmount)} Late Penalty ({sched.penaltyRatePercent}% Rate)
                                </span>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-5 py-3 text-right">
                            {sched.status !== "PAID" && (
                              <Button
                                size="xs"
                                onClick={() =>
                                  openDepositModalForSchedule(sched)
                                }
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-[11px] px-2.5 shadow-2xs"
                              >
                                <Coins className="size-3 mr-1" />
                                Record Payment
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : /* Deposit Receipts Log View */
          payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <Receipt className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No deposit receipts logged
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click "Log Deposit Receipt" to record bank transfers and
                Telebirr receipts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Receipt Date</th>
                    <th className="px-5 py-3">Buyer & Target Contract</th>
                    <th className="px-5 py-3">Amount Paid (ETB)</th>
                    <th className="px-5 py-3">Payment Method & Bank Ref</th>
                    <th className="px-5 py-3">Deposit Notes</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-slate-600">
                        {fmtDate(p.date)}
                      </td>

                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">
                          {p.contract?.customer?.firstName ??
                            p.reservation?.customer?.firstName ??
                            "Customer"}{" "}
                          {p.contract?.customer?.lastName ??
                            p.reservation?.customer?.lastName ??
                            ""}
                        </p>
                        <span className="text-[11px] text-indigo-600 font-medium">
                          Unit{" "}
                          {p.contract?.unit?.unitNumber ??
                            p.reservation?.unit?.unitNumber ??
                            "N/A"}
                        </span>
                      </td>

                      <td className="px-5 py-3 font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-700">
                            {methodLabels[p.method] ?? p.method}
                          </span>
                          {p.receiptNumber && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {p.receiptNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3 text-slate-600 max-w-[200px] truncate">
                        {p.notes ?? "—"}
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="size-3" />
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
