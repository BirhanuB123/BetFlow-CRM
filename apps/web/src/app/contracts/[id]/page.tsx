"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ScrollText,
  Building,
  User,
  Coins,
  CalendarDays,
  Printer,
  ShieldCheck,
  FileSignature,
  FileCheck2,
  ExternalLink,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { formatDate as fmtDate } from "@/lib/date";
import { cn } from "@/lib/utils";

type ContractDetail = {
  id: string;
  contractNumber: string | null;
  status: string;
  totalAmt: string;
  downPaymentAmt: string | null;
  paymentPlan: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  notes?: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  };
  unit: {
    id: string;
    unitNumber: string;
    type: string;
    status: string;
  };
  deal?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    payments: number;
    schedules: number;
  };
};

type ContractDocumentRequirement = {
  category: string;
  label: string;
  status: "VERIFIED" | "PENDING_REVIEW" | "EXPIRED" | "MISSING";
  document: {
    id: string;
    name: string;
    fileUrl: string;
    status: string;
  } | null;
};

type ContractComplianceResult = {
  contractId: string;
  contractNumber: string;
  buyerName: string;
  unitNumber: string;
  isComplete: boolean;
  completionPercentage: number;
  verifiedCount: number;
  totalRequired: number;
  requirements: ContractDocumentRequirement[];
};

