"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarPlus, Trash2, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type PersonRef = { id: string; firstName: string; lastName: string } | null;

type ApiSiteVisit = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  lead: PersonRef;
  customer: PersonRef;
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type LeadOption = { id: string; firstName: string; lastName: string };

const statusClass: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  NO_SHOW: "bg-amber-50 text-amber-700",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// datetime-local (no zone) -> ISO for the API.
function toIso(local: string) {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

export default function SiteVisitsPage() {
  const [visits, setVisits] = useState<ApiSiteVisit[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    withType: "customer" as "customer" | "lead",
    withId: "",
    date: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [visitsData, customersData, leadsData] = await Promise.all([
        apiFetch<ApiSiteVisit[]>("/site-visits"),
        apiFetch<CustomerOption[]>("/customers"),
        apiFetch<LeadOption[]>("/leads"),
      ]);
      setVisits(visitsData);
      setCustomers(customersData);
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load site visits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiSiteVisit>("/site-visits", {
        method: "POST",
        body: JSON.stringify({
          date: toIso(form.date),
          notes: form.notes || undefined,
          ...(form.withType === "customer"
            ? { customerId: form.withId }
            : { leadId: form.withId }),
        }),
      });
      setForm({ withType: "customer", withId: "", date: "", notes: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule visit");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/site-visits/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visit");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this site visit?")) return;
    setError(null);
    try {
      await apiFetch(`/site-visits/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete visit");
    }
  };

  const withOptions = form.withType === "customer" ? customers : leads;

  return (
    <DashboardShell
      title="Site visits"
      description="Schedule, confirm, and track property visit outcomes."
      active="Site visits"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Visit schedule</h2>
            <p className="text-sm text-zinc-500">
              Appointments with leads and customers, and their outcomes.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((v) => !v)}
            disabled={!showForm && customers.length === 0 && leads.length === 0}
          >
            {showForm ? <X className="size-4" /> : <CalendarPlus className="size-4" />}
            {showForm ? "Cancel" : "Schedule visit"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
          >
            <select
              value={form.withType}
              onChange={(e) =>
                setForm({ ...form, withType: e.target.value as "customer" | "lead", withId: "" })
              }
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              aria-label="Visit with"
            >
              <option value="customer">With a customer</option>
              <option value="lead">With a lead</option>
            </select>
            <select
              required
              value={form.withId}
              onChange={(e) => setForm({ ...form, withId: e.target.value })}
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              aria-label="Select person"
            >
              <option value="">Select {form.withType}…</option>
              {withOptions.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.firstName} {person.lastName}
                </option>
              ))}
            </select>
            <label className="grid gap-1 text-xs font-medium text-zinc-500">
              Date & time
              <input
                required
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              />
            </label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="h-9 self-end rounded-md border border-zinc-200 bg-white px-3 text-sm"
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Scheduling…" : "Schedule visit"}
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
          <p className="p-6 text-sm text-zinc-500">Loading site visits…</p>
        ) : visits.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No site visits scheduled.</p>
        ) : (
          <CrmTable
            columns={["With", "Scheduled", "Status", "Notes", "Actions"]}
            rows={visits.map((visit) => {
              const person = visit.customer ?? visit.lead;
              const isCustomer = Boolean(visit.customer);
              return [
                person ? (
                  isCustomer ? (
                    <Link
                      key="w"
                      href={`/customers/${person.id}`}
                      className="font-medium text-[#334cff] hover:underline"
                    >
                      {person.firstName} {person.lastName}
                    </Link>
                  ) : (
                    <span key="w" className="font-medium">
                      {person.firstName} {person.lastName}{" "}
                      <span className="text-xs font-normal text-zinc-400">(lead)</span>
                    </span>
                  )
                ) : (
                  "—"
                ),
                fmtDateTime(visit.date),
                <span
                  key="s"
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    statusClass[visit.status] ?? "bg-zinc-100 text-zinc-700",
                  )}
                >
                  {visit.status.replace(/_/g, " ")}
                </span>,
                <span key="n" className="text-zinc-500">
                  {visit.notes ?? "—"}
                </span>,
                <div key="a" className="flex items-center gap-2">
                  {visit.status === "SCHEDULED" && (
                    <>
                      <Button
                        size="xs"
                        onClick={() => changeStatus(visit.id, "COMPLETED")}
                      >
                        Complete
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => changeStatus(visit.id, "NO_SHOW")}
                      >
                        No-show
                      </Button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(visit.id)}
                    className="text-zinc-400 transition-colors hover:text-red-600"
                    aria-label="Delete site visit"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>,
              ];
            })}
          />
        )}
      </section>
    </DashboardShell>
  );
}
