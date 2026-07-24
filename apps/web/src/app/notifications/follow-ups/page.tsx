"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Phone,
  MessageSquare,
  Send,
  CalendarClock,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Check,
  Building,
  Sparkles,
  PhoneForwarded,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type PersonRef = { id: string; firstName: string; lastName: string; phone?: string | null } | null;

type ApiCallLog = {
  id: string;
  subject: string;
  callType: string;
  callPurpose: string;
  callResult: string | null;
  dueDate: string;
  completedAt: string | null;
  durationSeconds: number | null;
  notes: string | null;
  status: string;
  lead: PersonRef;
  customer: PersonRef;
};

type CustomerOption = { id: string; firstName: string; lastName: string; phone?: string | null };
type LeadOption = { id: string; firstName: string; lastName: string; phone?: string | null };

const statusClass: Record<string, string> = {
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
  SKIPPED: "bg-slate-100 text-slate-700 border-slate-200",
};

const channelIcons: Record<string, typeof Phone> = {
  OUTBOUND: PhoneForwarded,
  INBOUND: PhoneCall,
  TELEGRAM: Send,
  WHATSAPP: MessageSquare,
};

const channelLabels: Record<string, string> = {
  OUTBOUND: "Outbound Call",
  INBOUND: "Inbound Call",
  TELEGRAM: "Telegram Call/Msg",
  WHATSAPP: "WhatsApp Call",
};

const purposeLabels: Record<string, string> = {
  POST_VISIT_FOLLOWUP: "Post-Site-Visit Follow-Up",
  PAYMENT_REMINDER: "Installment Payment Reminder",
  DIASPORA_OUTREACH: "Diaspora Buyer Outreach",
  PROPOSAL_REVIEW: "Proposal / Pro-forma Review",
  GENERAL_INQUIRY: "General Buyer Inquiry",
};

