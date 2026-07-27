"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, Trash2 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { NotesPanel } from "@/components/notes/notes-panel";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

const badge = "rounded-md px-2 py-1 text-xs font-medium";
const statusTone: Record<string, string> = {
  SIGNED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  PENDING_SIGNATURE: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-zinc-200 text-zinc-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(badge, statusTone[status] ?? "bg-zinc-100 text-zinc-700")}>
      {status}
    </span>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Bumped when a note is added/removed to force the timeline to refetch.
  const [timelineKey, setTimelineKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<CustomerDetail>(`/customers/${id}`);
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer");
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
    if (!window.confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/customers/${id}`, { method: "DELETE" });
      router.push("/customers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
      setDeleting(false);
    }
  };

  const totals = useMemo(() => {
    if (!customer) return { pipeline: 0, paid: 0 };
    const pipeline = customer.deals.reduce((s, d) => s + Number(d.value || 0), 0);
    const paid = customer.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    return { pipeline, paid };
  }, [customer]);

  return (
    <DashboardShell
      title={customer ? `${customer.firstName} ${customer.lastName}` : "Customer"}
      description="Full relationship history across deals, contracts, and payments."
      active="Contacts"
    >
      <Link
        href="/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading customer…</p>
      ) : !customer ? (
        <p className="p-6 text-sm text-zinc-500">Customer not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Header card */}
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {customer.firstName} {customer.lastName}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
                    {customer.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-4 text-zinc-400" />
                        {customer.email}
                      </span>
                    )}
                    {customer.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-4 text-zinc-400" />
                        {customer.phone}
                      </span>
                    )}
                    {customer.account && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-4 text-zinc-400" />
                        <Link href={`/accounts/${customer.account.id}`} className="text-[#334cff] hover:underline">
                          {customer.account.name}
                        </Link>
                      </span>
                    )}
                    <span className="text-zinc-400">
                      Customer since {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium"
                >
                  <Trash2 className="size-4 mr-1.5" />
                  {deleting ? "Deleting..." : "Delete Contact"}
                </Button>
              </div>
            </section>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Pipeline" value={money(totals.pipeline)} detail={`${customer.deals.length} deals`} />
              <StatCard label="Collected" value={money(totals.paid)} detail={`${customer.payments.length} payments`} />
              <StatCard label="Contracts" value={String(customer.contracts.length)} detail="Sale agreements" />
              <StatCard label="Reservations" value={String(customer.reservations.length)} detail="Unit holds" />
            </div>

            {/* Deals */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <h3 className="text-base font-semibold">Deals</h3>
              </div>
              {customer.deals.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">No deals.</p>
              ) : (
                <CrmTable
                  columns={["Deal", "Unit", "Value", "Stage", "Probability"]}
                  rows={customer.deals.map((deal) => [
                    <span key="n" className="font-medium">{deal.name}</span>,
                    deal.unit ? `Unit ${deal.unit.unitNumber}` : "—",
                    money(deal.value),
                    deal.stage.name,
                    `${deal.stage.probability}%`,
                  ])}
                />
              )}
            </section>

            {/* Contracts */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <h3 className="text-base font-semibold">Contracts</h3>
              </div>
              {customer.contracts.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">No contracts.</p>
              ) : (
                <CrmTable
                  columns={["Unit", "Total", "Start", "Status"]}
                  rows={customer.contracts.map((contract) => [
                    contract.unit ? `Unit ${contract.unit.unitNumber}` : "—",
                    money(contract.totalAmt),
                    new Date(contract.startDate).toLocaleDateString(),
                    <StatusBadge key="s" status={contract.status} />,
                  ])}
                />
              )}
            </section>

            {/* Reservations */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <h3 className="text-base font-semibold">Reservations</h3>
              </div>
              {customer.reservations.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">No reservations.</p>
              ) : (
                <CrmTable
                  columns={["Unit", "Deposit", "Date", "Status"]}
                  rows={customer.reservations.map((reservation) => [
                    reservation.unit ? `Unit ${reservation.unit.unitNumber}` : "—",
                    money(reservation.amount),
                    new Date(reservation.date).toLocaleDateString(),
                    <StatusBadge key="s" status={reservation.status} />,
                  ])}
                />
              )}
            </section>

            {/* Payments */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <h3 className="text-base font-semibold">Payments</h3>
              </div>
              {customer.payments.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">No payments.</p>
              ) : (
                <CrmTable
                  columns={["Amount", "Method", "Against", "Date", "Status"]}
                  rows={customer.payments.map((payment) => [
                    <span key="a" className="font-medium">{money(payment.amount)}</span>,
                    payment.method,
                    payment.contractId ? "Contract" : payment.reservationId ? "Reservation" : "—",
                    new Date(payment.date).toLocaleDateString(),
                    <StatusBadge key="s" status={payment.status} />,
                  ])}
                />
              )}
            </section>
          </div>

          {/* Notes + timeline */}
          <div className="space-y-6 lg:col-span-1">
            <DocumentsPanel entityType="CUSTOMER" entityId={customer.id} title="Customer documents" />
            <NotesPanel
              entityType="Customer"
              entityId={customer.id}
              onChange={() => setTimelineKey((k) => k + 1)}
            />
            <ActivityTimeline
              key={timelineKey}
              entityType="Customer"
              entityId={customer.id}
              title="Customer activity"
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