const paymentPlanLabels: Record<string, string> = {
  INSTALLMENTS_24M: "Installment Plan (24 Months)",
  BANK_MORTGAGE_3070: "Bank Mortgage (30/70)",
  FULL_CASH: "Full Cash Discount",
  DIASPORA_USD: "Diaspora USD Foreign Currency",
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [compliance, setCompliance] = useState<ContractComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContract = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [contractData, complianceData] = await Promise.allSettled([
        apiFetch<ContractDetail>(`/contracts/${id}`),
        apiFetch<ContractComplianceResult>(`/documents/contract-status/${id}`),
      ]);

      if (contractData.status === "fulfilled") {
        setContract(contractData.value);
      } else {
        throw contractData.reason;
      }

      if (complianceData.status === "fulfilled") {
        setCompliance(complianceData.value);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load contract details",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  return (
    <DashboardShell
      title={
        contract?.contractNumber || (contract ? `Contract #${contract.id.slice(0, 8)}` : "Sales Contract Details")
      }
      description="Legal agreement, financial terms, down payment commitments, and attached documents."
      active="Contracts"
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/transactions?tab=contracts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="size-3.5 text-slate-500" />
              <span>Back to Contracts</span>
            </Link>
            <span className="text-slate-300 font-bold">•</span>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors truncate"
            >
              Transactions
            </Link>
          </div>

          {contract && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Link href={`/contracts/verify/${contract.id}`} className="flex-1 sm:flex-none">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-8.5 text-xs font-semibold border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                >
                  <ShieldCheck className="size-3.5 mr-1.5 text-primary shrink-0" />
                  Audit Verification
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex-1 sm:flex-none h-8.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5 mr-1.5 text-slate-500 shrink-0" />
                Print Agreement
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
              Loading contract record…
            </p>
          </div>
        ) : !contract ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-slate-500">
              Contract record not found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat Cards */}
            <StatRow>
              <StatCard
                label="Total Contract Value"
                value={formatCurrency(contract.totalAmt)}
                detail={`Payment Plan: ${paymentPlanLabels[contract.paymentPlan || ""] || "Standard"}`}
                color="indigo"
              />
              <StatCard
                label="Down Payment"
                value={formatCurrency(contract.downPaymentAmt || 0)}
                detail={`Start Date: ${fmtDate(contract.startDate)}`}
                color="emerald"
              />
              <StatCard
                label="Property Unit"
                value={`Unit ${contract.unit.unitNumber}`}
                detail={`${contract.unit.type} (${contract.unit.status})`}
                color="blue"
              />
            </StatRow>

            {/* Main Content & Side Panel Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
              {/* Left 2 Columns: Contract Overview & Buyer Info */}
              <div className="space-y-6 lg:col-span-2">
                {/* Agreement Summary Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 sm:p-6 space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                        <ScrollText className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                          {contract.contractNumber || `CNT-${contract.id.slice(0, 8)}`}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Created {fmtDate(contract.createdAt)} · Start: {fmtDate(contract.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={contract.status} />
                      {compliance && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border",
                            compliance.isComplete
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20",
                          )}
                        >
                          <ShieldCheck className="size-3.5 shrink-0" />
                          <span>
                            {compliance.isComplete
                              ? "✓ Docs Complete"
                              : `Docs: ${compliance.verifiedCount}/${compliance.totalRequired} Verified`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial & Schedule Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Total Price</span>
                      <span className="font-extrabold text-primary text-sm mt-0.5 block truncate">
                        {formatCurrency(contract.totalAmt)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Down Payment</span>
                      <span className="font-extrabold text-success text-sm mt-0.5 block truncate">
                        {formatCurrency(contract.downPaymentAmt || 0)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 sm:col-span-2 md:col-span-1">
                      <span className="text-slate-400 block font-semibold">Payment Plan</span>
                      <span className="font-bold text-slate-800 mt-0.5 block truncate">
                        {paymentPlanLabels[contract.paymentPlan || ""] || "Custom Schedule"}
                      </span>
                    </div>
                  </div>

                  {/* Buyer & Unit Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="size-3.5 text-primary shrink-0" />
                          Buyer Information
                        </span>
                        <Link
                          href={`/customers/${contract.customer.id}`}
                          className="text-[11px] font-bold text-primary hover:underline shrink-0"
                        >
                          View Profile →
                        </Link>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900 truncate">
                        {contract.customer.firstName} {contract.customer.lastName}
                      </p>
                      {contract.customer.email && (
                        <p className="text-xs text-slate-600 truncate">{contract.customer.email}</p>
                      )}
                      {contract.customer.phone && (
                        <p className="text-xs text-slate-600 font-mono truncate">{contract.customer.phone}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="size-3.5 text-info shrink-0" />
                          Bound Property Unit
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {contract.unit.status}
                        </span>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900 truncate">
                        Unit {contract.unit.unitNumber}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        Type: {contract.unit.type}
                      </p>
                      {contract.deal && (
                        <p className="text-xs text-slate-600 truncate">
                          Linked Deal:{" "}
                          <Link
                            href={`/deals/${contract.deal.id}`}
                            className="font-bold text-primary hover:underline"
                          >
                            {contract.deal.name}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>

                  {contract.notes && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                      <span className="font-semibold text-slate-500 block mb-1">
                        Special Provisions & Notes:
                      </span>
                      <p className="text-slate-700">{contract.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Required Documents Checklist & Documents Panel */}
              <div className="space-y-6 lg:col-span-1">
                {/* Contract Compliance Checklist Card */}
                {compliance && (
                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={cn(
                            "size-5",
                            compliance.isComplete
                              ? "text-success"
                              : "text-warning",
                          )}
                        />
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Legal Document Audit
                          </h3>
                          <p className="text-[10px] text-slate-400">
                            Required Contract Execution Package
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-extrabold",
                          compliance.isComplete
                            ? "text-success"
                            : "text-warning",
                        )}
                      >
                        {compliance.completionPercentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            compliance.isComplete
                              ? "bg-success"
                              : "bg-warning",
                          )}
                          style={{
                            width: `${compliance.completionPercentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 text-right">
                        {compliance.verifiedCount} of {compliance.totalRequired} required items verified
                      </p>
                    </div>

                    {/* Checklist Requirements */}
                    <div className="space-y-2 pt-1">
                      {compliance.requirements.map((req) => (
                        <div
                          key={req.category}
                          className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs transition-colors hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 block truncate">
                              {req.label}
                            </span>
                            {req.document ? (
                              <span className="text-[10px] text-slate-400 block truncate">
                                Attached: {req.document.name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block">
                                Not uploaded to contract package
                              </span>
                            )}
                          </div>

                          <div className="shrink-0">
                            {req.status === "VERIFIED" && (
                              <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success border border-success/30">
                                Verified
                              </span>
                            )}
                            {req.status === "PENDING_REVIEW" && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-500/30">
                                Review
                              </span>
                            )}
                            {req.status === "EXPIRED" && (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-500/30">
                                Expired
                              </span>
                            )}
                            {req.status === "MISSING" && (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                Missing
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                  <DocumentsPanel
                    entityType="CONTRACT"
                    entityId={contract.id}
                    title="Contract Documents"
                  />
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link href={`/contracts/verify/${contract.id}`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldCheck className="size-3.5 mr-2 text-primary" />
                        Inspect Digital Signatures
                      </Button>
                    </Link>
                    <Link href={`/customers/${contract.customer.id}`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <User className="size-3.5 mr-2 text-slate-500" />
                        Buyer KYC & Documents
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
