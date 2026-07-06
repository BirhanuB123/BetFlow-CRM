"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type ApiCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  _count: { deals: number; contracts: number; reservations: number };
};

type NewCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const EMPTY_FORM: NewCustomer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewCustomer>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ApiCustomer[]>("/customers");
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this customer?")) return;
    setError(null);
    try {
      await apiFetch(`/customers/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
    }
  };

  return (
    <DashboardShell
      title="Customers"
      description="Converted relationships and account ownership."
      active="Customers"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Customer accounts</h2>
            <p className="text-sm text-zinc-500">
              Buyer, investor, and tenant records.
            </p>
          </div>
          <Button onClick={() => setShowForm((value) => !value)}>
            {showForm ? <X /> : <Plus />}
            {showForm ? "Cancel" : "New customer"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
          >
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="First name"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Last name"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save customer"}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="border-b border-zinc-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading customers…</p>
        ) : customers.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No customers yet.</p>
        ) : (
          <CrmTable
            columns={["Customer", "Email", "Phone", "Deals", "Contracts", ""]}
            rows={customers.map((customer) => [
              <p key="name" className="font-medium">
                {customer.firstName} {customer.lastName}
              </p>,
              customer.email ?? "—",
              customer.phone ?? "—",
              customer._count.deals,
              customer._count.contracts,
              <button
                key="delete"
                onClick={() => handleDelete(customer.id)}
                className="text-zinc-400 transition-colors hover:text-red-600"
                aria-label="Delete customer"
              >
                <Trash2 className="size-4" />
              </button>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
