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
import { DocumentsPanel } from "@/components/documents/documents-panel";
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
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <Link
            href="/pipeline?tab=deals"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all shadow-2xs cursor-pointer w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to Sales Pipeline
          </Link>

          {deal && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="w-full sm:w-auto h-8.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5 mr-1.5 text-slate-500 shrink-0" />
                Print Opportunity File
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

            {/* Main Content & Side Panel Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
              {/* Left 2 Cols: Deal Overview & Tabbed Transactions */}
              <div className="space-y-6 lg:col-span-2">
                {/* Summary Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 sm:p-6 space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                        <Briefcase className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                          {deal.name}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Stage: {deal.stage.name} · Created {fmtDate(deal.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <StatusPill status={deal.stage.name} />
                    </div>
                  </div>

                  {/* Deal Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Deal Value</span>
                      <span className="font-extrabold text-primary text-sm mt-0.5 block truncate">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Win Probability</span>
                      <span className="font-extrabold text-success text-sm mt-0.5 block truncate">
                        {deal.stage.probability}%
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 sm:col-span-2 md:col-span-1">
                      <span className="text-slate-400 block font-semibold">Stage Category</span>
                      <span className="font-bold text-slate-800 mt-0.5 block truncate">
                        {deal.stage.name}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Unit Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="size-3.5 text-primary shrink-0" />
                          Buyer Customer
                        </span>
                        <Link
                          href={`/customers/${deal.customer.id}`}
                          className="text-[11px] font-bold text-primary hover:underline shrink-0"
                        >
                          Profile →
                        </Link>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900 truncate">
                        {deal.customer.firstName} {deal.customer.lastName}
                      </p>
                      {deal.customer.email && (
                        <p className="text-xs text-slate-600 truncate">{deal.customer.email}</p>
                      )}
                      {deal.customer.phone && (
                        <p className="text-xs text-slate-600 font-mono truncate">{deal.customer.phone}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="size-3.5 text-info shrink-0" />
                          Property Unit
                        </span>
                      </div>
                      {deal.unit ? (
                        <>
                          <p className="font-extrabold text-sm text-slate-900 truncate">
                            Unit {deal.unit.unitNumber}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            Type: {deal.unit.type} · List Price: {formatCurrency(deal.unit.price || 0)}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          No specific property unit linked to this opportunity.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked Transactions Section with Horizontal Scroll Tabs */}
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab("reservation")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0",
                        activeTab === "reservation"
                          ? "bg-primary text-white shadow-2xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <BookmarkCheck className="size-4 shrink-0" />
                      Reservation Hold
                    </button>
                    <button
                      onClick={() => setActiveTab("contract")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0",
                        activeTab === "contract"
                          ? "bg-primary text-white shadow-2xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <ScrollText className="size-4 shrink-0" />
                      Sales Contract
                    </button>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0",
                        activeTab === "payments"
                          ? "bg-primary text-white shadow-2xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <Coins className="size-4 shrink-0" />
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
                              Reservation Ref:{" "}
                              <Link
                                href={`/reservations/${deal.reservation.id}`}
                                className="text-primary hover:underline font-extrabold"
                              >
                                {deal.reservation.reservationNumber ||
                                  `BF-RES-${deal.reservation.id.slice(0, 8)}`}
                              </Link>
                            </span>
                            <StatusPill status={deal.reservation.status} />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block font-semibold">
                                Deposit Amount
                              </span>
                              <span className="font-extrabold text-success">
                                {formatCurrency(deal.reservation.amount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">
                                Payment Method
                              </span>
                              <span className="font-bold text-slate-800">
                                {deal.reservation.paymentMethod ||
                                  "Bank Transfer"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">
                                Expiry Date
                              </span>
                              <span className="font-bold text-slate-800">
                                {fmtDate(deal.reservation.expiryDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                          <p className="text-xs text-slate-500 font-medium mb-3">
                            No reservation hold deposit record linked to this deal
                            yet.
                          </p>
                          <Link href="/transactions?tab=reservations">
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground text-xs"
                            >
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
                              Contract Ref:{" "}
                              <Link
                                href={`/contracts/${deal.contract.id}`}
                                className="text-primary hover:underline font-extrabold"
                              >
                                {deal.contract.contractNumber ||
                                  `CNT-${deal.contract.id.slice(0, 8)}`}
                              </Link>
                            </span>
                            <StatusPill status={deal.contract.status} />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block font-semibold">
                                Total Contract Value
                              </span>
                              <span className="font-extrabold text-primary">
                                {formatCurrency(deal.contract.totalAmt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">
                                Down Payment
                              </span>
                              <span className="font-extrabold text-success">
                                {formatCurrency(
                                  deal.contract.downPaymentAmt || 0,
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">
                                Start Date
                              </span>
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
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground text-xs"
                            >
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
                                    {p.receiptNumber ||
                                      `REC-${p.id.slice(0, 8)}`}
                                  </td>
                                  <td className="px-4 py-2.5 font-extrabold text-success">
                                    {formatCurrency(p.amount)}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {p.method}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {fmtDate(p.date)}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className="inline-flex items-center gap-1 text-success font-bold text-xs">
                                      <ShieldCheck className="size-3" />{" "}
                                      VERIFIED
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
                            <Button
                              size="sm"
                              className="bg-success text-white text-xs"
                            >
                              Record Payment Receipt
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Column: Documents Panel */}
              <div className="space-y-6 lg:col-span-1">
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                  <DocumentsPanel
                    entityType="DEAL"
                    entityId={deal.id}
                    title="Deal Documents"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
