"use client";

import { UserPlus } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CrmTable } from "@/components/tables/crm-table";
import { apiFetch } from "@/lib/api";

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "FOLLOW_UP",
  "WON",
  "LOST",
] as const;

type LeadStatus = (typeof LEAD_STATUSES)[number];

type ApiLead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  source: { id: string; name: string } | null;
};

const statusClass: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-indigo-50 text-indigo-700",
  QUALIFIED: "bg-emerald-50 text-emerald-700",
  FOLLOW_UP: "bg-amber-50 text-amber-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-rose-50 text-rose-700",
};

const emptyForm = { firstName: "", lastName: "", email: "", phone: "" };

export default function LeadsPage() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<ApiLead[]>("/leads");
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadLeads();
    });
  }, [loadLeads]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await apiFetch<ApiLead>("/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setError(null);
    try {
      await apiFetch<ApiLead>(`/leads/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  return (
    <DashboardShell
      title="Leads"
      description="Capture, qualify, and assign incoming demand."
      active="Leads"
    >
      {error ? (
        <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-base font-semibold">New lead</h2>
        <p className="text-sm text-zinc-500">Captured leads persist to your workspace.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-5" onSubmit={handleCreate}>
          <input
            className="h-10 rounded-md border border-zinc-200 px-3 text-sm md:col-span-1"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
          <input
            className="h-10 rounded-md border border-zinc-200 px-3 text-sm md:col-span-1"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            required
          />
          <input
            className="h-10 rounded-md border border-zinc-200 px-3 text-sm md:col-span-1"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="h-10 rounded-md border border-zinc-200 px-3 text-sm md:col-span-1"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Button className="h-10" disabled={creating}>
            <UserPlus className="size-4" />
            {creating ? "Adding..." : "Add lead"}
          </Button>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Lead queue</h2>
            <p className="text-sm text-zinc-500">Assignment and qualification status.</p>
          </div>
          <span className="text-sm text-zinc-500">{leads.length} leads</span>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-zinc-500">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">No leads yet. Add your first one above.</p>
        ) : (
          <CrmTable
            columns={["Lead", "Email", "Phone", "Source", "Status", "Captured"]}
            rows={leads.map((lead) => [
              <div key="lead">
                <p className="font-medium">
                  {lead.firstName} {lead.lastName}
                </p>
              </div>,
              lead.email ?? "—",
              lead.phone ?? "—",
              lead.source?.name ?? "—",
              <select
                key="status"
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  statusClass[lead.status] ?? "bg-zinc-100 text-zinc-700"
                }`}
                value={lead.status}
                onChange={(e) =>
                  handleStatusChange(lead.id, e.target.value as LeadStatus)
                }
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>,
              new Date(lead.createdAt).toLocaleDateString(),
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
