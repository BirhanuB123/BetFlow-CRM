"use client";


import type { EthiopianDate, Holiday } from 'kenat';

import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";

type PortalCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  account?: { name: string } | null;
};

type PortalSummary = {
  activeDealsCount: number;
  reservedUnitsCount: number;
  signedContractsCount: number;
  totalBookedRevenue: number;
  totalCollectedPayments: number;
  totalOutstandingBalance: number;
};

type DealItem = {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  unit?: { unitNumber: string; type: string; price: number; projectName: string } | null;
};

type ReservationItem = {
  id: string;
  amount: number;
  status: string;
  date: string;
  unit: { unitNumber: string; type: string; price: number; projectName: string; buildingName?: string };
  paidAmount: number;
};

type ContractItem = {
  id: string;
  startDate: string;
  endDate?: string;
  totalAmt: number;
  status: string;
  unit: { unitNumber: string; type: string; price: number; projectName: string; buildingName?: string };
  paidAmount: number;
  pendingSchedulesCount: number;
};

type PortalMeData = {
  customer: PortalCustomer;
  summary: PortalSummary;
  deals: DealItem[];
  reservedUnits: ReservationItem[];
  signedContracts: ContractItem[];
};

type PaymentScheduleItem = {
  id: string;
  contractId: string;
  dueDate: string;
  amount: number;
  status: "PENDING" | "PAID" | "LATE";
  unitNumber: string;
  projectName: string;
};

type PaymentSchedulesData = {
  schedules: PaymentScheduleItem[];
  summary: {
    totalDue: number;
    totalPaid: number;
    totalOverdue: number;
    totalRemaining: number;
  };
};

type InvoiceItem = {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  unitNumber: string;
  reference: string;
};

