"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Building2, ChevronDown, Plus, Search, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = ["CUSTOMER", "INVESTOR", "PARTNER", "DEVELOPER", "SUPPLIER", "OTHER"] as const;
const ACCOUNT_RATINGS = ["HOT", "WARM", "COLD"] as const;

type ApiAccount = {
  id: string;
  name: string;
  accountType: string | null;
  industry: string | null;
  rating: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  owner: { id: string; firstName: string; lastName: string } | null;
  parentAccount: { id: string; name: string } | null;
  _count: { customers: number; deals: number };
};

const ratingClass: Record<string, string> = {
  HOT: "bg-rose-100 text-rose-700",
  WARM: "bg-amber-100 text-amber-700",
  COLD: "bg-sky-100 text-sky-700",
};

const inputClass =
  "h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    accountType: "CUSTOMER",
    rating: "",
    industry: "",
    phone: "",
    email: "",
    website: "",
    employees: "",
    annualRevenue: "",
  });

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiFetch<ApiAccount[]>("/accounts");
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return accounts.filter((a) => {
      if (typeFilter !== "ALL" && a.accountType !== typeFilter) return false;
      if (!term) return true;
      return (
        a.name.toLowerCase().includes(term) ||
        (a.industry ?? "").toLowerCase().includes(term) ||
        (a.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [accounts, query, typeFilter]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiAccount>("/accounts", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          accountType: form.accountType || null,
          rating: form.rating || null,
          industry: form.industry || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          employees: form.employees ? Number(form.employees) : null,
          annualRevenue: form.annualRevenue || null,
        }),
      });
      setForm({
        name: "",
        accountType: "CUSTOMER",
        rating: "",
        industry: "",
        phone: "",
        email: "",
        website: "",
        employees: "",
        annualRevenue: "",
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Accounts"
      description="Companies and organizations you do business with."
      active="Accounts"
    >
      {/* Toolbar */}
      <div className="mb-3 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <select
            aria-label="Filter accounts by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 w-full appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-9 text-sm font-medium text-zinc-800 outline-none focus:border-zinc-400 sm:w-52"
          >
            <option value="ALL">All Accounts</option>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex h-9 w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-zinc-500 sm:w-64">
            <Search className="size-4 shrink-0" />
            <input
              aria-label="Search accounts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search accounts"
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            />
          </label>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
            {showForm ? "Cancel" : "Create Account"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-3 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-3"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Account name *"
            className={cn(inputClass, "sm:col-span-3")}
          />
          <select
            value={form.accountType}
            onChange={(e) => setForm({ ...form, accountType: e.target.value })}
            className={inputClass}
            aria-label="Account type"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className={inputClass}
            aria-label="Rating"
          >
            <option value="">No rating</option>
            {ACCOUNT_RATINGS.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <input
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="Industry"
            className={inputClass}
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            className={inputClass}
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className={inputClass}
          />
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="Website"
            className={inputClass}
          />
          <input
            type="number"
            min="0"
            value={form.employees}
            onChange={(e) => setForm({ ...form, employees: e.target.value })}
            placeholder="Employees"
            className={inputClass}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.annualRevenue}
            onChange={(e) => setForm({ ...form, annualRevenue: e.target.value })}
            placeholder="Annual revenue"
            className={inputClass}
          />
          <div className="sm:col-span-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create account"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {error && (
          <p className="border-b border-zinc-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Account Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Contacts</th>
                <th className="px-4 py-3 font-medium">Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                    {accounts.length === 0 ? "No accounts yet." : "No accounts match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((account) => (
                  <tr key={account.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts/${account.id}`}
                        className="flex items-center gap-2 font-medium text-blue-600 hover:underline"
                      >
                        <Building2 className="size-4 shrink-0 text-zinc-400" />
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {account.accountType
                        ? account.accountType.charAt(0) + account.accountType.slice(1).toLowerCase()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{account.industry ?? "—"}</td>
                    <td className="px-4 py-3">
                      {account.rating ? (
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", ratingClass[account.rating])}>
                          {account.rating}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{account.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {account.owner ? `${account.owner.firstName} ${account.owner.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{account._count.customers}</td>
                    <td className="px-4 py-3 text-zinc-600">{account._count.deals}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-200 px-4 py-2.5 text-xs text-zinc-500">
          {loading ? "Loading…" : `${filtered.length} of ${accounts.length} accounts`}
        </div>
      </div>
    </DashboardShell>
  );
}