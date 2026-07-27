"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Video,
  PhoneCall,
  Building,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  MapPin,
  FileText,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type PersonRef = { id: string; firstName: string; lastName: string } | null;

type ApiMeeting = {
  id: string;
  title: string;
  meetingType: string;
  date: string;
  durationMinutes: number;
  location: string | null;
  agenda: string | null;
  notes: string | null;
  status: string;
  lead: PersonRef;
  customer: PersonRef;
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type LeadOption = { id: string; firstName: string; lastName: string };

const statusClass: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  NO_SHOW: "bg-amber-50 text-amber-700 border-amber-200",
};

const meetingTypeIcons: Record<string, typeof Building> = {
  IN_PERSON_OFFICE: Building,
  VIRTUAL_ZOOM: Video,
  PHONE_CALL: PhoneCall,
};

const meetingTypeLabels: Record<string, string> = {
  IN_PERSON_OFFICE: "In-Office Meeting",
  VIRTUAL_ZOOM: "Virtual / Zoom Call",
  PHONE_CALL: "Phone Call Consultation",
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

function toIso(local: string) {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<ApiMeeting[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    withType: "customer" as "customer" | "lead",
    withId: "",
    meetingType: "IN_PERSON_OFFICE",
    date: "",
    durationMinutes: "30",
    location: "",
    agenda: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meetingsData, customersData, leadsData] = await Promise.all([
        apiFetch<ApiMeeting[]>("/meetings").catch(() => []),
        apiFetch<CustomerOption[]>("/customers").catch(() => []),
        apiFetch<LeadOption[]>("/leads").catch(() => []),
      ]);
      setMeetings(meetingsData);
      setCustomers(customersData);
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meetings");
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
      await apiFetch<ApiMeeting>("/meetings", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          meetingType: form.meetingType,
          date: toIso(form.date),
          durationMinutes: Number(form.durationMinutes) || 30,
          location: form.location || undefined,
          agenda: form.agenda || undefined,
          notes: form.notes || undefined,
          ...(form.withType === "customer"
            ? { customerId: form.withId }
            : { leadId: form.withId }),
        }),
      });

      setForm({
        title: "",
        withType: "customer",
        withId: "",
        meetingType: "IN_PERSON_OFFICE",
        date: "",
        durationMinutes: "30",
        location: "",
        agenda: "",
        notes: "",
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule meeting");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    setError(null);
    try {
      await apiFetch(`/meetings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update meeting");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this meeting record?")) return;
    setError(null);
    try {
      await apiFetch(`/meetings/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meeting");
    }
  };

  const withOptions = form.withType === "customer" ? customers : leads;

  const scheduledCount = meetings.filter((m) => m.status === "SCHEDULED").length;
  const completedCount = meetings.filter((m) => m.status === "COMPLETED").length;
  const virtualCount = meetings.filter((m) => m.meetingType === "VIRTUAL_ZOOM").length;

  return (
    <DashboardShell
      title="Meetings & Business Consultations"
      description="Schedule and manage office consultations, virtual Zoom calls, deal negotiations, and phone appointments."
      active="Meetings"
    >
      <div className="space-y-6">
        {/* Schedule Header & Action */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Meeting Calendar & Appointments</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Book client consultations, deal negotiations, or virtual Zoom meetings with prospects.
              </p>
            </div>
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={!showForm && customers.length === 0 && leads.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {showForm ? <X className="size-4 mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
              {showForm ? "Cancel Schedule" : "Schedule Meeting"}
            </Button>
          </div>

          {/* Schedule Meeting Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4">
                Meeting Appointment Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title / Subject *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Payment Schedule & Bank Mortgage Review"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Format</label>
                  <select
                    value={form.meetingType}
                    onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="IN_PERSON_OFFICE">In-Person Office Meeting</option>
                    <option value="VIRTUAL_ZOOM">Virtual Zoom / Google Meet Call</option>
                    <option value="PHONE_CALL">Phone Consultation Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Participant Type</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Person *</label>
                  <select
                    required
                    value={form.withId}
                    onChange={(e) => setForm({ ...form, withId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="">Select {form.withType}…</option>
                    {withOptions.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="90">1.5 Hours</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Video Link</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Office Conference Room B or https://zoom.us/j/123456"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agenda & Meeting Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Discussion points, contract terms to cover, client questions..."
                    value={form.agenda}
                    onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
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
                  {saving ? "Scheduling…" : "Save & Book Meeting"}
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

        {/* Meetings List Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Scheduled Meetings & Consultations ({meetings.length})</h3>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-slate-500">Loading scheduled meetings…</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <CalendarDays className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No meetings scheduled yet</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click "Schedule Meeting" to book your first client consultation, office negotiation, or Zoom call.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Meeting Title</th>
                    <th className="px-5 py-3">Participant</th>
                    <th className="px-5 py-3">Format</th>
                    <th className="px-5 py-3">Date & Duration</th>
                    <th className="px-5 py-3">Location / Link</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {meetings.map((meeting) => {
                    const person = meeting.customer ?? meeting.lead;
                    const isCustomer = Boolean(meeting.customer);
                    const TypeIcon = meetingTypeIcons[meeting.meetingType] ?? Building;

                    return (
                      <tr key={meeting.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-semibold text-slate-800">
                          {meeting.title}
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
                              </Link>
                            ) : (
                              <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                                <User className="size-3.5 text-slate-400" />
                                {person.firstName} {person.lastName}{" "}
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200">
                                  Lead
                                </span>
                              </span>
                            )
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
                            <TypeIcon className="size-3 text-indigo-600" />
                            {meetingTypeLabels[meeting.meetingType] ?? meeting.meetingType}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-slate-600 font-medium">
                          <div>
                            <p>{fmtDateTime(meeting.date)}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{meeting.durationMinutes} mins duration</p>
                          </div>
                        </td>

                        <td className="px-5 py-3 text-slate-600">
                          {meeting.location ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 truncate max-w-[180px]">
                              <MapPin className="size-3 text-slate-400" />
                              {meeting.location}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Office / TBD</span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                              statusClass[meeting.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            {meeting.status === "COMPLETED" && <CheckCircle2 className="size-3" />}
                            {meeting.status === "SCHEDULED" && <Clock className="size-3" />}
                            {meeting.status === "CANCELLED" && <XCircle className="size-3" />}
                            {meeting.status === "NO_SHOW" && <AlertTriangle className="size-3" />}
                            {meeting.status.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {meeting.status === "SCHEDULED" && (
                              <>
                                <Button
                                  size="xs"
                                  onClick={() => changeStatus(meeting.id, "COMPLETED")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2"
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => changeStatus(meeting.id, "NO_SHOW")}
                                  className="border-amber-300 text-amber-800 hover:bg-amber-50 h-7 text-[11px] px-2"
                                >
                                  No-show
                                </Button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(meeting.id)}
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete meeting"
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
      </div>
    </DashboardShell>
  );
}