const CALL_RESULTS = [
  { value: "INTERESTED", label: "Interested / Negotiating (ስምምነት ላይ የደረሰ)" },
  { value: "REQUESTED_PROFORMA", label: "Requested Pro-forma Invoice (ፕሮፎርማ የጠየቀ)" },
  { value: "SCHEDULED_SITE_VISIT", label: "Scheduled Site Visit (ቦታ ለመጎብኘት የቀጠረ)" },
  { value: "BUSY_CALL_BACK", label: "Busy - Call Back Later (ስራ ላይ - በሌላ ጊዜ)" },
  { value: "NO_ANSWER", label: "No Answer / Unreachable (ስልክ አልነሳም)" },
  { value: "NOT_INTERESTED", label: "Not Interested (ፍላጎት የለውም)" },
];

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toIso(local: string) {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

export default function FollowUpsPage() {
  const [calls, setCalls] = useState<ApiCallLog[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "DUE_TODAY" | "OVERDUE" | "COMPLETED">("ALL");

  // Outcome logging modal state
  const [loggingCall, setLoggingCall] = useState<ApiCallLog | null>(null);
  const [outcomeForm, setOutcomeForm] = useState({
    callResult: "INTERESTED",
    notes: "",
  });

  // Schedule call form state
  const [form, setForm] = useState({
    subject: "",
    withType: "customer" as "customer" | "lead",
    withId: "",
    callType: "OUTBOUND",
    callPurpose: "POST_VISIT_FOLLOWUP",
    dueDate: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [callsData, customersData, leadsData] = await Promise.all([
        apiFetch<ApiCallLog[]>("/calls").catch(() => []),
        apiFetch<CustomerOption[]>("/customers").catch(() => []),
        apiFetch<LeadOption[]>("/leads").catch(() => []),
      ]);
      setCalls(callsData);
      setCustomers(customersData);
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load follow-up reminders");
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
      await apiFetch<ApiCallLog>("/calls", {
        method: "POST",
        body: JSON.stringify({
          subject: form.subject,
          callType: form.callType,
          callPurpose: form.callPurpose,
          dueDate: toIso(form.dueDate),
          notes: form.notes || undefined,
          ...(form.withType === "customer"
            ? { customerId: form.withId }
            : { leadId: form.withId }),
        }),
      });

      setForm({
        subject: "",
        withType: "customer",
        withId: "",
        callType: "OUTBOUND",
        callPurpose: "POST_VISIT_FOLLOWUP",
        dueDate: "",
        notes: "",
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule follow-up");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOutcome = async (event: FormEvent) => {
    event.preventDefault();
    if (!loggingCall) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/calls/${loggingCall.id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({
          callResult: outcomeForm.callResult,
          notes: outcomeForm.notes || undefined,
        }),
      });
      setLoggingCall(null);
      setOutcomeForm({ callResult: "INTERESTED", notes: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log call outcome");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this follow-up reminder?")) return;
    setError(null);
    try {
      await apiFetch(`/calls/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete reminder");
    }
  };

  const withOptions = form.withType === "customer" ? customers : leads;

  // Derived filter calculations
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const overdueCalls = calls.filter((c) => c.status === "PENDING" && new Date(c.dueDate) < startOfDay);
  const dueTodayCalls = calls.filter((c) => c.status === "PENDING" && new Date(c.dueDate) >= startOfDay && new Date(c.dueDate) <= endOfDay);
  const diasporaCalls = calls.filter((c) => c.callPurpose === "DIASPORA_OUTREACH" && c.status !== "COMPLETED");
  const pendingCalls = calls.filter((c) => c.status !== "COMPLETED");

  const filteredCalls = calls.filter((c) => {
    if (activeFilter === "DUE_TODAY") {
      return c.status === "PENDING" && new Date(c.dueDate) >= startOfDay && new Date(c.dueDate) <= endOfDay;
    }
    if (activeFilter === "OVERDUE") {
      return c.status === "PENDING" && new Date(c.dueDate) < startOfDay;
    }
    if (activeFilter === "COMPLETED") {
      return c.status === "COMPLETED";
    }
    return true;
  });

  return (
    <DashboardShell
      title="Follow-up Reminders & Calls Queue"
      description="Track phone call follow-ups, post-site-visit check-ins, diaspora buyer outreach, and installment payment reminders."
      active="Notifications"
    >
      <div className="space-y-6">
        {/* Top KPI Queue Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setActiveFilter("OVERDUE")}
            className={cn(
              "rounded-xl border p-4 text-left shadow-sm transition-all cursor-pointer",
              activeFilter === "OVERDUE" ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-400/20" : "border-slate-200/80 bg-white hover:border-rose-200"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-rose-600">Overdue Reminders</p>
              <AlertCircle className="size-4 text-rose-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-rose-700">{overdueCalls.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Requires immediate call</p>
          </button>

          <button
            onClick={() => setActiveFilter("DUE_TODAY")}
            className={cn(
              "rounded-xl border p-4 text-left shadow-sm transition-all cursor-pointer",
              activeFilter === "DUE_TODAY" ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-400/20" : "border-slate-200/80 bg-white hover:border-blue-200"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-600">Due Today</p>
              <Clock className="size-4 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-blue-700">{dueTodayCalls.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Today's call schedule</p>
          </button>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-600">Diaspora Buyer Calls</p>
              <PhoneCall className="size-4 text-indigo-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{diasporaCalls.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Foreign currency leads</p>
          </div>

          <button
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "rounded-xl border p-4 text-left shadow-sm transition-all cursor-pointer",
              activeFilter === "ALL" ? "border-slate-400 bg-slate-100/60 ring-2 ring-slate-400/20" : "border-slate-200/80 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Total Pending Queue</p>
              <CalendarClock className="size-4 text-slate-400" />
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{pendingCalls.length}</p>
            <p className="mt-1 text-[11px] text-slate-500">Active follow-ups</p>
          </button>
        </div>

        {/* Section Header & Schedule Action */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <PhoneCall className="size-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Real Estate Follow-up Queue</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Log call outcomes, schedule post-site-visit follow-ups, and track Ethiopian property buyers.
              </p>
            </div>
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={!showForm && customers.length === 0 && leads.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {showForm ? <X className="size-4 mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
              {showForm ? "Cancel Intake" : "Schedule Follow-up Call"}
            </Button>
          </div>

          {/* Schedule Follow-up Call Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                New Follow-Up Call Appointment
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Call Purpose *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Post Site-Visit Check-in (Unit 702) & Send Pro-Forma Invoice"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Call Channel</label>
                  <select
                    value={form.callType}
                    onChange={(e) => setForm({ ...form, callType: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="OUTBOUND">Outbound Phone Call</option>
                    <option value="INBOUND">Inbound Phone Call</option>
                    <option value="TELEGRAM">Telegram Call / Message</option>
                    <option value="WHATSAPP">WhatsApp Call / Message</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose Category</label>
                  <select
                    value={form.callPurpose}
                    onChange={(e) => setForm({ ...form, callPurpose: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="POST_VISIT_FOLLOWUP">Post-Site-Visit Follow-Up</option>
                    <option value="PAYMENT_REMINDER">Installment Payment Reminder</option>
                    <option value="DIASPORA_OUTREACH">Diaspora Buyer Outreach</option>
                    <option value="PROPOSAL_REVIEW">Proposal / Pro-forma Review</option>
                    <option value="GENERAL_INQUIRY">General Buyer Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Call With</label>
                  <select
                    value={form.withType}
                    onChange={(e) =>
                      setForm({ ...form, withType: e.target.value as "customer" | "lead", withId: "" })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="customer">Customer (Contact)</option>
                    <option value="lead">Lead (Prospect)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client *</label>
                  <select
                    required
                    value={form.withId}
                    onChange={(e) => setForm({ ...form, withId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select {form.withType}…</option>
                    {withOptions.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName} {person.phone ? `(${person.phone})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Call Preparation & Objective Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Review 3-bedroom unit 120 sqm layout options before calling..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-indigo-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm">
                  {saving ? "Scheduling…" : "Add Follow-up Reminder"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
        </section>

        {/* Reminders Queue Data Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Table Filter Tabs */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  activeFilter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                All Reminders ({calls.length})
              </button>
              <button
                onClick={() => setActiveFilter("DUE_TODAY")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  activeFilter === "DUE_TODAY" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Due Today ({dueTodayCalls.length})
              </button>
              <button
                onClick={() => setActiveFilter("OVERDUE")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  activeFilter === "OVERDUE" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Overdue ({overdueCalls.length})
              </button>
              <button
                onClick={() => setActiveFilter("COMPLETED")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  activeFilter === "COMPLETED" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Completed Log
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-slate-500">Loading follow-up queue…</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <CalendarClock className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No follow-up calls in this queue</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                You're all caught up! Click "Schedule Follow-up Call" to queue a new reminder for your leads or customers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Subject / Objective</th>
                    <th className="px-5 py-3">Client & Phone</th>
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Purpose</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Status / Result</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalls.map((call) => {
                    const person = call.customer ?? call.lead;
                    const isCustomer = Boolean(call.customer);
                    const ChannelIcon = channelIcons[call.callType] ?? Phone;
                    const isOverdue = call.status === "PENDING" && new Date(call.dueDate) < startOfDay;

                    return (
                      <tr key={call.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{call.subject}</p>
                          {call.notes && (
                            <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">{call.notes}</p>
                          )}
                        </td>

                        <td className="px-5 py-3 font-medium">
                          {person ? (
                            isCustomer ? (
                              <Link
                                href={`/customers/${person.id}`}
                                className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                              >
                                <User className="size-3.5 text-indigo-500" />
                                {person.firstName} {person.lastName}
                                {person.phone && (
                                  <span className="text-[11px] font-normal text-slate-500">({person.phone})</span>
                                )}
                              </Link>
                            ) : (
                              <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                                <User className="size-3.5 text-slate-400" />
                                {person.firstName} {person.lastName}{" "}
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200">
                                  Lead
                                </span>
                                {person.phone && (
                                  <span className="text-[11px] font-normal text-slate-500">({person.phone})</span>
                                )}
                              </span>
                            )
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
                            <ChannelIcon className="size-3 text-indigo-600" />
                            {channelLabels[call.callType] ?? call.callType}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <span className="rounded-md bg-indigo-50/70 text-indigo-800 px-2 py-0.5 text-[11px] font-medium border border-indigo-100">
                            {purposeLabels[call.callPurpose] ?? call.callPurpose}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-slate-600 font-medium">
                          <span className={cn(isOverdue && "text-rose-600 font-bold")}>
                            {fmtDateTime(call.dueDate)}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border w-fit",
                                isOverdue
                                  ? statusClass.OVERDUE
                                  : statusClass[call.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                              )}
                            >
                              {call.status === "COMPLETED" && <CheckCircle2 className="size-3" />}
                              {call.status === "PENDING" && !isOverdue && <Clock className="size-3" />}
                              {isOverdue && <AlertCircle className="size-3" />}
                              {isOverdue ? "OVERDUE" : call.status}
                            </span>
                            {call.callResult && (
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                                Result: {call.callResult.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {call.status !== "COMPLETED" && (
                              <Button
                                size="xs"
                                onClick={() => setLoggingCall(call)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-[11px] px-2.5 shadow-sm"
                              >
                                Log Outcome & Complete
                              </Button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(call.id)}
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete reminder"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Log Call Outcome Modal */}
        {loggingCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PhoneCall className="size-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Log Call Outcome & Complete</h3>
                </div>
                <button
                  onClick={() => setLoggingCall(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCompleteOutcome} className="mt-4 space-y-4">
                <div className="rounded-lg bg-indigo-50/60 p-3 text-xs">
                  <p className="font-bold text-indigo-950">{loggingCall.subject}</p>
                  <p className="mt-0.5 text-slate-600">
                    Client:{" "}
                    <span className="font-semibold text-slate-800">
                      {loggingCall.customer
                        ? `${loggingCall.customer.firstName} ${loggingCall.customer.lastName}`
                        : loggingCall.lead
                        ? `${loggingCall.lead.firstName} ${loggingCall.lead.lastName}`
                        : "—"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Call Outcome Result *</label>
                  <select
                    value={outcomeForm.callResult}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, callResult: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {CALL_RESULTS.map((res) => (
                      <option key={res.value} value={res.value}>
                        {res.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Call Outcome Notes / Next Steps</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Client requested pro-forma invoice for 120 sqm unit. Follow up with invoice by tomorrow morning..."
                    value={outcomeForm.notes}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLoggingCall(null)}
                    className="border-slate-300 text-slate-700 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm"
                  >
                    {saving ? "Saving…" : "Mark Completed"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
