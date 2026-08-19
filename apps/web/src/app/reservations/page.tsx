"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  User,
  Sparkles,
  Receipt,
  CalendarDays,
  Lock,
  Unlock,
  Search,
  Printer,
  Flame,
  FileSignature,
  Filter,
  ArrowRight,
  Banknote,
  ShieldCheck,
  Building2,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { StatusPill } from "@/components/ui/status-pill";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate as fmtDate, daysRemaining } from "@/lib/date";
import { CreateReservationModal } from "@/features/reservations/create-reservation-modal";
import { ReservationVoucherModal } from "@/features/reservations/reservation-voucher-modal";

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
  unit: {
    id: string;
    unitNumber: string;
    type: string;
    status: string;
    price: string;
  };
  _count: { payments: number };
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type UnitOption = {
  id: string;
  unitNumber: string;
  type: string;
  price: string;
};

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
  CONVERTED_TO_CONTRACT:
    "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold",
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

function getInitials(firstName?: string, lastName?: string) {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "CU";
}

export default function ReservationsPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "APPROVED" | "EXPIRED" | "CANCELLED"
  >("ACTIVE");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<ApiReservation | null>(
    null,
  );

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
      setError(
        err instanceof Error ? err.message : "Failed to load reservations",
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

  const filteredReservations = useMemo(() => {
    if (!debouncedSearch.trim()) return reservations;
    const term = debouncedSearch.trim().toLowerCase();
    return reservations.filter((r) => {
      const buyer = `${r.customer.firstName} ${r.customer.lastName}`.toLowerCase();
      const unitNum = r.unit.unitNumber.toLowerCase();
      const code = (
        r.reservationNumber ?? `BF-RES-${r.id.slice(0, 8)}`
      ).toLowerCase();
      const receipt = (r.receiptNumber ?? "").toLowerCase();
      return (
        buyer.includes(term) ||
        unitNum.includes(term) ||
        code.includes(term) ||
        receipt.includes(term)
      );
    });
  }, [reservations, debouncedSearch]);

  const visible = useMemo(() => {
    if (filter === "ALL") return filteredReservations;
    if (filter === "ACTIVE") {
      return filteredReservations.filter(
        (r) => r.status === "PENDING" || r.status === "APPROVED",
      );
    }
    return filteredReservations.filter((r) => r.status === filter);
  }, [filteredReservations, filter]);

  const selectedUnitDetails = useMemo(() => {
    if (!form.unitId) return null;
    return availableUnits.find((u) => u.id === form.unitId) ?? null;
  }, [form.unitId, availableUnits]);

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
      success("Unit reservation created & inventory locked successfully!");
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
      const msg =
        err instanceof Error ? err.message : "Failed to create reservation";
      setError(msg);
      toastError(msg);
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
      if (status === "APPROVED") {
        success("Reservation approved!");
      } else if (status === "CANCELLED") {
        success("Reservation cancelled & unit returned to inventory");
      } else if (status === "CONVERTED_TO_CONTRACT") {
        success("Reservation marked as converted to contract!");
      } else {
        success("Reservation status updated");
      }
      await load();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update reservation";
      setError(msg);
      toastError(msg);
    }
  };

  // KPI Calculations
  const activeCount = reservations.filter(
    (r) => r.status === "PENDING" || r.status === "APPROVED",
  ).length;
  const approvedCount = reservations.filter((r) => r.status === "APPROVED").length;
  const totalDepositVolumeETB = reservations
    .filter((r) => r.status === "PENDING" || r.status === "APPROVED")
    .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const expiringSoonCount = reservations.filter((r) => {
    if (r.status !== "PENDING" && r.status !== "APPROVED") return false;
    const diff = daysRemaining(r.expiryDate);
    return diff !== null && diff <= 3 && diff >= 0;
  }).length;
  const releasedCount = reservations.filter(
    (r) => r.status === "EXPIRED" || r.status === "CANCELLED",
  ).length;

  return (
    <DashboardShell
      title="Property Reservations"
      description="Reserve units post-site-visit, track deposit receipts, and manage automatic inventory locking & release windows."
      active="Reservations"
    >
      <div className="space-y-6">
        {/* KPI Top Stat Summary Row 
        <StatRow>
          <StatCard
            label="Active Unit Holds"
            value={String(activeCount)}
            detail="Locked unit inventory"
            icon={Lock}
            color="navy"
            trend={activeCount > 0 ? "up" : "flat"}
            trendLabel={`${approvedCount} Approved`}
          />
          <StatCard
            label="Deposits Held (ETB)"
            value={formatCurrency(totalDepositVolumeETB)}
            detail="Active reservation funds"
            icon={Coins}
            color="emerald"
          />
          <StatCard
            label="Expiring Soon (≤3 Days)"
            value={String(expiringSoonCount)}
            detail={expiringSoonCount > 0 ? "Requires action/extension" : "All holds on schedule"}
            icon={Clock}
            color="amber"
          />
          <StatCard
            label="Released / Expired"
            value={String(releasedCount)}
            detail="Returned to available stock"
            icon={Unlock}
            color="rose"
          />
        </StatRow>
        */}

        {/* Section Header & Toolbar */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#233b66]/10 text-[#233b66]">
                  <FilePlus2 className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Unit Reservation Agreements & Holding Deposits
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lock unit inventory, generate official ETB deposit vouchers, track validity deadlines, and transition to sales contracts.
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
                  placeholder="Search buyer, unit #, ref…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#233b66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#233b66] transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Create Reservation Trigger */}
              <Button
                onClick={() => setShowForm((v) => !v)}
                disabled={
                  !showForm &&
                  (customers.length === 0 || availableUnits.length === 0)
                }
                className="bg-[#233b66] hover:bg-[#1a2d50] text-white font-medium shadow-sm transition-all h-9.5 px-4"
              >
                {showForm ? (
                  <X className="size-4 mr-1.5" />
                ) : (
                  <Plus className="size-4 mr-1.5" />
                )}
                {showForm ? "Cancel Intake" : "Create Reservation"}
              </Button>
            </div>
          </div>

          {/* New Reservation Intake Form */}
          {showForm && (
            <CreateReservationModal
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              customers={customers}
              availableUnits={availableUnits}
              saving={saving}
              selectedUnitDetails={selectedUnitDetails}
            />
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
        </section>

        {/* Reservations Queue Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Filter Bar & Header Tabs */}
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter("ACTIVE")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  filter === "ACTIVE"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <Lock className="size-3.5" />
                Active Holds ({activeCount})
              </button>

              <button
                onClick={() => setFilter("APPROVED")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  filter === "APPROVED"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <CheckCircle2 className="size-3.5" />
                Approved ({approvedCount})
              </button>

              <button
                onClick={() => setFilter("EXPIRED")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  filter === "EXPIRED"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <Unlock className="size-3.5" />
                Expired / Released ({releasedCount})
              </button>

              <button
                onClick={() => setFilter("ALL")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  filter === "ALL"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <Filter className="size-3.5" />
                All Holds ({reservations.length})
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{visible.length}</span> of {reservations.length} holds
            </div>
          </div>

          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : visible.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No unit holds found"
                description={
                    search
                    ? `No reservations match "${search}". Try adjusting your search query.`
                    : "Click 'Create Reservation' to lock an available property unit and generate a deposit voucher for a prospective buyer."
                }
                actionText={search ? "Clear Search" : "Create Reservation"}
                onAction={() => (search ? setSearch("") : setShowForm(true))}
                icon={FilePlus2}
              />
            </div>
          ) : (
            <>
              {/* Mobile Stacked Card View (< 640px screens) */}
              <div className="sm:hidden divide-y divide-slate-100">
                {visible.map((reservation) => {
                  const isActive =
                    reservation.status === "PENDING" ||
                    reservation.status === "APPROVED";
                  const remDays = daysRemaining(reservation.expiryDate);

                  return (
                    <div key={reservation.id} className="p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold font-mono text-slate-900 text-xs">
                            {reservation.reservationNumber ??
                              `BF-RES-${reservation.id.slice(0, 8).toUpperCase()}`}
                          </span>
                          <span className="text-[11px] font-bold text-[#233b66]">
                            Unit {reservation.unit.unitNumber} ({reservation.unit.type})
                          </span>
                        </div>
                        <StatusPill status={reservation.status} size="sm" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5 my-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Buyer</span>
                          <span className="font-semibold text-slate-800">
                            {reservation.customer.firstName} {reservation.customer.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Deposit</span>
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(reservation.amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {isActive && remDays !== null ? (
                          remDays <= 3 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              <Flame className="size-3 text-rose-600" /> {remDays > 0 ? `${remDays} days` : "Today"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                              <Clock className="size-3 text-emerald-600" /> {remDays} days
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400">{fmtDate(reservation.expiryDate)}</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveVoucher(reservation)}
                            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-[#233b66] hover:text-white"
                            title="View Voucher"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {reservation.status === "APPROVED" && (
                            <Button
                              size="xs"
                              onClick={() => {
                                router.push(
                                  `/contracts?unitId=${reservation.unit.id}&customerId=${reservation.customer.id}&reservationId=${reservation.id}`,
                                );
                              }}
                              className="bg-[#233b66] text-white h-7 text-[11px] px-2 shadow-2xs"
                            >
                              Contract
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Data Table (>= 640px screens) */}
              <div className="hidden sm:block overflow-x-auto">
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
                      const isActive =
                        reservation.status === "PENDING" ||
                        reservation.status === "APPROVED";
                      const remDays = daysRemaining(reservation.expiryDate);

                      return (
                        <tr
                          key={reservation.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold font-mono text-slate-900 text-xs">
                                {reservation.reservationNumber ??
                                  `BF-RES-${reservation.id.slice(0, 8).toUpperCase()}`}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#233b66]">
                                <Building className="size-3 text-[#233b66]" />
                                Unit {reservation.unit.unitNumber} ({reservation.unit.type})
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 font-medium">
                            <Link
                              href={`/customers/${reservation.customer.id}`}
                              className="group inline-flex items-center gap-2 font-semibold text-[#233b66] hover:underline"
                            >
                              <span className="flex size-7 items-center justify-center rounded-full bg-[#233b66]/10 text-[11px] font-bold text-[#233b66] group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                                {getInitials(
                                  reservation.customer.firstName,
                                  reservation.customer.lastName,
                                )}
                              </span>
                              <span>
                                {reservation.customer.firstName}{" "}
                                {reservation.customer.lastName}
                              </span>
                            </Link>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-bold text-emerald-700 text-xs">
                                {formatCurrency(reservation.amount)}
                              </span>
                              {reservation.unit.price && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {(
                                    (Number(reservation.amount) /
                                      Number(reservation.unit.price)) *
                                    100
                                  ).toFixed(1)}
                                  % deposit
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-slate-700">
                                {paymentMethodLabels[
                                  reservation.paymentMethod ?? ""
                                ] ?? "Bank Transfer"}
                              </span>
                              {reservation.receiptNumber && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Ref: {reservation.receiptNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            {isActive && remDays !== null ? (
                              <div className="flex flex-col gap-1">
                                {remDays <= 1 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-900 border border-rose-300 animate-pulse">
                                    <Flame className="size-3 text-rose-700" />
                                    🚨 Day 13 Final SMS Sent ({remDays > 0 ? "1 Day Left" : "Expires Today"})
                                  </span>
                                ) : remDays <= 4 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                                    <Clock className="size-3 text-amber-700" />
                                    ⚠️ Day 10 SMS Sent ({remDays} Days Left)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                                    <CalendarDays className="size-3 text-emerald-600" />
                                    {remDays} days left
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Expires: {fmtDate(reservation.expiryDate)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-400 font-mono text-[11px]">
                                  {fmtDate(reservation.expiryDate)}
                                </span>
                                {reservation.status === "EXPIRED" && (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded w-fit">
                                    Unit Released to Available
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <StatusPill status={reservation.status} size="sm" />
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveVoucher(reservation)}
                                className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-[#233b66] hover:text-white transition-colors"
                                title="View Unit Lock Voucher"
                              >
                                <Eye className="size-3.5" />
                              </button>

                              {reservation.status === "PENDING" && (
                                <Button
                                  size="xs"
                                  onClick={() =>
                                    changeStatus(reservation.id, "APPROVED")
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2.5 shadow-2xs gap-1"
                                >
                                  <CheckCircle2 className="size-3" />
                                  Approve
                                </Button>
                              )}

                              {reservation.status === "APPROVED" && (
                                <Button
                                  size="xs"
                                  onClick={() => {
                                    router.push(
                                      `/contracts?unitId=${reservation.unit.id}&customerId=${reservation.customer.id}&reservationId=${reservation.id}`,
                                    );
                                  }}
                                  className="bg-[#233b66] hover:bg-[#1a2d50] text-white h-7 text-[11px] px-2.5 shadow-2xs gap-1"
                                  title="Convert this hold into a legal Sales Contract"
                                >
                                  <FileSignature className="size-3" />
                                  Create Contract
                                </Button>
                              )}

                              {isActive && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Release this unit hold and return unit to available inventory?",
                                      )
                                    ) {
                                      void changeStatus(
                                        reservation.id,
                                        "CANCELLED",
                                      );
                                    }
                                  }}
                                  className="border-rose-200 text-rose-700 hover:bg-rose-50 h-7 text-[11px] px-2"
                                >
                                  Release
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
            </>
          )}
        </section>

        {/* Hold Voucher Modal */}
        {activeVoucher && (
          <ReservationVoucherModal
            voucher={activeVoucher}
            onClose={() => setActiveVoucher(null)}
          />
        )}
      </div>
    </DashboardShell>
  );
}
