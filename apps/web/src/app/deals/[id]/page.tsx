"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  User,
  Building,
  Coins,
  CheckCircle2,
  BookmarkCheck,
  ScrollText,
  Clock,
  Printer,
  Trash2,
  Pencil,
  FileCheck2,
  ShieldCheck,
  Plus,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { formatDate as fmtDate } from "@/lib/date";

type UnitRef = { id: string; unitNumber: string; type: string; price?: string | number } | null;

type DealDetail = {
  id: string;
  name: string;
  value: string;
  createdAt: string;
  customer: { id: string; firstName: string; lastName: string; email?: string | null; phone?: string | null };
  stage: { id: string; name: string; probability: number };
  unit: UnitRef;
  reservation?: {
    id: string;
    reservationNumber: string | null;
    amount: string;
    status: string;
    expiryDate: string | null;
    paymentMethod: string | null;
  } | null;
  contract?: {
    id: string;
    contractNumber: string | null;
    totalAmt: string;
    downPaymentAmt: string | null;
    status: string;
    paymentPlan: string | null;
    startDate: string;
  } | null;
  payments?: {
    id: string;
    amount: string;
    method: string;
    receiptNumber: string | null;
    status: string;
    date: string;
  }[];
};

type TabKey = "reservation" | "contract" | "payments";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("reservation");

  const loadDeal = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DealDetail>(`/deals/${id}`);
      setDeal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deal details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadDeal();
  }, [loadDeal]);

  const weightedValue = useMemo(() => {
    if (!deal) return 0;
    const raw = Number(deal.value) || 0;
    const prob = (deal.stage?.probability ?? 0) / 100;
    return Math.round(raw * prob);
  }, [deal]);

  return (
    <DashboardShell
      title={deal ? deal.name : "Deal Opportunity Details"}
      description="Financial transactions, reservation holds, sales contract, and payment schedule."
      active="Pipeline"
    >
      <div className="space-y-6">
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/pipeline?tab=deals"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Sales Pipeline
          </Link>

          {deal && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5 mr-1.5 text-slate-500" />
                Print Opportunity File
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-2xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-slate-500">Loading deal opportunity…</p>
          </div>
        ) : !deal ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-slate-500">Deal record not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Stat Cards */}
            <StatRow>
              <StatCard
                label="Raw Opportunity Value"
                value={formatCurrency(deal.value)}
                detail={`Customer: ${deal.customer.firstName} ${deal.customer.lastName}`}
                color="indigo"
              />
              <StatCard
                label="Weighted Win Forecast"
                value={formatCurrency(weightedValue)}
                detail={`${deal.stage.probability}% Probability (${deal.stage.name})`}
                color="emerald"
              />
              <StatCard
                label="Linked Unit"
                value={deal.unit ? `Unit ${deal.unit.unitNumber}` : "Unlinked"}
                detail={deal.unit ? `${deal.unit.type} property` : "No unit attached"}
                color="blue"
              />
            </StatRow>

            {/* Deal Overview & Tabbed Transactions */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-6">
              {/* Deal Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                    💼
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {deal.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client:{" "}
                      <Link
                        href={`/customers/${deal.customer.id}`}
                        className="font-bold text-primary hover:underline"
                      >
                        {deal.customer.firstName} {deal.customer.lastName}
                      </Link>{" "}
                      · Created {fmtDate(deal.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    Stage: {deal.stage.name} ({deal.stage.probability}%)
                  </span>
                </div>
              </div>

              {/* Transactions Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("reservation")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2",
                    activeTab === "reservation"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <BookmarkCheck className="size-4" />
                  Reservation Deposit
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("contract")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2",
                    activeTab === "contract"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <ScrollText className="size-4" />
                  Sales Contract
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("payments")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2",
                    activeTab === "payments"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Coins className="size-4" />
                  Payment Schedule
                </button>
              </div>

              {/* Tab 1: Reservation */}
              {activeTab === "reservation" && (
                <div className="space-y-4">
                  {deal.reservation ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Reservation Ref: {deal.reservation.reservationNumber || `BF-RES-${deal.reservation.id.slice(0, 8)}`}
                        </span>
                        <StatusPill status={deal.reservation.status} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block font-semibold">Deposit Amount</span>
                          <span className="font-extrabold text-emerald-700">
                            {formatCurrency(deal.reservation.amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Payment Method</span>
                          <span className="font-bold text-slate-800">
                            {deal.reservation.paymentMethod || "Bank Transfer"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Expiry Date</span>
                          <span className="font-bold text-slate-800">
                            {fmtDate(deal.reservation.expiryDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 font-medium mb-3">
                        No reservation hold deposit record linked to this deal yet.
                      </p>
                      <Link href="/transactions?tab=reservations">
                        <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                          Create Reservation Hold
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Contract */}
              {activeTab === "contract" && (
                <div className="space-y-4">
                  {deal.contract ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Contract Ref: {deal.contract.contractNumber || `CNT-${deal.contract.id.slice(0, 8)}`}
                        </span>
                        <StatusPill status={deal.contract.status} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block font-semibold">Total Contract Value</span>
                          <span className="font-extrabold text-primary">
                            {formatCurrency(deal.contract.totalAmt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Down Payment</span>
                          <span className="font-extrabold text-emerald-700">
                            {formatCurrency(deal.contract.downPaymentAmt || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Start Date</span>
                          <span className="font-bold text-slate-800">
                            {fmtDate(deal.contract.startDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 font-medium mb-3">
                        No legal sales contract generated for this deal yet.
                      </p>
                      <Link href="/transactions?tab=contracts">
                        <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                          Generate Sales Contract
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Payment Schedule */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  {deal.payments && deal.payments.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase text-[11px]">
                          <tr>
                            <th className="px-4 py-2.5">Receipt #</th>
                            <th className="px-4 py-2.5">Amount (ETB)</th>
                            <th className="px-4 py-2.5">Method</th>
                            <th className="px-4 py-2.5">Date</th>
                            <th className="px-4 py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {deal.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-bold text-slate-900 font-mono">
                                {p.receiptNumber || `REC-${p.id.slice(0, 8)}`}
                              </td>
                              <td className="px-4 py-2.5 font-extrabold text-emerald-700">
                                {formatCurrency(p.amount)}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">{p.method}</td>
                              <td className="px-4 py-2.5 text-slate-600">{fmtDate(p.date)}</td>
                              <td className="px-4 py-2.5">
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                                  <ShieldCheck className="size-3" /> VERIFIED
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 font-medium mb-3">
                        No payment receipts logged for this deal yet.
                      </p>
                      <Link href="/transactions?tab=payments">
                        <Button size="sm" className="bg-emerald-600 text-white text-xs">
                          Record Payment Receipt
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
