"use client";

import React, { useEffect, useState } from "react";
import {
  PhoneCall,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PhoneOutgoing,
  PhoneIncoming,
  MessageCircle,
  Send,
  Calendar,
  Sparkles,
  X,
  Trash2,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { useTranslation } from "@/lib/i18n/language-context";
import type {
  CallLogItem,
  CallType,
  CallPurpose,
  CallResult,
} from "@betflow/shared";

interface LeadOption {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface CustomerOption {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export function CallsView() {
  const { t } = useTranslation();
  const [calls, setCalls] = useState<CallLogItem[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // New Call Form State
  const [form, setForm] = useState({
    subject: "",
    callType: "OUTBOUND" as CallType,
    callPurpose: "POST_VISIT_FOLLOWUP" as CallPurpose,
    callResult: "INTERESTED" as CallResult,
    dueDate: new Date().toISOString().split("T")[0],
    durationSeconds: "120",
    notes: "",
    contactType: "LEAD" as "LEAD" | "CUSTOMER",
    contactId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [callsData, leadsData, customersData] = await Promise.all([
        apiFetch<CallLogItem[]>("/calls").catch(() => []),
        apiFetch<LeadOption[]>("/leads").catch(() => []),
        apiFetch<CustomerOption[]>("/customers").catch(() => []),
      ]);
      setCalls(callsData || []);
      setLeads(leadsData || []);
      setCustomers(customersData || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup WebSockets connection to /calls namespace
    let socket: any = null;
    try {
      const io = (window as any).io;
      if (io) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const wsUrl = apiUrl.replace(/\/api$/, "");
        socket = io(`${wsUrl}/calls`, { transports: ["websocket"] });

        socket.on("connect", () => setSocketConnected(true));
        socket.on("disconnect", () => setSocketConnected(false));

        socket.on("call:created", (data: any) => {
          setCalls((prev) => [data, ...prev.filter((c) => c.id !== data.id)]);
        });

        socket.on("call:updated", (data: any) => {
          setCalls((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
        });

        socket.on("call:completed", (data: any) => {
          setCalls((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
        });

        socket.on("call:deleted", (data: { id: string }) => {
          setCalls((prev) => prev.filter((c) => c.id !== data.id));
        });
      }
    } catch {
      // Socket.io unavailable
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        subject: form.subject.trim(),
        callType: form.callType,
        callPurpose: form.callPurpose,
        callResult: form.callResult,
        dueDate: form.dueDate,
        durationSeconds: parseInt(form.durationSeconds || "0", 10),
        notes: form.notes.trim() || undefined,
        leadId: form.contactType === "LEAD" ? form.contactId : undefined,
        customerId: form.contactType === "CUSTOMER" ? form.contactId : undefined,
      };

      const newCall = await apiFetch<CallLogItem>("/calls", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCalls((prev) => [newCall, ...prev]);
      setIsModalOpen(false);
      setForm({
        subject: "",
        callType: "OUTBOUND",
        callPurpose: "POST_VISIT_FOLLOWUP",
        callResult: "INTERESTED",
        dueDate: new Date().toISOString().split("T")[0],
        durationSeconds: "120",
        notes: "",
        contactType: "LEAD",
        contactId: "",
      });
    } catch (err: any) {
      alert(err?.message || "Failed to record call log");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteCall = async (id: string) => {
    try {
      const updated = await apiFetch<CallLogItem>(`/calls/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          durationSeconds: 180,
          callResult: "INTERESTED",
        }),
      });

      setCalls((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      // Error handling
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!confirm("Are you sure you want to delete this call log?")) return;
    try {
      await apiFetch(`/calls/${id}`, { method: "DELETE" });
      setCalls((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // Error handling
    }
  };

  // Filtered List
  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.leadName && c.leadName.toLowerCase().includes(search.toLowerCase())) ||
      (c.customerName && c.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "ALL" || c.callType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="size-5 text-[#233b66]" />
              {t("calls.title")}
            </h2>
            {socketConnected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success border border-success/20">
                <span className="size-1.5 rounded-full bg-success animate-ping" />
                Real-Time Socket Connected
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {t("calls.subtitle")}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          {t("calls.newCall")}
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("calls.searchCalls")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-700 focus:border-[#233b66] focus:outline-none"
          >
            <option value="ALL">{t("calls.callType")}: {t("calls.allCalls")}</option>
            <option value="OUTBOUND">{t("calls.outbound")}</option>
            <option value="INBOUND">{t("calls.inbound")}</option>
            <option value="TELEGRAM">Telegram Calls</option>
            <option value="WHATSAPP">WhatsApp Calls</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-700 focus:border-[#233b66] focus:outline-none"
          >
            <option value="ALL">{t("dashboard.status")}: {t("calls.allCalls")}</option>
            <option value="PENDING">{t("payments.statusPending")}</option>
            <option value="COMPLETED">{t("siteVisits.statusCompleted")}</option>
            <option value="OVERDUE">{t("payments.statusOverdue")}</option>
          </select>
        </div>
      </div>

      {/* Calls Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <PhoneCall className="size-12 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t("calls.noCallsFound")}</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {t("calls.subtitle")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">{t("calls.callNotes")}</th>
                  <th className="py-3.5 px-4">{t("calls.clientName")}</th>
                  <th className="py-3.5 px-4">{t("calls.callType")}</th>
                  <th className="py-3.5 px-4">{t("calls.outcome")}</th>
                  <th className="py-3.5 px-4">{t("calls.scheduledAt")}</th>
                  <th className="py-3.5 px-4">{t("dashboard.status")}</th>
                  <th className="py-3.5 px-4 text-right">{t("actions.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{call.subject}</div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {call.callPurpose.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {call.leadName ? (
                        <span className="font-medium text-[#233b66]">
                          Lead: {call.leadName}
                        </span>
                      ) : call.customerName ? (
                        <span className="font-medium text-success">
                          Customer: {call.customerName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">General Outreach</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {call.callType === "OUTBOUND" && <PhoneOutgoing className="size-3 text-info" />}
                        {call.callType === "INBOUND" && <PhoneIncoming className="size-3 text-success" />}
                        {call.callType === "TELEGRAM" && <Send className="size-3 text-info" />}
                        {call.callType === "WHATSAPP" && <MessageCircle className="size-3 text-success" />}
                        {call.callType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {call.callResult ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {call.callResult.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending Call</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-slate-400" />
                        {new Date(call.dueDate).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {call.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                          <CheckCircle2 className="size-3 text-success" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-semibold text-warning">
                          <Clock className="size-3 text-warning" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {call.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleCompleteCall(call.id)}
                            title="Mark as Completed"
                            className="rounded-lg bg-success/10 p-1.5 text-success hover:bg-success/10 transition-colors"
                          >
                            <Check className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCall(call.id)}
                          title="Delete Call Log"
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-[#233b66]" />
                <h3 className="text-base font-bold text-slate-900">
                  Log / Schedule Telephony Call
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCall} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Call Subject / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Post-site visit follow-up regarding 30% payment plan"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Call Type
                  </label>
                  <select
                    value={form.callType}
                    onChange={(e) => setForm({ ...form, callType: e.target.value as CallType })}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                  >
                    <option value="OUTBOUND">Outbound Phone Call</option>
                    <option value="INBOUND">Inbound Inquiry</option>
                    <option value="TELEGRAM">Telegram Audio Call</option>
                    <option value="WHATSAPP">WhatsApp Call</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Call Purpose
                  </label>
                  <select
                    value={form.callPurpose}
                    onChange={(e) => setForm({ ...form, callPurpose: e.target.value as CallPurpose })}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                  >
                    <option value="POST_VISIT_FOLLOWUP">Post-Site-Visit Follow-Up</option>
                    <option value="PAYMENT_REMINDER">Payment Milestone Reminder</option>
                    <option value="DIASPORA_OUTREACH">Diaspora Outreach</option>
                    <option value="PROPOSAL_REVIEW">Proposal & Contract Review</option>
                    <option value="GENERAL_INQUIRY">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Category
                  </label>
                  <select
                    value={form.contactType}
                    onChange={(e) => setForm({ ...form, contactType: e.target.value as "LEAD" | "CUSTOMER", contactId: "" })}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                  >
                    <option value="LEAD">Sales Lead</option>
                    <option value="CUSTOMER">Existing Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Contact
                  </label>
                  <select
                    value={form.contactId}
                    onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                  >
                    <option value="">Select contact…</option>
                    {form.contactType === "LEAD"
                      ? leads.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.firstName} {l.lastName}
                          </option>
                        ))
                      : customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Call Outcome / Result
                  </label>
                  <select
                    value={form.callResult}
                    onChange={(e) => setForm({ ...form, callResult: e.target.value as CallResult })}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                  >
                    <option value="INTERESTED">Interested in Reservation</option>
                    <option value="REQUESTED_PROFORMA">Requested Proforma Invoice</option>
                    <option value="BUSY_CALL_BACK">Busy / Call Back Later</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="NO_ANSWER">No Answer</option>
                    <option value="SCHEDULED_SITE_VISIT">Scheduled Site Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Call Notes / Conversation Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Record key conversation notes, buyer preferences, or next steps…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving Call Log…" : "Save Call Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
