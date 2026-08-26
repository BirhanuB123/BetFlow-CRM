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
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Search,
  FileSignature,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { StatusPill } from "@/components/ui/status-pill";
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
  PENDING: "bg-warning/10 text-warning border-warning/20 font-medium",
  APPROVED: "bg-success/10 text-success border-success/20 font-bold",
  CONVERTED_TO_CONTRACT:
    "bg-primary/10 text-primary border-primary/20 font-bold",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
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

export function ReservationsView() {
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
          reservationNumber: form.reservationNumber || undefined,
          customerId: form.customerId,
          unitId: form.unitId,
          amount: form.amount,
          holdPeriodDays: Number(form.holdPeriodDays) || 14,
          paymentMethod: form.paymentMethod,
          receiptNumber: form.receiptNumber || undefined,
          notes: form.notes || undefined,
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
      success("Unit reservation created successfully. Inventory locked!");
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
      await apiFetch<ApiReservation>(`/reservations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (status === "APPROVED") {
        success("Reservation approved and deposit confirmed!");
      } else if (status === "CANCELLED") {
        success("Reservation hold released. Unit restored to available stock.");
      }
      await load();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update reservation";
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
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
              {(
                [
                  { id: "ACTIVE", label: "Active Holds" },
                  { id: "APPROVED", label: "Approved" },
                  { id: "EXPIRED", label: "Expired/Released" },
                  { id: "ALL", label: "All" },
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

            <Button
              onClick={() => setShowForm(true)}
              disabled={availableUnits.length === 0 || customers.length === 0}
              className="h-9.5 font-semibold text-xs px-4 shadow-sm gap-1.5"
            >
              <Plus className="size-4" />
              New Unit Reservation
            </Button>
          </div>
        </div>

        {availableUnits.length === 0 && !loading && (
          <div className="mt-4 rounded-lg border border-warning/20 bg-warning/10/60 p-3 text-xs font-semibold text-warning flex items-center justify-between">
            <span>
              Notice: All units are currently reserved or sold. No AVAILABLE inventory available to lock.
            </span>
            <Link
              href="/units"
              className="text-[#233b66] underline hover:text-[#1a2d50]"
            >
              View Stacking Matrix →
            </Link>
          </div>
        )}
      </section>

      {/* New Reservation Modal */}
      {showForm && (
        <CreateReservationModal
          form={form}
          setForm={setForm}
          customers={customers}
          availableUnits={availableUnits}
          selectedUnitDetails={selectedUnitDetails}
          saving={saving}
          onSubmit={handleCreate}
        />
      )}

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive shadow-2xs">
          {error}
        </div>
      )}

      {/* Main Table Section */}
      <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : visible.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Unit Reservations Found"
              description="No holding deposit records match your current filter or search query."
              actionText="Create Reservation"
              onAction={() => setShowForm(true)}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Reservation Ref</th>
                    <th className="px-4 py-3">Buyer / Customer</th>
                    <th className="px-4 py-3">Property Unit</th>
                    <th className="px-4 py-3">Deposit Amount (ETB)</th>
                    <th className="px-4 py-3">Hold Expiry Window</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {visible.map((reservation) => {
                    const daysLeft = daysRemaining(reservation.expiryDate);
                    const isActive =
                      reservation.status === "PENDING" ||
                      reservation.status === "APPROVED";

                    return (
                      <tr
                        key={reservation.id}
                        className="transition-colors hover:bg-slate-50/80 group"
                      >
                        {/* Ref / Code */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-extrabold text-[11px]">
                              #
                            </div>
                            <div>
                              <Link
                                href={`/reservations/${reservation.id}`}
                                className="font-extrabold text-[#233b66] hover:underline"
                              >
                                {reservation.reservationNumber ||
                                  `BF-RES-${reservation.id.slice(0, 8)}`}
                              </Link>
                              <p className="text-[10px] text-slate-400">
                                {fmtDate(reservation.date)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Buyer */}
                        <td className="px-4 py-3">
                          <Link
                            href={`/customers/${reservation.customer.id}`}
                            className="flex items-center gap-2 group/buyer"
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[#233b66] font-bold text-[10px]">
                              {getInitials(
                                reservation.customer.firstName,
                                reservation.customer.lastName,
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover/buyer:text-[#233b66] group-hover/buyer:underline transition-colors">
                                {reservation.customer.firstName}{" "}
                                {reservation.customer.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Property Buyer
                              </p>
                            </div>
                          </Link>
                        </td>

                        {/* Unit */}
                        <td className="px-4 py-3">
                          <div>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                              🏢 Unit {reservation.unit.unitNumber}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {reservation.unit.type} · Total{" "}
                              {formatCurrency(reservation.unit.price)}
                            </p>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-extrabold text-success text-xs block">
                              {formatCurrency(reservation.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {paymentMethodLabels[
                                reservation.paymentMethod || ""
                              ] ||
                                reservation.paymentMethod ||
                                "Bank Transfer"}
                              {reservation.receiptNumber
                                ? ` (Rec: ${reservation.receiptNumber})`
                                : ""}
                            </span>
                          </div>
                        </td>

                        {/* Expiry Window */}
                        <td className="px-4 py-3">
                          {isActive ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="size-3.5 text-warning" />
                                <span
                                  className={cn(
                                    "font-bold text-xs",
                                    daysLeft !== null && daysLeft <= 3
                                      ? "text-destructive"
                                      : "text-slate-900",
                                  )}
                                >
                                  {daysLeft !== null
                                    ? daysLeft < 0
                                      ? "Hold Expired"
                                      : `${daysLeft} Days Remaining`
                                    : `${reservation.holdPeriodDays} Days`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Deadline: {fmtDate(reservation.expiryDate)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Hold Released / Closed
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusPill status={reservation.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/reservations/${reservation.id}`}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-primary hover:text-primary-foreground transition-colors inline-flex items-center justify-center"
                              title="View Full Reservation Details & Documents"
                            >
                              <Eye className="size-3.5" />
                            </Link>

                            {reservation.status === "PENDING" && (
                              <Button
                                size="xs"
                                onClick={() =>
                                  changeStatus(reservation.id, "APPROVED")
                                }
                                className="h-7 text-[11px] px-2.5 shadow-2xs gap-1"
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
                                    `/transactions?tab=contracts&unitId=${reservation.unit.id}&customerId=${reservation.customer.id}&reservationId=${reservation.id}`,
                                  );
                                }}
                                className="h-7 text-[11px] px-2.5 shadow-2xs gap-1"
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
                                className="border-destructive/20 text-destructive hover:bg-destructive/10 h-7 text-[11px] px-2"
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
  );
}
