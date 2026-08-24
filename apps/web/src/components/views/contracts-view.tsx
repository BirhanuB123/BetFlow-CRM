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
  ScrollText,
  Plus,
  Trash2,
  X,
  FileCheck2,
  CheckCircle2,
  Eye,
  FileSignature,
  Search,
  ChevronDown,
  ChevronRight,
  History,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { StatusPill } from "@/components/ui/status-pill";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslation } from "@/lib/i18n/language-context";
import type { ApiContract, CustomerOption } from "@betflow/shared";

type UnitOption = {
  id: string;
  unitNumber: string;
  type: string;
  price: number;
};

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

export function ContractsView() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "ACTIVE_ONLY" | "ALL" | "SIGNED" | "PENDING_SIGNATURE" | "CANCELLED"
  >("ACTIVE_ONLY");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeModalContract, setActiveModalContract] =
    useState<ApiContract | null>(null);
  const [expandedRevisions, setExpandedRevisions] = useState<
    Record<string, boolean>
  >({});

  const [form, setForm] = useState({
    contractNumber: "",
    contractType: "SALES_AGREEMENT",
    customerId: "",
    unitId: "",
    reservationId: "",
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const uId = params.get("unitId");
      const cId = params.get("customerId");
      const rId = params.get("reservationId");

      if (uId || cId || rId) {
        setForm((prev) => ({
          ...prev,
          unitId: uId || prev.unitId,
          customerId: cId || prev.customerId,
          reservationId: rId || prev.reservationId,
        }));
        setShowForm(true);
      }
    }
  }, []);

  const {
    groupedContracts,
  } = useMemo(() => {
    let pool = contracts;
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim().toLowerCase();
      pool = contracts.filter((c) => {
        const buyer = `${c.customer?.firstName ?? ""} ${c.customer?.lastName ?? ""}`.toLowerCase();
        const unit = (c.unit?.unitNumber ?? "").toLowerCase();
        const num = (c.contractNumber ?? "").toLowerCase();
        return buyer.includes(term) || unit.includes(term) || num.includes(term);
      });
    }

    if (filter === "ACTIVE_ONLY") {
      pool = pool.filter((c) => c.status !== "CANCELLED");
    } else if (filter !== "ALL") {
      pool = pool.filter((c) => c.status === filter);
    }

    const map = new Map<
      string,
      { primary: ApiContract; revisions: ApiContract[] }
    >();

    const rank = (status: string) => {
      if (status === "SIGNED") return 4;
      if (status === "PENDING_SIGNATURE") return 3;
      if (status === "ACTIVE") return 2;
      return 1;
    };

    for (const c of pool) {
      const key = `${c.unit?.id || "no-unit"}_${c.customer?.id || "no-cust"}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { primary: c, revisions: [] });
      } else {
        if (
          rank(c.status) > rank(existing.primary.status) ||
          new Date(c.createdAt || 0).getTime() >
            new Date(existing.primary.createdAt || 0).getTime()
        ) {
          existing.revisions.push(existing.primary);
          existing.primary = c;
        } else {
          existing.revisions.push(c);
        }
      }
    }

    return {
      groupedContracts: Array.from(map.values()),
    };
  }, [contracts, debouncedSearch, filter]);

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === form.unitId),
    [units, form.unitId],
  );

  useEffect(() => {
    if (selectedUnit && (!form.totalAmt || Number(form.totalAmt) === 0)) {
      setForm((prev) => ({
        ...prev,
        totalAmt: String(selectedUnit.price),
        downPaymentAmt: String(Math.round(selectedUnit.price * 0.3)),
      }));
    }
  }, [selectedUnit, form.totalAmt]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiContract>("/contracts", {
        method: "POST",
        body: JSON.stringify({
          contractNumber: form.contractNumber || undefined,
          contractType: form.contractType,
          customerId: form.customerId,
          unitId: form.unitId,
          reservationId: form.reservationId || undefined,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          totalAmt: form.totalAmt,
          downPaymentAmt: form.downPaymentAmt || undefined,
          paymentPlan: form.paymentPlan,
          notes: form.notes || undefined,
        }),
      });

      setForm({
        contractNumber: "",
        contractType: "SALES_AGREEMENT",
        customerId: "",
        unitId: "",
        reservationId: "",
        startDate: "",
        endDate: "",
        totalAmt: "",
        downPaymentAmt: "",
        paymentPlan: "INSTALLMENTS_24M",
        notes: "",
      });
      setShowForm(false);
      success("Contract generated successfully");
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create contract";
      setError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setError(null);
    try {
      await apiFetch<ApiContract>(`/contracts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      success(`Contract status updated to ${status}`);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update contract status";
      setError(msg);
      toastError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contract?"))
      return;
    setError(null);
    try {
      await apiFetch(`/contracts/${id}`, { method: "DELETE" });
      success("Contract deleted successfully");
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete contract";
      setError(msg);
      toastError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header & Toolbar */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-[#233b66]">
                <ScrollText className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Real Estate Sales Contracts & Legal Agreements
                </h2>
                <p className="text-xs text-slate-500">
                  Generate binding ETB sales contracts, manage 30/70 payment plans, and track buyer signatures.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative min-w-[240px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search buyer, unit #, contract #…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#233b66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#233b66] transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
              {(
                [
                  { id: "ACTIVE_ONLY", label: "Active Deals" },
                  { id: "SIGNED", label: "Signed" },
                  { id: "PENDING_SIGNATURE", label: "Pending" },
                  { id: "ALL", label: "All Records" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                    filter === item.id
                      ? "bg-white text-[#233b66] shadow-xs"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Link href="/contracts/builder">
              <Button
                variant="outline"
                className="h-9.5 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-xs px-3.5 shadow-2xs gap-1.5"
              >
                <FileSignature className="size-4 text-primary" />
                Legal Template Builder
              </Button>
            </Link>

            <Button
              onClick={() => setShowForm(true)}
              className="h-9.5 font-semibold text-xs px-4 shadow-sm gap-1.5"
            >
              <Plus className="size-4" />
              Generate Sales Contract
            </Button>
          </div>
        </div>
      </section>

      {/* Creation Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ScrollText className="size-5 text-[#233b66]" />
                Generate New Sales Agreement Contract
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contract Agreement #
                  </label>
                  <input
                    type="text"
                    value={form.contractNumber}
                    onChange={(e) =>
                      setForm({ ...form, contractNumber: e.target.value })
                    }
                    placeholder="e.g. CNT-2026-089 (Auto if blank)"
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#233b66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agreement Type *
                  </label>
                  <select
                    required
                    value={form.contractType}
                    onChange={(e) =>
                      setForm({ ...form, contractType: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#233b66]"
                  >
                    {Object.entries(contractTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Property Buyer / Customer *
                  </label>
                  <select
                    required
                    value={form.customerId}
                    onChange={(e) =>
                      setForm({ ...form, customerId: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#233b66]"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Linked Unit *
                  </label>
                  <select
                    required
                    value={form.unitId}
                    onChange={(e) =>
                      setForm({ ...form, unitId: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#233b66]"
                  >
                    <option value="">Select property unit…</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} ({u.type}) — {formatCurrency(u.price)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Contract Price (ETB) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalAmt}
                    onChange={(e) =>
                      setForm({ ...form, totalAmt: e.target.value })
                    }
                    placeholder="Total agreement amount"
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-primary outline-none focus:border-[#233b66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Down Payment Commitment (ETB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.downPaymentAmt}
                    onChange={(e) =>
                      setForm({ ...form, downPaymentAmt: e.target.value })
                    }
                    placeholder="e.g. 30% initial deposit"
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-emerald-800 outline-none focus:border-[#233b66]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Plan Schedule *
                  </label>
                  <select
                    required
                    value={form.paymentPlan}
                    onChange={(e) =>
                      setForm({ ...form, paymentPlan: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#233b66]"
                  >
                    {Object.entries(paymentPlanLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contract Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-[#233b66]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Provisions & Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional contract terms..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#233b66]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="font-semibold"
                >
                  {saving ? "Generating Contract…" : "Save Contract"}
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

      {/* Contracts Table Section */}
      <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : groupedContracts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Sales Contracts Found"
              description="No legal sale contracts match your current filter or search criteria."
              actionText="Create Sales Contract"
              onAction={() => setShowForm(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Contract Ref #</th>
                  <th className="px-4 py-3">Buyer Account</th>
                  <th className="px-4 py-3">Unit Linked</th>
                  <th className="px-4 py-3">Total Value (ETB)</th>
                  <th className="px-4 py-3">Payment Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {groupedContracts.map(({ primary, revisions }) => {
                  const hasRevisions = revisions.length > 0;
                  const isExpanded =
                    expandedRevisions[primary.id] ?? false;

                  return (
                    <tr
                      key={primary.id}
                      className="transition-colors hover:bg-slate-50/80 group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-extrabold text-[11px]">
                            📜
                          </div>
                          <div>
                            <p className="font-extrabold text-[#233b66]">
                              {primary.contractNumber ||
                                `CNT-${primary.id.slice(0, 8)}`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Date: {fmtDate(primary.startDate)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/customers/${primary.customer?.id}`}
                          className="font-bold text-slate-900 hover:text-[#233b66] hover:underline"
                        >
                          {primary.customer?.firstName}{" "}
                          {primary.customer?.lastName}
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                          🏢 Unit {primary.unit?.unitNumber || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-extrabold text-primary">
                        {formatCurrency(primary.totalAmt)}
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        {paymentPlanLabels[primary.paymentPlan || ""] ||
                          primary.paymentPlan ||
                          "Standard Plan"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusPill status={primary.status} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveModalContract(primary)}
                            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-primary hover:text-primary-foreground transition-colors"
                            title="View Full Contract Document"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {primary.status === "PENDING_SIGNATURE" && (
                            <Button
                              size="xs"
                              onClick={() =>
                                handleStatusChange(primary.id, "SIGNED")
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2.5 shadow-2xs gap-1"
                            >
                              <FileCheck2 className="size-3" />
                              Mark Signed
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(primary.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Contract"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
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

      {/* View Contract Modal */}
      {activeModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ScrollText className="size-5 text-[#233b66]" />
                Contract Details — {activeModalContract.contractNumber}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModalContract(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">Buyer Name</span>
                  <span className="font-bold text-slate-900">
                    {activeModalContract.customer?.firstName}{" "}
                    {activeModalContract.customer?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Property Unit</span>
                  <span className="font-bold text-slate-900">
                    Unit {activeModalContract.unit?.unitNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Total Price</span>
                  <span className="font-extrabold text-primary">
                    {formatCurrency(activeModalContract.totalAmt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Down Payment</span>
                  <span className="font-extrabold text-emerald-700">
                    {formatCurrency(activeModalContract.downPaymentAmt || 0)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Payment Plan</span>
                <p className="font-medium text-slate-800">
                  {paymentPlanLabels[activeModalContract.paymentPlan || ""] ||
                    activeModalContract.paymentPlan}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Start Date</span>
                <p className="font-medium text-slate-800">
                  {fmtDate(activeModalContract.startDate)}
                </p>
              </div>

              {activeModalContract.notes && (
                <div>
                  <span className="text-slate-400 block font-semibold">Special Terms</span>
                  <p className="font-medium text-slate-800 bg-amber-50/60 p-2.5 rounded border border-amber-100">
                    {activeModalContract.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalContract(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
