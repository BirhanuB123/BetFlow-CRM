"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number | null;
  billingCycle: "monthly" | "annual";
  status: "current" | "available";
  includes: string[];
};

type FeatureLimit = {
  id: string;
  feature: string;
  used: number;
  limit: number;
  unit: string;
};

type BillingItem = {
  id: string;
  invoice: string;
  period: string;
  amount: number;
  status: "paid" | "due" | "failed";
  dueDate: string;
};

type TrialPeriod = {
  status: "Active" | "Expired" | "Converted";
  startedAt: string;
  endsAt: string;
  daysRemaining: number;
  conversionOwner: string;
};

type BillingAccount = {
  accountName: string;
  billingEmail: string;
  taxId: string;
  paymentMethod: string;
  collectionMode: "Auto-charge" | "Invoice";
  nextCharge: string;
};

type SubscriptionData = {
  plans: SubscriptionPlan[];
  limits: FeatureLimit[];
  billingItems: BillingItem[];
  trialPeriod: TrialPeriod;
  billingAccount: BillingAccount;
};

const statusClass = {
  current: "bg-emerald-50 text-emerald-700 border-emerald-200",
  available: "bg-zinc-100 text-zinc-600 border-zinc-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  due: "bg-amber-50 text-amber-800 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<SubscriptionData>("/saas/subscription");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubscription();
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Subscription plans" description="Plan selection and feature usage for this tenant." active="Plans">
        <p className="p-6 text-sm text-zinc-500">Loading subscription details…</p>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell title="Subscription plans" description="Plan selection and feature usage for this tenant." active="Plans">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Failed to load subscription details"}
        </div>
      </DashboardShell>
    );
  }

  const { plans, limits, billingItems, trialPeriod, billingAccount } = data;
  const currentPlan = plans.find((p) => p.status === "current");
  const userLimit = limits.find((l) => l.feature === "Users");

  const saasMetrics = [
    { label: "Current plan", value: currentPlan?.name || "None", detail: currentPlan?.price ? `$${currentPlan.price} monthly` : "Custom" },
    { label: "Seat usage", value: userLimit ? `${userLimit.used}/${userLimit.limit}` : "N/A", detail: userLimit ? `${userLimit.limit - userLimit.used} seats remaining` : "" },
    { label: "Trial", value: `${trialPeriod.daysRemaining} days`, detail: `Ends ${new Date(trialPeriod.endsAt).toLocaleDateString()}` },
    { label: "Billing Method", value: billingAccount.paymentMethod, detail: billingAccount.collectionMode },
  ];

  return (
    <DashboardShell
      title="Subscription & Billing"
      description="Subscription plans, seat usage limits, and invoice statements."
      active="Subscription"
    >
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#233b66] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Settings
      </Link>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {saasMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-semibold">Trial period</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Started {new Date(trialPeriod.startedAt).toLocaleDateString()}, ends {new Date(trialPeriod.endsAt).toLocaleDateString()}, owned by {trialPeriod.conversionOwner}.
            </p>
          </div>
          <span className={`w-fit rounded-md px-2 py-1 text-xs font-medium uppercase border ${statusClass[trialPeriod.status]}`}>
            {trialPeriod.daysRemaining} days remaining
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Plans</h2>
          <p className="text-sm text-zinc-500">Subscription tiers and included capabilities.</p>
        </div>
        <CrmTable
          columns={["Plan", "Price", "Cycle", "Includes", "Status"]}
          rows={plans.map((plan) => [
            <span key="plan" className="font-medium">{plan.name}</span>,
            plan.price ? `$${plan.price}` : "Custom",
            plan.billingCycle,
            plan.includes.join(", "),
            <span key="status" className={`rounded-md border px-2 py-1 text-xs font-medium uppercase ${statusClass[plan.status]}`}>
              {plan.status}
            </span>,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Feature limits</h2>
          <p className="text-sm text-zinc-500">Usage compared with plan limits.</p>
        </div>
        <CrmTable
          columns={["Feature", "Used", "Limit", "Unit", "Usage"]}
          rows={limits.map((limit) => [
            <span key="feature" className="font-medium">{limit.feature}</span>,
            limit.used.toLocaleString(),
            limit.limit.toLocaleString(),
            limit.unit,
            `${Math.round((limit.used / limit.limit) * 100)}%`,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Invoices & Billing History</h2>
          <p className="text-sm text-zinc-500">View and track past payments and outstanding invoices.</p>
        </div>
        <CrmTable
          columns={["Invoice ID", "Billing Period", "Amount", "Due Date", "Status"]}
          rows={billingItems.map((invoice) => [
            <span key="invoice" className="font-medium">{invoice.invoice}</span>,
            invoice.period,
            `$${invoice.amount}`,
            new Date(invoice.dueDate).toLocaleDateString(),
            <span key="status" className={`rounded-md border px-2 py-1 text-xs font-medium uppercase ${statusClass[invoice.status]}`}>
              {invoice.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
