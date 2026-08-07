"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Trash2,
  X,
  Building2,
  Ruler,
  Compass,
  Layers,
  Banknote,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type PersonRef = { id: string; firstName: string; lastName: string } | null;

type ApiSiteVisit = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  lead: PersonRef;
  customer: PersonRef;
  preferredSqm?: number | string | null;
  bedroomCount?: number | null;
  preferredFloor?: string | null;
  facingDirection?: string | null;
  propertyType?: string | null;
  purpose?: string | null;
  budgetETB?: number | string | null;
  paymentMethod?: string | null;
  demands?: string | null;
};

type CustomerOption = { id: string; firstName: string; lastName: string };
type LeadOption = { id: string; firstName: string; lastName: string };

const statusClass: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  NO_SHOW: "bg-amber-50 text-amber-700 border-amber-200",
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

const PROPERTY_TYPES = [
  "Apartment (አፓርታማ)",
  "Commercial Shop / Retail (ንግድ ቤት)",
  "Office Space (ቢሮ)",
  "Villa / G+ Residence (ቪላ)",
  "Penthouse / Duplex (ፔንትሃውስ)",
];

const FLOOR_PREFERENCES = [
  "Ground / Commercial Floor",
  "Low Floor (1st - 5th Floor)",
  "Mid Floor (6th - 10th Floor)",
  "High Floor / View (11th+ Floor)",
  "Penthouse / Top Floor",
];

const FACING_DIRECTIONS = [
  "East / Sunrise (ምስራቅ - የጠዋት ፀሐይ)",
  "South / Sun (ደቡብ)",
  "West / Sunset (ምዕራብ)",
  "Main Road Facing (ዋና መንገድ)",
  "City Skyline View (የከተማ እይታ)",
  "Quiet Garden / Courtyard View",
];

const PURPOSES = [
  "Personal Residence (ለኑሮ)",
  "Investment / Rental Income (ለኢንቨስትመንት)",
  "Commercial / Business Use (ለንግድ)",
  "Family / Parents Gift (ለቤተሰብ)",
];

const PAYMENT_METHODS = [
  "Installment Plan (በክፍያ - 20%/30% Downpayment)",
  "Bank Loan / Mortgage (30/70 ወይም የባንክ ብድር)",
  "Full Cash Discount (ሙሉ በጥሬ ገንዘብ)",
  "Diaspora USD / Foreign Currency Transfer",
];

