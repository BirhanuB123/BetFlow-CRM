"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Trash2,
  Copy,
  Check,
  Printer,
  Calendar,
  DollarSign,
  FileText,
  BookmarkCheck,
  WalletCards,
  CheckCircle2,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { NotesPanel } from "@/components/notes/notes-panel";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { printReportDocument } from "@/lib/print";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type KycRequirement = {
  category: string;
  label: string;
  status: "VERIFIED" | "PENDING_REVIEW" | "EXPIRED" | "MISSING";
  document: any | null;
};

type KycStatusResult = {
  customerId: string;
  customerName: string;
  buyerType: "LOCAL" | "DIASPORA";
  isKycComplete: boolean;
  completionPercentage: number;
  verifiedCount: number;
  totalRequired: number;
  requirements: KycRequirement[];
};

type UnitRef = { id: string; unitNumber: string } | null;

type CustomerDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  account: { id: string; name: string } | null;
  deals: {
    id: string;
    name: string;
    value: string;
    createdAt: string;
    stage: { id: string; name: string; probability: number };
    unit: UnitRef;
  }[];
  contracts: {
    id: string;
    totalAmt: string;
    status: string;
    startDate: string;
    unit: UnitRef;
  }[];
  reservations: {
    id: string;
    amount: string;
    status: string;
    date: string;
    unit: UnitRef;
  }[];
  payments: {
    id: string;
    amount: string;
    method: string;
    status: string;
    date: string;
    contractId: string | null;
    reservationId: string | null;
  }[];
};

function money(value: string | number) {
  return formatCurrency(value);
}

