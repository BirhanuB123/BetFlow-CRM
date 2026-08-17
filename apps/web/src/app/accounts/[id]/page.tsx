"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Pencil,
  Phone,
  Trash2,
  X,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { NotesPanel } from "@/components/notes/notes-panel";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { AccountDetail, AccountOwner as Owner } from "@betflow/shared";

const ACCOUNT_TYPES = [
  "CUSTOMER",
  "INVESTOR",
  "PARTNER",
  "DEVELOPER",
  "SUPPLIER",
  "OTHER",
] as const;
const ACCOUNT_RATINGS = ["HOT", "WARM", "COLD"] as const;

function money(value?: string | null) {
  if (value == null) return "—";
  return formatCurrency(value);
}

const ratingClass: Record<string, string> = {
  HOT: "bg-rose-100 text-rose-700",
  WARM: "bg-amber-100 text-amber-700",
  COLD: "bg-sky-100 text-sky-700",
};
const badge = "rounded-md px-2 py-0.5 text-xs font-medium";
const inputClass =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400";

function titleCase(v: string | null) {
  if (!v) return "—";
  return v.charAt(0) + v.slice(1).toLowerCase();
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-800">{children}</p>
    </div>
  );
}

function address(parts: (string | null | undefined)[]) {
  const joined = parts.filter(Boolean).join(", ");
  return joined || "—";
}

type FormState = Record<string, string>;