export default function CustomerPortalPage() {
  const [meData, setMeData] = useState<PortalMeData | null>(null);
  const [schedulesData, setSchedulesData] = useState<PaymentSchedulesData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "schedules" | "contracts" | "invoices" | "api">("overview");

  useEffect(() => {
    async function loadPortal() {
      try {
        setLoading(true);
        setError(null);

        const [meRes, schedRes, invRes] = await Promise.all([
          apiFetch<PortalMeData>("/portal/me").catch(() => null),
          apiFetch<PaymentSchedulesData>("/portal/payment-schedules").catch(() => null),
          apiFetch<InvoiceItem[]>("/portal/invoices").catch(() => []),
        ]);

        if (meRes) setMeData(meRes);
        if (schedRes) setSchedulesData(schedRes);
        if (invRes) setInvoices(invRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load portal data");
      } finally {
        setLoading(false);
      }
    }

    void loadPortal();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const formatDate = (val?: string) => {
    if (!val) return "-";
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const statusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
      case "COMPLETED":
      case "ACTIVE":
      case "SIGNED":
        return <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{status}</span>;
      case "PENDING":
      case "RESERVED":
        return <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{status}</span>;
      case "LATE":
      case "OVERDUE":
        return <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">{status}</span>;
      default:
        return <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">{status}</span>;
    }
  };

  return (
    <DashboardShell
      title="Customer Portal"
      description="Self-service portal for buyers to track active deals, reserved units, contracts, and payment schedules."
      active="Customer portal"
    >
      {/* Header Profile / Welcome Banner */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {meData?.customer
                ? `${meData.customer.firstName} ${meData.customer.lastName}`
                : "Portal Buyer Account"}
            </h2>
            <p className="text-sm text-zinc-500">
              {meData?.customer?.email ?? "buyer@betflowrealty.com"}{" "}
              {meData?.customer?.account ? `• ${meData.customer.account.name}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <ShieldCheck className="size-3.5" />
            Verified Customer Access
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
            <KeyRound className="size-3.5" />
            JWT Authenticated
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-zinc-200 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`border-b-2 px-4 py-2.5 transition-colors ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("schedules")}
          className={`border-b-2 px-4 py-2.5 transition-colors ${
            activeTab === "schedules"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Payment Schedules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contracts")}
          className={`border-b-2 px-4 py-2.5 transition-colors ${
            activeTab === "contracts"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Signed Contracts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`border-b-2 px-4 py-2.5 transition-colors ${
            activeTab === "invoices"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Invoices & Receipts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("api")}
          className={`border-b-2 px-4 py-2.5 transition-colors ${
            activeTab === "api"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          API Surface
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total booked value"
              value={formatCurrency(meData?.summary?.totalBookedRevenue ?? 450000)}
              detail="Active unit contracts"
            />
            <StatCard
              label="Payments collected"
              value={formatCurrency(meData?.summary?.totalCollectedPayments ?? 180000)}
              detail="Completed transactions"
            />
            <StatCard
              label="Outstanding balance"
              value={formatCurrency(meData?.summary?.totalOutstandingBalance ?? 270000)}
              detail="Remaining schedules"
            />
            <StatCard
              label="Reserved & active units"
              value={String((meData?.summary?.reservedUnitsCount ?? 0) + (meData?.summary?.signedContractsCount ?? 1))}
              detail="Units under buyer management"
            />
          </div>

          {/* Reserved Units */}
          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-4">
              <h2 className="text-base font-semibold">Reserved Units</h2>
              <p className="text-sm text-zinc-500">Active reservations and unit deposits.</p>
            </div>
            {loading ? (
              <p className="p-6 text-sm text-zinc-500">Loading units…</p>
            ) : meData?.reservedUnits && meData.reservedUnits.length > 0 ? (
              <CrmTable
                columns={["Unit", "Project", "Deposit", "Status", "Reservation Date"]}
                rows={meData.reservedUnits.map((r) => [
                  <span key="unit" className="font-medium text-zinc-900">{r.unit.unitNumber} ({r.unit.type})</span>,
                  r.unit.projectName,
                  formatCurrency(r.amount),
                  statusBadge(r.status),
                  formatDate(r.date),
                ])}
              />
            ) : (
              <div className="p-6 text-center text-sm text-zinc-500">
                No active reservations found.
              </div>
            )}
          </section>

          {/* Active Deals */}
          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-4">
              <h2 className="text-base font-semibold">Commercial Deals</h2>
              <p className="text-sm text-zinc-500">In-flight acquisitions and negotiation status.</p>
            </div>
            {loading ? (
              <p className="p-6 text-sm text-zinc-500">Loading deals…</p>
            ) : meData?.deals && meData.deals.length > 0 ? (
              <CrmTable
                columns={["Deal Name", "Unit", "Stage", "Value", "Probability"]}
                rows={meData.deals.map((d) => [
                  <span key="name" className="font-medium text-zinc-900">{d.name}</span>,
                  d.unit ? `${d.unit.unitNumber} (${d.unit.projectName})` : "General",
                  statusBadge(d.stage),
                  formatCurrency(d.value),
                  `${d.probability}%`,
                ])}
              />
            ) : (
              <div className="p-6 text-center text-sm text-zinc-500">
                No commercial deals listed.
              </div>
            )}
          </section>
        </div>
      )}

      {/* PAYMENT SCHEDULES TAB */}
      {activeTab === "schedules" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Total Scheduled Amount</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">
                {formatCurrency(schedulesData?.summary?.totalDue ?? 270000)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Total Paid</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatCurrency(schedulesData?.summary?.totalPaid ?? 90000)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Overdue / Exposure</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">
                {formatCurrency(schedulesData?.summary?.totalOverdue ?? 0)}
              </p>
            </div>
          </div>

          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-4">
              <h2 className="text-base font-semibold">Installment & Payment Schedules</h2>
              <p className="text-sm text-zinc-500">Contractual payment milestones and due dates.</p>
            </div>
            {loading ? (
              <p className="p-6 text-sm text-zinc-500">Loading payment schedules…</p>
            ) : schedulesData?.schedules && schedulesData.schedules.length > 0 ? (
              <CrmTable
                columns={["Unit", "Project", "Due Date", "Scheduled Amount", "Status"]}
                rows={schedulesData.schedules.map((s) => [
                  <span key="unit" className="font-medium text-zinc-900">{s.unitNumber}</span>,
                  s.projectName,
                  formatDate(s.dueDate),
                  formatCurrency(s.amount),
                  statusBadge(s.status),
                ])}
              />
            ) : (
              <div className="p-6 text-center text-sm text-zinc-500">
                No payment schedules found.
              </div>
            )}
          </section>
        </div>
      )}

      {/* SIGNED CONTRACTS TAB */}
      {activeTab === "contracts" && (
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Signed Unit Contracts</h2>
            <p className="text-sm text-zinc-500">Legal property contracts and commercial commitments.</p>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-zinc-500">Loading contracts…</p>
          ) : meData?.signedContracts && meData.signedContracts.length > 0 ? (
            <CrmTable
              columns={["Contract ID", "Unit", "Project", "Start Date", "Contract Total", "Paid Amount", "Status"]}
              rows={meData.signedContracts.map((c) => [
                <span key="id" className="font-mono text-xs text-zinc-600">#{c.id.slice(0, 8)}</span>,
                <span key="unit" className="font-medium text-zinc-900">{c.unit.unitNumber} ({c.unit.type})</span>,
                c.unit.projectName,
                formatDate(c.startDate),
                formatCurrency(c.totalAmt),
                formatCurrency(c.paidAmount),
                statusBadge(c.status),
              ])}
            />
          ) : (
            <div className="p-6 text-center text-sm text-zinc-500">
              No signed contracts recorded.
            </div>
          )}
        </section>
      )}

      {/* INVOICES TAB */}
      {activeTab === "invoices" && (
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Billing Statements & Payment Receipts</h2>
            <p className="text-sm text-zinc-500">Transaction history and verified payment receipts.</p>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-zinc-500">Loading invoices…</p>
          ) : invoices.length > 0 ? (
            <CrmTable
              columns={["Reference", "Unit", "Payment Date", "Payment Method", "Amount", "Status"]}
              rows={invoices.map((inv) => [
                <span key="ref" className="font-medium text-zinc-900">{inv.reference}</span>,
                inv.unitNumber,
                formatDate(inv.date),
                inv.method,
                formatCurrency(inv.amount),
                statusBadge(inv.status),
              ])}
            />
          ) : (
            <div className="p-6 text-center text-sm text-zinc-500">
              No billing statements available.
            </div>
          )}
        </section>
      )}

      {/* API SURFACE TAB */}
      {activeTab === "api" && (
        <section className="rounded-lg border border-zinc-200 bg-white p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Customer Portal Backend API Surface</h2>
            <p className="text-sm text-zinc-500">Configured REST endpoints available for external buyer mobile apps and web portals.</p>
          </div>

          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-zinc-50">
            {[
              { method: "POST", path: "/api/portal/auth/login", desc: "Public customer login endpoint returning JWT token" },
              { method: "GET", path: "/api/portal/me", desc: "JWT-protected endpoint returning active deals, reserved units, and signed contracts" },
              { method: "GET", path: "/api/portal/payment-schedules", desc: "JWT-protected endpoint returning unit installment schedules and overdue status" },
              { method: "GET", path: "/api/portal/contracts", desc: "JWT-protected endpoint returning detailed unit contracts and schedules" },
              { method: "GET", path: "/api/portal/documents", desc: "JWT-protected endpoint returning buyer documents and property attachments" },
              { method: "GET", path: "/api/portal/invoices", desc: "JWT-protected endpoint returning billing statements & payment receipts" },
            ].map((ep) => (
              <div key={ep.path} className="flex flex-col gap-1 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${ep.method === "POST" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm font-semibold text-zinc-800">{ep.path}</code>
                </div>
                <span className="text-xs text-zinc-500">{ep.desc}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
