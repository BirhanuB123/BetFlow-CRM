"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  Building,
  User,
  Coins,
  CalendarDays,
  Printer,
  Receipt,
  Banknote,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileSignature,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { formatDate as fmtDate, daysRemaining } from "@/lib/date";
import { cn } from "@/lib/utils";

type ReservationDetail = {
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
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  unit: {
    id: string;
    unitNumber: string;
    type: string;
    status: string;
    floor?: {
      building?: {
        project?: {
          id: string;
          name: string;
        };
      };
    };
  };
  _count?: {
    payments: number;
  };
};

const paymentMethodLabels: Record<string, string> = {
  BANK_TRANSFER: "CBE / Bank Transfer (የባንክ ሐዋላ)",
  TELEBIRR: "Telebirr (ቴሌብር)",
  CBE_BIRR: "CBE Birr (ሲቢኢ ብር)",
  CASH_DEPOSIT: "Cash Deposit (በጥሬ ገንዘብ)",
  CHECK: "Check (በቼክ)",
};

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservation = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ReservationDetail>(`/reservations/${id}`);
      setReservation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reservation details",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadReservation();
  }, [loadReservation]);

  const daysLeft = reservation?.expiryDate
    ? daysRemaining(reservation.expiryDate)
    : null;

  return (
    <DashboardShell
      title={
        reservation?.reservationNumber ||
        (reservation
          ? `Reservation #${reservation.id.slice(0, 8)}`
          : "Unit Holding Reservation Details")
      }
      description="Unit inventory lock, holding deposit details, expiration window, and attached documents."
      active="Transactions"
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/transactions?tab=reservations"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="size-3.5 text-slate-500" />
              <span>Back to Reservations</span>
            </Link>
            <span className="text-slate-300 font-bold">•</span>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors truncate"
            >
              Transactions
            </Link>
          </div>

          {reservation && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="w-full sm:w-auto h-8.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5 mr-1.5 text-slate-500 shrink-0" />
                Print Voucher
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive shadow-2xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-slate-500">
              Loading reservation hold…
            </p>
          </div>
        ) : !reservation ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-slate-500">
              Reservation record not found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat Cards */}
            <StatRow>
              <StatCard
                label="Holding Deposit Paid"
                value={formatCurrency(reservation.amount)}
                detail={`Method: ${paymentMethodLabels[reservation.paymentMethod || ""] || "Bank Transfer"}`}
                color="emerald"
              />
              <StatCard
                label="Hold Expiration"
                value={
                  daysLeft !== null
                    ? daysLeft > 0
                      ? `${daysLeft} Days Left`
                      : "Expired"
                    : "No Expiry Set"
                }
                detail={`Expiry: ${fmtDate(reservation.expiryDate)} (${reservation.holdPeriodDays} days window)`}
                color={daysLeft !== null && daysLeft <= 3 ? "rose" : "amber"}
              />
              <StatCard
                label="Locked Unit"
                value={`Unit ${reservation.unit.unitNumber}`}
                detail={`${reservation.unit.type} (${reservation.unit.status})`}
                color="blue"
              />
            </StatRow>

            {/* Main Content & Side Panel Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
              {/* Left 2 Columns: Reservation Details */}
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 sm:p-6 space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                        <BookmarkCheck className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                          {reservation.reservationNumber ||
                            `BF-RES-${reservation.id.slice(0, 8)}`}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Issued on {fmtDate(reservation.date)} · Lock Period: {reservation.holdPeriodDays} Days
                        </p>
                      </div>
                    </div>

                    <div>
                      <StatusPill status={reservation.status} />
                    </div>
                  </div>

                  {/* Financial & Window Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Deposit Amount</span>
                      <span className="font-extrabold text-success text-sm mt-0.5 block truncate">
                        {formatCurrency(reservation.amount)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Payment Method</span>
                      <span className="font-bold text-slate-800 mt-0.5 block truncate">
                        {paymentMethodLabels[reservation.paymentMethod || ""] || "Bank Transfer"}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 sm:col-span-2 md:col-span-1">
                      <span className="text-slate-400 block font-semibold">Bank Receipt / Ref</span>
                      <span className="font-mono font-bold text-slate-900 mt-0.5 block truncate">
                        {reservation.receiptNumber || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Buyer & Unit Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="size-3.5 text-primary shrink-0" />
                          Reserved By
                        </span>
                        <Link
                          href={`/customers/${reservation.customer.id}`}
                          className="text-[11px] font-bold text-primary hover:underline shrink-0"
                        >
                          Customer Profile →
                        </Link>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900 truncate">
                        {reservation.customer.firstName} {reservation.customer.lastName}
                      </p>
                      {reservation.customer.phone && (
                        <p className="text-xs text-slate-600 font-mono truncate">
                          Phone: {reservation.customer.phone}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="size-3.5 text-info shrink-0" />
                          Locked Unit
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {reservation.unit.status}
                        </span>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900 truncate">
                        Unit {reservation.unit.unitNumber}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        Type: {reservation.unit.type}
                      </p>
                      {reservation.unit.floor?.building?.project && (
                        <p className="text-xs text-slate-600 truncate">
                          Project: {reservation.unit.floor.building.project.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                      <span className="font-semibold text-slate-500 block mb-1">
                        Special Hold Conditions & Notes:
                      </span>
                      <p className="text-slate-700">{reservation.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Documents Panel & Quick Actions */}
              <div className="space-y-6 lg:col-span-1">
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                  <DocumentsPanel
                    entityType="RESERVATION"
                    entityId={reservation.id}
                    title="Reservation Documents"
                  />
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Actions & Next Steps
                  </h3>
                  <div className="space-y-2">
                    <Link href={`/contracts/builder`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                      >
                        <FileSignature className="size-3.5 mr-2 text-primary" />
                        Generate Sales Contract
                      </Button>
                    </Link>
                    <Link href={`/customers/${reservation.customer.id}`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <User className="size-3.5 mr-2 text-slate-500" />
                        Buyer KYC Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