export default function SiteVisitsPage() {
  const { success, error: toastError } = useToast();
  const [visits, setVisits] = useState<ApiSiteVisit[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeModalVisit, setActiveModalVisit] = useState<ApiSiteVisit | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({ isOpen: false, message: "", onConfirm: () => {} });

  // View mode: "list" | "calendar"
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  // Calendar navigation — start at the current month
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [form, setForm] = useState({
    withType: "customer" as "customer" | "lead",
    withId: "",
    date: "",
    notes: "",
    propertyType: PROPERTY_TYPES[0],
    preferredSqm: "",
    bedroomCount: "2",
    preferredFloor: FLOOR_PREFERENCES[1],
    facingDirection: FACING_DIRECTIONS[0],
    purpose: PURPOSES[0],
    budgetETB: "",
    paymentMethod: PAYMENT_METHODS[0],
    demands: "",
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
      setError(
        err instanceof Error ? err.message : "Failed to load site visits",
      );
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
          propertyType: form.propertyType,
          preferredSqm: form.preferredSqm
            ? Number(form.preferredSqm)
            : undefined,
          bedroomCount: form.bedroomCount
            ? Number(form.bedroomCount)
            : undefined,
          preferredFloor: form.preferredFloor,
          facingDirection: form.facingDirection,
          purpose: form.purpose,
          budgetETB: form.budgetETB ? Number(form.budgetETB) : undefined,
          paymentMethod: form.paymentMethod,
          demands: form.demands || undefined,
          ...(form.withType === "customer"
            ? { customerId: form.withId }
            : { leadId: form.withId }),
        }),
      });

      setForm({
        withType: "customer",
        withId: "",
        date: "",
        notes: "",
        propertyType: PROPERTY_TYPES[0],
        preferredSqm: "",
        bedroomCount: "2",
        preferredFloor: FLOOR_PREFERENCES[1],
        facingDirection: FACING_DIRECTIONS[0],
        purpose: PURPOSES[0],
        budgetETB: "",
        paymentMethod: PAYMENT_METHODS[0],
        demands: "",
      });
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

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: "Delete this site visit record? This cannot be undone.",
      onConfirm: async () => {
        setError(null);
        try {
          await apiFetch(`/site-visits/${id}`, { method: "DELETE" });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          success("Visit record deleted");
          await load();
        } catch (err) {
          toastError("Failed to delete visit");
          setError(err instanceof Error ? err.message : "Failed to delete visit");
        }
      },
    });
  };

  const withOptions = form.withType === "customer" ? customers : leads;

  // KPI stats
  const kpiScheduled = visits.filter((v) => v.status === "SCHEDULED").length;
  const kpiCompleted = visits.filter((v) => v.status === "COMPLETED").length;
  const kpiNoShow = visits.filter((v) => v.status === "NO_SHOW").length;

  // ── Calendar helpers ────────────────────────────────────────────────────────
  // Build the 6-row × 7-col grid for the current calendar month.
  const calendarGrid = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Shift so week starts on Monday (0=Mon … 6=Sun)
    const startOffset = (firstDay + 6) % 7;
    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Pad to complete the last week
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarDate]);

  // Group visits by local calendar date string "YYYY-M-D"
  const visitsByDay = useMemo(() => {
    const map = new Map<string, ApiSiteVisit[]>();
    for (const v of visits) {
      const d = new Date(v.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return map;
  }, [visits]);

  const calMonthLabel = calendarDate.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goToPrevMonth = () =>
    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToToday = () => {
    const t = new Date();
    t.setDate(1);
    t.setHours(0, 0, 0, 0);
    setCalendarDate(t);
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const statusChipClass: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
    NO_SHOW:   "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <DashboardShell
      title="Site Visits & Customer Demands"
      description="Track property site visits, buyer unit preferences, square meters, floor placement, and purchase intent."
      active="Site visits"
    >
      <div className="space-y-6">
        {/* KPI Stat Row */}
        <StatRow>
          <StatCard
            label="Total Visits"
            value={String(visits.length)}
            detail="All recorded visits"
            icon={CalendarDays}
            color="navy"
          />
          <StatCard
            label="Scheduled"
            value={String(kpiScheduled)}
            detail="Upcoming appointments"
            icon={Clock}
            color="blue"
          />
          <StatCard
            label="Completed"
            value={String(kpiCompleted)}
            detail="Successfully toured"
            icon={ClipboardCheck}
            color="emerald"
          />
          <StatCard
            label="No Shows"
            value={String(kpiNoShow)}
            detail="Follow-up needed"
            icon={AlertTriangle}
            color={kpiNoShow > 0 ? "amber" : "emerald"}
          />
        </StatRow>

        {/* Main Header & Schedule Button */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-[#233b66]" />
                <h2 className="text-lg font-bold text-slate-900">
                  Site Visit Bookings & Buyer Preferences
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Book physical property tours, track client transport details,
                and record exact unit specifications requested.
              </p>
            </div>
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={
                !showForm && customers.length === 0 && leads.length === 0
              }
              className="bg-[#233b66] hover:bg-[#1a2d50] text-white font-medium shadow-sm transition-all"
            >
              {showForm ? (
                <X className="size-4 mr-1.5" />
              ) : (
                <CalendarPlus className="size-4 mr-1.5" />
              )}
              {showForm ? "Cancel Intake" : "Book Site Visit"}
            </Button>
          </div>

          {/* Ethiopian Real Estate Visit Intake Form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mt-6 rounded-xl border border-[#233b66]/20 bg-gradient-to-b from-[#233b66]/5 to-slate-50/50 p-5 shadow-inner"
            >
              <div className="border-b border-[#233b66]/20 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#233b66] uppercase tracking-wider flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#233b66] text-[10px] text-white font-bold">
                    1
                  </span>
                  Visit Appointment & Client Selection
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visit With
                  </label>
                  <select
                    value={form.withType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        withType: e.target.value as "customer" | "lead",
                        withId: "",
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="customer">
                      Customer (Converted Contact)
                    </option>
                    <option value="lead">Lead (Prospect)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Client / Lead *
                  </label>
                  <select
                    required
                    value={form.withId}
                    onChange={(e) =>
                      setForm({ ...form, withId: e.target.value })
                    }
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Section 2: Ethiopian Real Estate Buyer Preferences & Demands */}
              <div className="border-b border-indigo-100 pb-3 my-5 pt-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold">
                    2
                  </span>
                  Buyer Property Specifications & Placement Demands
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={form.propertyType}
                    onChange={(e) =>
                      setForm({ ...form, propertyType: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Area (Square Meters / ካሬ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 120"
                      value={form.preferredSqm}
                      onChange={(e) =>
                        setForm({ ...form, preferredSqm: e.target.value })
                      }
                      className="w-full h-9 rounded-lg border border-slate-300 bg-white pl-3 pr-10 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">
                      m²
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bedrooms Count
                  </label>
                  <select
                    value={form.bedroomCount}
                    onChange={(e) =>
                      setForm({ ...form, bedroomCount: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="1">1 Bedroom (Studio / Single)</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms / Penthouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Floor Placement Preference
                  </label>
                  <select
                    value={form.preferredFloor}
                    onChange={(e) =>
                      setForm({ ...form, preferredFloor: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {FLOOR_PREFERENCES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orientation & Facing
                  </label>
                  <select
                    value={form.facingDirection}
                    onChange={(e) =>
                      setForm({ ...form, facingDirection: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {FACING_DIRECTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Purpose
                  </label>
                  <select
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Budget (ETB / ብር)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 8500000"
                    value={form.budgetETB}
                    onChange={(e) =>
                      setForm({ ...form, budgetETB: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Plan Preference
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 3: Detailed Demands & Follow-up Notes */}
              <div className="border-b border-indigo-100 pb-3 my-5 pt-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold">
                    3
                  </span>
                  Specific Demands & Visit Notes
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Custom Demands & Requests
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Requested balcony with sunrise view, parking space for 2 SUVs, backup generator guarantee, installment breakdown over 24 months..."
                    value={form.demands}
                    onChange={(e) =>
                      setForm({ ...form, demands: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    General Visit Notes & Outcome
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Client visited site with spouse. Showed Model Unit 4B. Highly interested, requested pro-forma invoice by Friday..."
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
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
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm"
                >
                  {saving
                    ? "Scheduling Intake…"
                    : "Save Visit & Requirements Intake"}
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

        {/* Site Visits Data Table / Calendar */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Section header with view toggle */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">
              Scheduled Visits & Demand Records ({visits.length})
            </h3>
            {/* List / Calendar toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "list"
                    ? "bg-[#233b66] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                )}
                aria-label="List view"
              >
                <List className="size-3.5" />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "calendar"
                    ? "bg-[#233b66] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                )}
                aria-label="Calendar view"
              >
                <CalendarDays className="size-3.5" />
                Calendar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={4} cols={6} />
            </div>
          ) : viewMode === "calendar" ? (
            /* ── Calendar View ─────────────────────────────────────────── */
            <div className="p-4">
              {/* Month navigation */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevMonth}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <h4 className="text-sm font-bold text-slate-800 min-w-[160px] text-center">
                    {calMonthLabel}
                  </h4>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={goToToday}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Day-of-week headers (Mon–Sun) */}
              <div className="grid grid-cols-7 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                {calendarGrid.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div
                        key={`pad-${idx}`}
                        className="bg-slate-50/60 min-h-[90px] p-1"
                      />
                    );
                  }
                  const cellKey = `${calendarDate.getFullYear()}-${calendarDate.getMonth()}-${day}`;
                  const isToday = cellKey === todayKey;
                  const dayVisits = visitsByDay.get(cellKey) ?? [];
                  return (
                    <div
                      key={cellKey}
                      className={cn(
                        "bg-white min-h-[90px] p-1.5 flex flex-col gap-1",
                        isToday && "bg-blue-50/60",
                      )}
                    >
                      {/* Date number */}
                      <span
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-full text-[11px] font-bold self-end",
                          isToday
                            ? "bg-[#233b66] text-white"
                            : "text-slate-500",
                        )}
                      >
                        {day}
                      </span>

                      {/* Visit chips */}
                      {dayVisits.slice(0, 3).map((v) => {
                        const person = v.customer ?? v.lead;
                        const name = person
                          ? `${person.firstName} ${person.lastName}`
                          : "Unknown";
                        const t = new Date(v.date).toLocaleTimeString(
                          undefined,
                          { hour: "numeric", minute: "2-digit" },
                        );
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setActiveModalVisit(v)}
                            title={`${name} — ${t}`}
                            className={cn(
                              "w-full rounded border px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight truncate transition-all hover:brightness-95 hover:shadow-sm",
                              statusChipClass[v.status] ??
                                "bg-slate-100 text-slate-700 border-slate-200",
                            )}
                          >
                            <span className="block truncate">{name}</span>
                            <span className="block font-normal opacity-70">{t}</span>
                          </button>
                        );
                      })}
                      {/* +N more indicator */}
                      {dayVisits.length > 3 && (
                        <span className="text-[10px] font-semibold text-slate-400 px-1">
                          +{dayVisits.length - 3} more
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                {([
                  ["SCHEDULED",  "bg-blue-100 text-blue-800",    "Scheduled"],
                  ["COMPLETED",  "bg-emerald-100 text-emerald-800", "Completed"],
                  ["CANCELLED",  "bg-rose-100 text-rose-800",    "Cancelled"],
                  ["NO_SHOW",    "bg-amber-100 text-amber-800",  "No Show"],
                ] as const).map(([, cls, label]) => (
                  <span
                    key={label}
                    className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border border-transparent", cls)}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : visits.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 mb-2">
                <Building2 className="size-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No site visits recorded yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click "Schedule New Visit & Intake" to log your first Ethiopian
                real estate customer site visit with detailed buying demands.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Client / Visitor</th>
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Demand Specs (Sqm & Beds)</th>
                    <th className="px-5 py-3">Placement & Facing</th>
                    <th className="px-5 py-3">Budget & Payment</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((visit) => {
                    const person = visit.customer ?? visit.lead;
                    const isCustomer = Boolean(visit.customer);
                    return (
                      <tr
                        key={visit.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
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

                        <td className="px-5 py-3 text-slate-600 font-medium">
                          {fmtDateTime(visit.date)}
                        </td>

                        {/* Demand Specs */}
                        <td className="px-5 py-3">
                          {visit.preferredSqm ||
                          visit.bedroomCount ||
                          visit.propertyType ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                {visit.preferredSqm && (
                                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                    {visit.preferredSqm} m²
                                  </span>
                                )}
                                {visit.bedroomCount && (
                                  <span className="text-slate-600 font-medium">
                                    {visit.bedroomCount} Bed
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                {visit.propertyType ?? "Apartment"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              Not specified
                            </span>
                          )}
                        </td>

                        {/* Placement & Facing */}
                        <td className="px-5 py-3">
                          {visit.preferredFloor || visit.facingDirection ? (
                            <div className="flex flex-col gap-0.5 text-[11px]">
                              <span className="font-medium text-slate-800">
                                {visit.preferredFloor ?? "Any floor"}
                              </span>
                              <span className="text-slate-500 truncate max-w-[160px]">
                                {visit.facingDirection ?? "Any orientation"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              Flexible
                            </span>
                          )}
                        </td>

                        {/* Budget & Payment */}
                        <td className="px-5 py-3">
                          {visit.budgetETB ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-emerald-700">
                                {formatCurrency(visit.budgetETB)}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                {visit.paymentMethod
                                  ? visit.paymentMethod.split("(")[0]
                                  : "Standard"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">TBD</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                              statusClass[visit.status] ??
                                "bg-slate-100 text-slate-700 border-slate-200",
                            )}
                          >
                            {visit.status === "COMPLETED" && (
                              <CheckCircle2 className="size-3" />
                            )}
                            {visit.status === "SCHEDULED" && (
                              <Clock className="size-3" />
                            )}
                            {visit.status === "CANCELLED" && (
                              <XCircle className="size-3" />
                            )}
                            {visit.status === "NO_SHOW" && (
                              <AlertTriangle className="size-3" />
                            )}
                            {visit.status.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Full Requirements Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => setActiveModalVisit(visit)}
                              className="rounded bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="View Full Customer Demands"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            {visit.status === "SCHEDULED" && (
                              <>
                                <Button
                                  size="xs"
                                  onClick={() =>
                                    changeStatus(visit.id, "COMPLETED")
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] px-2"
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() =>
                                    changeStatus(visit.id, "NO_SHOW")
                                  }
                                  className="border-amber-300 text-amber-800 hover:bg-amber-50 h-7 text-[11px] px-2"
                                >
                                  No-show
                                </Button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(visit.id)}
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete visit"
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

        {/* Customer Requirements Full Specs Modal */}
        {activeModalVisit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Buyer Specifications & Demands
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalVisit(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-indigo-50/60 p-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Client / Visitor
                    </p>
                    <p className="text-sm font-bold text-indigo-950">
                      {activeModalVisit.customer
                        ? `${activeModalVisit.customer.firstName} ${activeModalVisit.customer.lastName}`
                        : activeModalVisit.lead
                          ? `${activeModalVisit.lead.firstName} ${activeModalVisit.lead.lastName} (Lead)`
                          : "—"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                      statusClass[activeModalVisit.status],
                    )}
                  >
                    {activeModalVisit.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Ruler className="size-3 text-indigo-500" /> Required Area
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {activeModalVisit.preferredSqm
                        ? `${activeModalVisit.preferredSqm} m²`
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Layers className="size-3 text-indigo-500" /> Bedrooms &
                      Type
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {activeModalVisit.bedroomCount
                        ? `${activeModalVisit.bedroomCount} Bedrooms`
                        : "Flexible"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Compass className="size-3 text-indigo-500" /> Placement &
                      Floor
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {activeModalVisit.preferredFloor ?? "Any floor"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Compass className="size-3 text-indigo-500" /> Facing /
                      Orientation
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {activeModalVisit.facingDirection ?? "Any orientation"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Banknote className="size-3 text-emerald-600" /> Target
                      Budget (ETB)
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {activeModalVisit.budgetETB
                        ? formatCurrency(activeModalVisit.budgetETB)
                        : "Flexible"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FileText className="size-3 text-indigo-500" /> Payment
                      Terms
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {activeModalVisit.paymentMethod ?? "Standard Plan"}
                    </p>
                  </div>
                </div>

                {activeModalVisit.demands && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                    <p className="text-[11px] font-bold text-amber-900 mb-1">
                      Specific Buyer Demands & Requests
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeModalVisit.demands}
                    </p>
                  </div>
                )}

                {activeModalVisit.notes && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-700 mb-1">
                      Visit Notes & Next Steps
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeModalVisit.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setActiveModalVisit(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
                >
                  Close Specification Sheet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Site Visit"
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </DashboardShell>
  );
}