const statusTone: Record<string, string> = {
  SIGNED: "bg-success/10 text-success border-success/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  PAID: "bg-success/10 text-success border-success/20",
  PENDING: "bg-warning/10 text-warning border-warning/20",
  PENDING_SIGNATURE: "bg-warning/10 text-warning border-warning/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold shadow-2xs uppercase tracking-wider",
        statusTone[status] ?? "bg-slate-100 text-slate-700 border-slate-200",
      )}
    >
      {status === "SIGNED" ||
      status === "APPROVED" ||
      status === "COMPLETED" ? (
        <CheckCircle2 className="size-3 text-success" />
      ) : null}
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [timelineKey, setTimelineKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customerRes, kycRes] = await Promise.allSettled([
        apiFetch<CustomerDetail>(`/customers/${id}`),
        apiFetch<KycStatusResult>(`/documents/kyc-status/${id}`),
      ]);

      if (customerRes.status === "fulfilled") {
        setCustomer(customerRes.value);
      } else {
        throw new Error(
          customerRes.reason instanceof Error
            ? customerRes.reason.message
            : "Failed to load customer details",
        );
      }

      if (kycRes.status === "fulfilled") {
        setKycStatus(kycRes.value);
      } else {
        setKycStatus(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load customer details",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const handleDelete = async () => {
    if (!customer) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`,
      )
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/customers/${id}`, { method: "DELETE" });
      router.push("/customers");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete customer",
      );
      setDeleting(false);
    }
  };

  const copyEmail = () => {
    if (!customer?.email) return;
    navigator.clipboard.writeText(customer.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyPhone = () => {
    if (!customer?.phone) return;
    navigator.clipboard.writeText(customer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handlePrint = () => {
    if (!customer) return;
    printReportDocument({
      title: `Customer Record: ${customer.firstName} ${customer.lastName}`,
      subtitle: `Email: ${customer.email || "N/A"} | Phone: ${customer.phone || "N/A"} | Company: ${customer.account?.name || "Independent"}`,
      metrics: [
        {
          label: "Pipeline Value",
          value: money(totals.pipeline),
          detail: `${customer.deals.length} active deals`,
        },
        {
          label: "Collected Payments",
          value: money(totals.paid),
          detail: `${customer.payments.length} transactions`,
        },
        {
          label: "Sale Contracts",
          value: String(customer.contracts.length),
          detail: "Active agreements",
        },
        {
          label: "Unit Reservations",
          value: String(customer.reservations.length),
          detail: "Reserved units",
        },
      ],
      columns: ["Section", "Summary Count", "Total Value", "Key Status"],
      rows: [
        [
          "Deals Pipeline",
          `${customer.deals.length} Deals`,
          money(totals.pipeline),
          "Active Commercial Interest",
        ],
        [
          "Contracts",
          `${customer.contracts.length} Agreements`,
          money(totals.contractTotal),
          "Active Legal Bindings",
        ],
        [
          "Reservations",
          `${customer.reservations.length} Holds`,
          money(totals.reservationTotal),
          "Unit Reserves",
        ],
        [
          "Payments",
          `${customer.payments.length} Records`,
          money(totals.paid),
          "Verified Receipts",
        ],
      ],
    });
  };

  const totals = useMemo(() => {
    if (!customer)
      return { pipeline: 0, paid: 0, contractTotal: 0, reservationTotal: 0 };
    const pipeline = customer.deals.reduce(
      (s, d) => s + Number(d.value || 0),
      0,
    );
    const paid = customer.payments
      .filter((p) => p.status === "COMPLETED" || p.status === "PAID")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const contractTotal = customer.contracts.reduce(
      (s, c) => s + Number(c.totalAmt || 0),
      0,
    );
    const reservationTotal = customer.reservations.reduce(
      (s, r) => s + Number(r.amount || 0),
      0,
    );
    return { pipeline, paid, contractTotal, reservationTotal };
  }, [customer]);

  const initials = useMemo(() => {
    if (!customer) return "C";
    return `${customer.firstName[0] || ""}${customer.lastName[0] || ""}`.toUpperCase();
  }, [customer]);

  return (
    <DashboardShell
      title={
        customer
          ? `${customer.firstName} ${customer.lastName}`
          : "Customer Details"
      }
      description="Full relationship history across deals, contracts, reservations, and payments."
      active="Contacts"
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-primary transition-all shadow-2xs cursor-pointer w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to Customer Directory
          </Link>

          {customer && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1 sm:flex-none h-8.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5 mr-1.5 text-slate-500 shrink-0" />
                Print Record
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 sm:flex-none h-8.5 text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5 mr-1.5 shrink-0" />
                {deleting ? "Deleting..." : "Delete Contact"}
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
              Loading customer profile…
            </p>
          </div>
        ) : !customer ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <p className="text-xs font-semibold text-slate-500">
              Customer record not found.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Left Content Panel */}
            <div className="space-y-6 lg:col-span-2">
              {/* Header Profile Card */}
              <section className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    {/* Initials Avatar */}
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0E6E63] to-success text-lg font-extrabold text-white shadow-md">
                      {initials}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {customer.firstName} {customer.lastName}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-[11px] font-bold text-success shadow-2xs">
                          <UserCheck className="size-3 text-success" />
                          Active Client
                        </span>
                        {kycStatus && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border shadow-2xs",
                              kycStatus.isKycComplete
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20",
                            )}
                          >
                            <ShieldCheck className="size-3" />
                            {kycStatus.isKycComplete
                              ? `KYC Complete (${kycStatus.buyerType === "DIASPORA" ? "Diaspora" : "Local"})`
                              : `KYC: ${kycStatus.verifiedCount}/${kycStatus.totalRequired} Verified (${kycStatus.buyerType === "DIASPORA" ? "Diaspora" : "Local"})`}
                          </span>
                        )}
                      </div>

                      {/* Contact Info Pills */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
                            <Mail className="size-3.5 text-slate-400" />
                            <a
                              href={`mailto:${customer.email}`}
                              className="text-slate-700 hover:text-primary transition"
                            >
                              {customer.email}
                            </a>
                            <button
                              onClick={copyEmail}
                              className="ml-1 text-slate-400 hover:text-slate-600"
                              title="Copy Email"
                            >
                              {copiedEmail ? (
                                <Check className="size-3 text-success" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {customer.phone && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
                            <Phone className="size-3.5 text-slate-400" />
                            <a
                              href={`tel:${customer.phone}`}
                              className="text-slate-700 hover:text-primary transition"
                            >
                              {customer.phone}
                            </a>
                            <button
                              onClick={copyPhone}
                              className="ml-1 text-slate-400 hover:text-slate-600"
                              title="Copy Phone"
                            >
                              {copiedPhone ? (
                                <Check className="size-3 text-success" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {customer.account && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary font-bold">
                            <Building2 className="size-3.5 text-primary" />
                            <Link
                              href={`/accounts/${customer.account.id}`}
                              className="hover:underline"
                            >
                              {customer.account.name}
                            </Link>
                          </div>
                        )}
                      </div>

                      <p className="mt-2 text-[11px] text-slate-400">
                        Customer relationship established on{" "}
                        {new Date(customer.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stat Cards Overview Grid */}
              <div className="grid gap-4 sm:grid-cols-4">
                {/* Pipeline */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Pipeline
                    </span>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-success/10 text-success border border-success/20">
                      <Briefcase className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">
                    {money(totals.pipeline)}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {customer.deals.length} active deals
                  </p>
                </div>

                {/* Collected */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Collected
                    </span>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/10">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-success">
                    {money(totals.paid)}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {customer.payments.length} payments
                  </p>
                </div>

                {/* Contracts */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Contracts
                    </span>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-info/10 text-info border border-info">
                      <FileText className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">
                    {customer.contracts.length}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Sale agreements
                  </p>
                </div>

                {/* Reservations */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Reservations
                    </span>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-warning/10 text-warning border border-warning/20">
                      <BookmarkCheck className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">
                    {customer.reservations.length}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Unit holds
                  </p>
                </div>
              </div>

              {/* 1. Deals Section */}
              <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <WalletCards className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Deals ({customer.deals.length})
                    </h3>
                  </div>
                  <Link
                    href="/pipeline?tab=deals"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Manage Deals →
                  </Link>
                </div>
                {customer.deals.length === 0 ? (
                  <p className="p-6 text-center text-xs font-medium text-slate-500">
                    No active deals associated with this customer.
                  </p>
                ) : (
                  <CrmTable
                    columns={[
                      "Deal Name",
                      "Unit",
                      "Value",
                      "Stage",
                      "Probability",
                    ]}
                    rows={customer.deals.map((deal) => [
                      <span key="n" className="font-bold text-slate-900">
                        {deal.name}
                      </span>,
                      deal.unit ? (
                        <span
                          key="u"
                          className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700"
                        >
                          Unit {deal.unit.unitNumber}
                        </span>
                      ) : (
                        "—"
                      ),
                      <span key="v" className="font-extrabold text-primary">
                        {money(deal.value)}
                      </span>,
                      <span
                        key="s"
                        className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary"
                      >
                        {deal.stage.name}
                      </span>,
                      <div key="p" className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${deal.stage.probability}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-xs">
                          {deal.stage.probability}%
                        </span>
                      </div>,
                    ])}
                  />
                )}
              </section>

              {/* 2. Contracts Section */}
              <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-info" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Contracts ({customer.contracts.length})
                    </h3>
                  </div>
                  <Link
                    href="/transactions?tab=contracts"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View Contracts →
                  </Link>
                </div>
                {customer.contracts.length === 0 ? (
                  <p className="p-6 text-center text-xs font-medium text-slate-500">
                    No active contracts for this customer.
                  </p>
                ) : (
                  <CrmTable
                    columns={["Unit", "Total Amount", "Start Date", "Status"]}
                    rows={customer.contracts.map((contract) => [
                      contract.unit ? (
                        <Link
                          key="u"
                          href={`/contracts/${contract.id}`}
                          className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          Unit {contract.unit.unitNumber}
                        </Link>
                      ) : (
                        "—"
                      ),
                      <Link
                        key="t"
                        href={`/contracts/${contract.id}`}
                        className="font-extrabold text-slate-900 hover:text-primary hover:underline"
                      >
                        {money(contract.totalAmt)}
                      </Link>,
                      new Date(contract.startDate).toLocaleDateString(),
                      <StatusBadge key="s" status={contract.status} />,
                    ])}
                  />
                )}
              </section>

              {/* 3. Reservations Section */}
              <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="size-4 text-warning" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Reservations ({customer.reservations.length})
                    </h3>
                  </div>
                  <Link
                    href="/transactions?tab=reservations"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View Reservations →
                  </Link>
                </div>
                {customer.reservations.length === 0 ? (
                  <p className="p-6 text-center text-xs font-medium text-slate-500">
                    No unit reservations found.
                  </p>
                ) : (
                  <CrmTable
                    columns={["Unit", "Deposit Amount", "Date", "Status"]}
                    rows={customer.reservations.map((reservation) => [
                      reservation.unit ? (
                        <Link
                          key="u"
                          href={`/reservations/${reservation.id}`}
                          className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          Unit {reservation.unit.unitNumber}
                        </Link>
                      ) : (
                        "—"
                      ),
                      <Link
                        key="a"
                        href={`/reservations/${reservation.id}`}
                        className="font-bold text-slate-900 hover:text-primary hover:underline"
                      >
                        {money(reservation.amount)}
                      </Link>,
                      new Date(reservation.date).toLocaleDateString(),
                      <StatusBadge key="s" status={reservation.status} />,
                    ])}
                  />
                )}
              </section>

              {/* 4. Payments Section */}
              <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-success" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Payments ({customer.payments.length})
                    </h3>
                  </div>
                  <Link
                    href="/transactions?tab=payments"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Payment Ledger →
                  </Link>
                </div>
                {customer.payments.length === 0 ? (
                  <p className="p-6 text-center text-xs font-medium text-slate-500">
                    No payment transactions recorded.
                  </p>
                ) : (
                  <CrmTable
                    columns={[
                      "Amount",
                      "Method",
                      "Applied Against",
                      "Date",
                      "Status",
                    ]}
                    rows={customer.payments.map((payment) => [
                      <span key="a" className="font-extrabold text-success">
                        {money(payment.amount)}
                      </span>,
                      <span
                        key="m"
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 uppercase"
                      >
                        {payment.method}
                      </span>,
                      payment.contractId
                        ? "Contract"
                        : payment.reservationId
                          ? "Reservation"
                          : "—",
                      new Date(payment.date).toLocaleDateString(),
                      <StatusBadge key="s" status={payment.status} />,
                    ])}
                  />
                )}
              </section>
            </div>

            {/* Right Side Panel: Documents, Notes, Activity */}
            <div className="space-y-6 lg:col-span-1">
              {/* KYC Compliance Status Panel */}
              {kycStatus && (
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      <h3 className="text-sm font-bold text-slate-900">
                        KYC Compliance
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-extrabold border",
                        kycStatus.buyerType === "DIASPORA"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-secondary text-secondary-foreground border-border",
                      )}
                    >
                      {kycStatus.buyerType === "DIASPORA"
                        ? "✈️ Diaspora Preset"
                        : "🇪🇹 Local Preset"}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        Verification Status
                      </span>
                      <span
                        className={cn(
                          "font-bold px-2 py-0.5 rounded-md text-[11px] border",
                          kycStatus.isKycComplete
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20",
                        )}
                      >
                        {kycStatus.isKycComplete
                          ? "✓ Verified"
                          : `${kycStatus.verifiedCount}/${kycStatus.totalRequired} Verified`}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          kycStatus.isKycComplete ? "bg-success" : "bg-primary",
                        )}
                        style={{ width: `${kycStatus.completionPercentage}%` }}
                      />
                    </div>

                    {/* Requirements Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {kycStatus.requirements.map((req) => (
                        <div
                          key={req.category}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <div className="truncate pr-2">
                            <p
                              className="font-semibold text-slate-800 truncate"
                              title={req.label}
                            >
                              {req.label}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded border shrink-0",
                              req.status === "VERIFIED" &&
                                "bg-success/10 text-success border-success/20",
                              req.status === "PENDING_REVIEW" &&
                                "bg-warning/10 text-warning border-warning/20",
                              req.status === "EXPIRED" &&
                                "bg-destructive/10 text-destructive border-destructive/20",
                              req.status === "MISSING" &&
                                "bg-slate-200/70 text-slate-500 border-slate-300/70",
                            )}
                          >
                            {req.status === "VERIFIED"
                              ? "✓ Verified"
                              : req.status === "PENDING_REVIEW"
                                ? "Pending"
                                : req.status === "EXPIRED"
                                  ? "Expired"
                                  : "Missing"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        {kycStatus.buyerType === "DIASPORA"
                          ? "Foreign passport & MoFA POA required"
                          : "Kebele ID, Passport & TIN required"}
                      </span>
                      <Link
                        href="/documents"
                        className="text-[11px] font-semibold text-primary hover:underline shrink-0"
                      >
                        Manage Hub →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <DocumentsPanel
                  entityType="CUSTOMER"
                  entityId={customer.id}
                  title="Customer Documents"
                />
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden p-4">
                <NotesPanel
                  entityType="Customer"
                  entityId={customer.id}
                  onChange={() => setTimelineKey((k) => k + 1)}
                />
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden p-4">
                <ActivityTimeline
                  key={timelineKey}
                  entityType="Customer"
                  entityId={customer.id}
                  title="Customer Activity History"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