function toForm(a: AccountDetail): FormState {
  return {
    name: a.name ?? "",
    accountType: a.accountType ?? "",
    rating: a.rating ?? "",
    industry: a.industry ?? "",
    phone: a.phone ?? "",
    email: a.email ?? "",
    website: a.website ?? "",
    employees: a.employees != null ? String(a.employees) : "",
    annualRevenue: a.annualRevenue ?? "",
    description: a.description ?? "",
    billingStreet: a.billingStreet ?? "",
    billingCity: a.billingCity ?? "",
    billingState: a.billingState ?? "",
    billingCountry: a.billingCountry ?? "",
    billingZip: a.billingZip ?? "",
    shippingStreet: a.shippingStreet ?? "",
    shippingCity: a.shippingCity ?? "",
    shippingState: a.shippingState ?? "",
    shippingCountry: a.shippingCountry ?? "",
    shippingZip: a.shippingZip ?? "",
  };
}

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({});
  const [timelineKey, setTimelineKey] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiFetch<AccountDetail>(`/accounts/${id}`);
      setAccount(data);
      setForm(toForm(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/accounts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          employees: form.employees ? Number(form.employees) : null,
          annualRevenue: form.annualRevenue || null,
          accountType: form.accountType || null,
          rating: form.rating || null,
        }),
      });
      setEditing(false);
      await load();
      setTimelineKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (
      !window.confirm(
        "Delete this account? Contacts and child accounts will be unlinked.",
      )
    )
      return;
    try {
      await apiFetch(`/accounts/${id}`, { method: "DELETE" });
      router.push("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  return (
    <DashboardShell
      title={account ? account.name : "Account"}
      description="Company profile, contacts, and deal relationships."
      active="Accounts"
    >
      <Link
        href="/accounts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" />
        Back to accounts
      </Link>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading account…</p>
      ) : !account ? (
        <p className="p-6 text-sm text-zinc-500">Account not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                    <Building2 className="size-6" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{account.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      {account.accountType && (
                        <span
                          className={cn(badge, "bg-zinc-100 text-zinc-700")}
                        >
                          {titleCase(account.accountType)}
                        </span>
                      )}
                      {account.rating && (
                        <span
                          className={cn(badge, ratingClass[account.rating])}
                        >
                          {account.rating}
                        </span>
                      )}
                      {account.parentAccount && (
                        <span>
                          ↳ under{" "}
                          <Link
                            href={`/accounts/${account.parentAccount.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {account.parentAccount.name}
                          </Link>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={remove}>
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
              {!editing && (
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
                  {account.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-4 text-zinc-400" />
                      {account.phone}
                    </span>
                  )}
                  {account.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-4 text-zinc-400" />
                      {account.email}
                    </span>
                  )}
                  {account.website && (
                    <a
                      href={
                        account.website.startsWith("http")
                          ? account.website
                          : `https://${account.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Globe className="size-4" />
                      {account.website}
                    </a>
                  )}
                </div>
              )}
            </section>

            {editing ? (
              /* Edit form */
              <form
                onSubmit={save}
                className="rounded-lg border border-zinc-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Edit account</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setForm(toForm(account));
                    }}
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Cancel edit"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium text-zinc-500 sm:col-span-2">
                    Name
                    <input
                      required
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Type
                    <select
                      className={inputClass}
                      value={form.accountType}
                      onChange={(e) => set("accountType", e.target.value)}
                    >
                      <option value="">—</option>
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {titleCase(t)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Rating
                    <select
                      className={inputClass}
                      value={form.rating}
                      onChange={(e) => set("rating", e.target.value)}
                    >
                      <option value="">—</option>
                      {ACCOUNT_RATINGS.map((r) => (
                        <option key={r} value={r}>
                          {titleCase(r)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Industry
                    <input
                      className={inputClass}
                      value={form.industry}
                      onChange={(e) => set("industry", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Website
                    <input
                      className={inputClass}
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Phone
                    <input
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Email
                    <input
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Employees
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={form.employees}
                      onChange={(e) => set("employees", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500">
                    Annual revenue
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={form.annualRevenue}
                      onChange={(e) => set("annualRevenue", e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-zinc-500 sm:col-span-2">
                    Description
                    <textarea
                      rows={2}
                      className="w-full resize-y rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </label>
                </div>

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Billing address
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className={cn(inputClass, "sm:col-span-3")}
                    placeholder="Street"
                    value={form.billingStreet}
                    onChange={(e) => set("billingStreet", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="City"
                    value={form.billingCity}
                    onChange={(e) => set("billingCity", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="State"
                    value={form.billingState}
                    onChange={(e) => set("billingState", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Zip"
                    value={form.billingZip}
                    onChange={(e) => set("billingZip", e.target.value)}
                  />
                  <input
                    className={cn(inputClass, "sm:col-span-3")}
                    placeholder="Country"
                    value={form.billingCountry}
                    onChange={(e) => set("billingCountry", e.target.value)}
                  />
                </div>

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Shipping address
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className={cn(inputClass, "sm:col-span-3")}
                    placeholder="Street"
                    value={form.shippingStreet}
                    onChange={(e) => set("shippingStreet", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="City"
                    value={form.shippingCity}
                    onChange={(e) => set("shippingCity", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="State"
                    value={form.shippingState}
                    onChange={(e) => set("shippingState", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Zip"
                    value={form.shippingZip}
                    onChange={(e) => set("shippingZip", e.target.value)}
                  />
                  <input
                    className={cn(inputClass, "sm:col-span-3")}
                    placeholder="Country"
                    value={form.shippingCountry}
                    onChange={(e) => set("shippingCountry", e.target.value)}
                  />
                </div>

                <div className="mt-5 flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Details */}
                <section className="rounded-lg border border-zinc-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-semibold">
                    Account details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Industry">{account.industry ?? "—"}</Field>
                    <Field label="Owner">
                      {account.owner
                        ? `${account.owner.firstName} ${account.owner.lastName}`
                        : "—"}
                    </Field>
                    <Field label="Employees">{account.employees ?? "—"}</Field>
                    <Field label="Annual revenue">
                      {money(account.annualRevenue)}
                    </Field>
                    <Field label="Contacts">{account._count.customers}</Field>
                    <Field label="Deals">{account._count.deals}</Field>
                    {account.description && (
                      <div className="sm:col-span-3">
                        <Field label="Description">{account.description}</Field>
                      </div>
                    )}
                  </div>
                </section>

                {/* Addresses */}
                <section className="rounded-lg border border-zinc-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-semibold">Addresses</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Billing">
                      {address([
                        account.billingStreet,
                        account.billingCity,
                        account.billingState,
                        account.billingZip,
                        account.billingCountry,
                      ])}
                    </Field>
                    <Field label="Shipping">
                      {address([
                        account.shippingStreet,
                        account.shippingCity,
                        account.shippingState,
                        account.shippingZip,
                        account.shippingCountry,
                      ])}
                    </Field>
                  </div>
                </section>
              </>
            )}

            {/* Contacts */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <h3 className="text-base font-semibold">
                  Contacts ({account.customers.length})
                </h3>
              </div>
              {account.customers.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">
                  No contacts linked to this account.
                </p>
              ) : (
                <CrmTable
                  columns={["Name", "Title", "Email", "Phone", "Deals"]}
                  rows={account.customers.map((c) => [
                    <Link
                      key="n"
                      href={`/customers/${c.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {c.firstName} {c.lastName}
                    </Link>,
                    c.title ?? "—",
                    c.email ?? "—",
                    c.phone ?? "—",
                    c._count.deals,
                  ])}
                />
              )}
            </section>

            {/* Deals */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <h3 className="text-base font-semibold">
                  Deals ({account.deals.length})
                </h3>
              </div>
              {account.deals.length === 0 ? (
                <p className="p-6 text-sm text-zinc-500">
                  No deals for this account.
                </p>
              ) : (
                <CrmTable
                  columns={["Deal", "Value", "Stage", "Contact", "Unit"]}
                  rows={account.deals.map((d) => [
                    <span key="n" className="font-medium">
                      {d.name}
                    </span>,
                    money(d.value),
                    d.stage.name,
                    d.customer
                      ? `${d.customer.firstName} ${d.customer.lastName}`
                      : "—",
                    d.unit ? `Unit ${d.unit.unitNumber}` : "—",
                  ])}
                />
              )}
            </section>

            {/* Child accounts */}
            {account.childAccounts.length > 0 && (
              <section className="rounded-lg border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 p-4">
                  <h3 className="text-base font-semibold">
                    Sub-accounts ({account.childAccounts.length})
                  </h3>
                </div>
                <CrmTable
                  columns={["Account", "Type", "Rating"]}
                  rows={account.childAccounts.map((c) => [
                    <Link
                      key="n"
                      href={`/accounts/${c.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {c.name}
                    </Link>,
                    titleCase(c.accountType),
                    c.rating ? (
                      <span
                        key="r"
                        className={cn(badge, ratingClass[c.rating])}
                      >
                        {c.rating}
                      </span>
                    ) : (
                      "—"
                    ),
                  ])}
                />
              </section>
            )}
          </div>

          {/* Notes + timeline */}
          <div className="space-y-6 lg:col-span-1">
            <NotesPanel
              entityType="Account"
              entityId={account.id}
              onChange={() => setTimelineKey((k) => k + 1)}
            />
            <ActivityTimeline
              key={timelineKey}
              entityType="Account"
              entityId={account.id}
              title="Account activity"
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
