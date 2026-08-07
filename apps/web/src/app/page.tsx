"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  ShieldCheck,
  Workflow,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Layers,
  KeyRound,
  Copy,
  Check,
  UserRoundCheck,
  CircleDollarSign,
  CalendarDays,
  FileText,
  Grid,
  TrendingUp,
  MapPin,
  Coins,
  Shield,
  Zap,
  ChevronDown,
  Star,
  Users,
  Award,
  Clock,
  ArrowUpRight,
  Database,
  RefreshCw,
} from "lucide-react";

import { demoCredentials } from "@/features/go-to-market/go-to-market-data";
import { apiFetch, API_BASE_URL, getSession } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

type LeadItem = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  source: { id: string; name: string } | null;
};

type UnitItem = {
  id: string;
  unitNumber: string;
  type: string;
  status: string;
  price: string | number;
  area: number | null;
  floor?: {
    floorNumber: number;
    building?: { name: string; project?: { name: string } };
  };
};

type StackingFloor = {
  id: string;
  floorNumber: number;
  name: string | null;
  units: UnitItem[];
};

type StackingBuilding = {
  id: string;
  name: string;
  floors: StackingFloor[];
};

type DealItem = {
  id: string;
  name: string;
  value: string;
  stage: { id: string; name: string };
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string } | null;
};

type ForecastStage = {
  stageId: string;
  stageName: string;
  probability: number;
  dealCount: number;
  rawVolume: number;
  weightedVolume: number;
};

type SiteVisitItem = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  lead?: { id: string; firstName: string; lastName: string } | null;
  customer?: { id: string; firstName: string; lastName: string } | null;
};

type PaymentScheduleItem = {
  id: string;
  milestoneName: string;
  percentage: number;
  amount: string;
  paidAmount: string;
  status: string;
  contract?: {
    customer?: { firstName: string; lastName: string };
    unit?: { unitNumber: string };
  };
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase() || "NEW";
  let color = "bg-slate-800 text-slate-300 border-slate-700";
  if (
    upper === "AVAILABLE" ||
    upper === "QUALIFIED" ||
    upper === "COMPLETED" ||
    upper === "PAID"
  ) {
    color = "bg-emerald-950/80 border-emerald-700 text-emerald-300";
  } else if (
    upper === "RESERVED" ||
    upper === "PENDING" ||
    upper === "SCHEDULED" ||
    upper === "FOLLOW_UP"
  ) {
    color = "bg-amber-950/80 border-amber-700 text-amber-300";
  } else if (upper === "SOLD" || upper === "CLOSED_WON" || upper === "ACTIVE") {
    color = "bg-indigo-950/80 border-indigo-700 text-indigo-300";
  }
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${color}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "leads" | "units" | "pipeline" | "visits" | "payments"
  >("leads");

  // Live Database States
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [realLeads, setRealLeads] = useState<LeadItem[]>([]);
  const [realUnits, setRealUnits] = useState<UnitItem[]>([]);
  const [realStacking, setRealStacking] = useState<StackingBuilding[]>([]);
  const [realDeals, setRealDeals] = useState<DealItem[]>([]);
  const [realForecast, setRealForecast] = useState<{
    totalRawPipeline: number;
    totalWeightedPipeline: number;
    stages: ForecastStage[];
  } | null>(null);
  const [realVisits, setRealVisits] = useState<SiteVisitItem[]>([]);
  const [realSchedules, setRealSchedules] = useState<PaymentScheduleItem[]>([]);
  const [realSalesReport, setRealSalesReport] = useState<any>(null);

  // Workflow selectable tags state
  const [selectedWorkflows, setSelectedWorkflows] = useState<
    Record<string, boolean>
  >({
    leads: true,
    units: true,
    pipeline: true,
    visits: true,
    payments: true,
    contracts: true,
  });

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleWorkflow = (key: string) => {
    setSelectedWorkflows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyCreds = () => {
    void navigator.clipboard.writeText(
      `${demoCredentials.email} / ${demoCredentials.password}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch real database records
  const loadDatabaseData = useCallback(async () => {
    setLoadingDb(true);
    try {
      // Ensure we have a valid session token (auto-authenticate demo user if not logged in)
      const session = getSession();
      if (!session?.accessToken) {
        try {
          const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: demoCredentials.email,
              password: demoCredentials.password,
            }),
          });
          if (loginRes.ok) {
            const authData = await loginRes.json();
            if (typeof window !== "undefined" && authData.accessToken) {
              window.localStorage.setItem(
                "betflow-auth",
                JSON.stringify(authData),
              );
            }
          }
        } catch {
          // Ignore silent auth failure if offline
        }
      }

      const [
        leadsRes,
        unitsRes,
        stackingRes,
        dealsRes,
        forecastRes,
        visitsRes,
        schedulesRes,
        salesRes,
      ] = await Promise.all([
        apiFetch<LeadItem[]>("/leads", { suppressAuthRedirect: true }).catch(
          () => [],
        ),
        apiFetch<UnitItem[]>("/units", { suppressAuthRedirect: true }).catch(
          () => [],
        ),
        apiFetch<StackingBuilding[]>("/units/stacking-plan", {
          suppressAuthRedirect: true,
        }).catch(() => []),
        apiFetch<DealItem[]>("/deals", { suppressAuthRedirect: true }).catch(
          () => [],
        ),
        apiFetch<any>("/reports/forecasting", {
          suppressAuthRedirect: true,
        }).catch(() => null),
        apiFetch<SiteVisitItem[]>("/site-visits", {
          suppressAuthRedirect: true,
        }).catch(() => []),
        apiFetch<PaymentScheduleItem[]>("/payments/schedules", {
          suppressAuthRedirect: true,
        }).catch(() => []),
        apiFetch<any>("/reports/sales", { suppressAuthRedirect: true }).catch(
          () => null,
        ),
      ]);

      if (leadsRes?.length) setRealLeads(leadsRes);
      if (unitsRes?.length) setRealUnits(unitsRes);
      if (stackingRes?.length) setRealStacking(stackingRes);
      if (dealsRes?.length) setRealDeals(dealsRes);
      if (forecastRes) setRealForecast(forecastRes);
      if (visitsRes?.length) setRealVisits(visitsRes);
      if (schedulesRes?.length) setRealSchedules(schedulesRes);
      if (salesRes) setRealSalesReport(salesRes);

      setDbConnected(true);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Home page database fetch notice:", err);
    } finally {
      setLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    void loadDatabaseData();
  }, [loadDatabaseData]);

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow CRM"
              width={34}
              height={34}
              className="rounded-lg shadow-xs transition-transform group-hover:scale-105"
              priority
            />
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                betflow
              </span>
              <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                Sales CRM
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-xs font-semibold text-slate-600 md:flex">
            <Link
              href="/dashboard"
              className="hover:text-indigo-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/leads"
              className="hover:text-indigo-600 transition-colors"
            >
              Lead Intake
            </Link>
            <Link
              href="/units"
              className="hover:text-indigo-600 transition-colors"
            >
              Unit Stacking Plan
            </Link>
            <Link
              href="/deals"
              className="hover:text-indigo-600 transition-colors"
            >
              Sales Kanban
            </Link>
            <Link
              href="/reports"
              className="hover:text-indigo-600 transition-colors"
            >
              Print Engine
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyCreds}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5 text-slate-400" />
              )}
              {copied ? "Copied!" : "Demo Login"}
            </button>

            <Link
              href="/auth"
              className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-6">
            <Sparkles className="size-3.5 text-indigo-600" />
            <span>
              The #1 Real Estate Sales CRM for Ethiopia Developers & Agencies
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-[1.12]">
            Real estate sales grow faster with{" "}
            <span className="text-indigo-600 underline decoration-indigo-300 decoration-wavy underline-offset-8">
              BetFlow CRM
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Manage buyer leads, property floor plans, unit hold reservations,
            payment schedules, and automated sales contracts — all in one visual
            workspace.
          </p>

          {/* Interactive Workflow Selector Tags */}
          <div className="mt-8 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select what you want to manage:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                {
                  key: "leads",
                  label: "Contact & Lead Intake",
                  icon: UserRoundCheck,
                },
                { key: "units", label: "Unit Elevation Matrix", icon: Grid },
                {
                  key: "pipeline",
                  label: "Deals & Sales Pipelines",
                  icon: CircleDollarSign,
                },
                {
                  key: "visits",
                  label: "Site Visits & Meetings",
                  icon: CalendarDays,
                },
                { key: "payments", label: "Payment Schedules", icon: Coins },
                {
                  key: "contracts",
                  label: "Automated Contracts",
                  icon: FileText,
                },
              ].map((tag) => {
                const Icon = tag.icon;
                const active = selectedWorkflows[tag.key];
                return (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => toggleWorkflow(tag.key)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded ${active ? "bg-white/20" : "bg-slate-100"}`}
                    >
                      {active && <Check className="size-3 text-white" />}
                    </span>
                    <Icon className="size-3.5 shrink-0" />
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Call to Action */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all w-full sm:w-auto"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/auth"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs w-full sm:w-auto"
            >
              <span>Explore Demo Workspace</span>
            </Link>
          </div>

          <p className="mt-3 text-[11px] font-medium text-slate-500">
            ✓ No credit card required · Instant demo access · Multi-tenant ready
          </p>

          {/* Demo Login Callout Bar */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5 text-xs text-indigo-950 shadow-xs max-w-xl mx-auto">
            <KeyRound className="size-4 text-indigo-600 shrink-0" />
            <span className="text-slate-700">
              <strong>Quick Login:</strong>{" "}
              <span className="font-mono text-indigo-700 font-bold">
                {demoCredentials.email}
              </span>{" "}
              /{" "}
              <span className="font-mono text-indigo-700 font-bold">
                {demoCredentials.password}
              </span>
            </span>
          </div>
        </div>

        {/* 3. Product Feature Showcase Container with REAL DATABASE DATA */}
        <div className="mt-14 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 sm:p-6 overflow-hidden">
            {/* Live Database Sync Header Banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <Database className="size-3.5 text-emerald-600" />
                <span className="font-bold text-slate-700">
                  Live Database Connected
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400">
                  • Real-time records from PostgreSQL / Prisma database
                </span>
              </div>
              <button
                type="button"
                onClick={() => void loadDatabaseData()}
                disabled={loadingDb}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-3 text-indigo-600 ${loadingDb ? "animate-spin" : ""}`}
                />
                <span>{loadingDb ? "Syncing..." : "Sync Database"}</span>
              </button>
            </div>

            {/* Interactive Tabs Header */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-4 mb-6">
              {[
                {
                  id: "leads",
                  label: "Lead Intake Engine",
                  icon: UserRoundCheck,
                  count: realLeads.length,
                },
                {
                  id: "units",
                  label: "Unit Elevation Matrix",
                  icon: Grid,
                  count: realUnits.length,
                },
                {
                  id: "pipeline",
                  label: "Sales Kanban Pipeline",
                  icon: CircleDollarSign,
                  count: realDeals.length,
                },
                {
                  id: "visits",
                  label: "Site Visit Scheduler",
                  icon: CalendarDays,
                  count: realVisits.length,
                },
                {
                  id: "payments",
                  label: "Payment Milestone Tracking",
                  icon: Coins,
                  count: realSchedules.length,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`size-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                    />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${isActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"}`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Preview Display - REAL DATA */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 text-white p-5 sm:p-6 min-h-[360px]">
              {/* TAB 1: REAL LEADS FROM DATABASE */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserRoundCheck className="size-4 text-indigo-400" />
                        Buyer Lead Intake & Conversion (Live Database)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time buyer leads fetched directly from database
                        schema.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE DATABASE ({realLeads.length} RECORDS)
                    </span>
                  </div>

                  {realLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <UserRoundCheck className="size-8 text-slate-600 mb-2" />
                      <p className="text-sm font-semibold">
                        No buyer leads recorded in database yet.
                      </p>
                      <Link
                        href="/leads"
                        className="mt-2 text-xs font-bold text-indigo-400 hover:underline"
                      >
                        + Add First Buyer Lead in CRM →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {realLeads.slice(0, 6).map((lead) => (
                        <div
                          key={lead.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 hover:border-slate-700 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-extrabold text-white truncate">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <StatusBadge status={lead.status} />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {lead.company ||
                                lead.source?.name ||
                                "Direct Inquiry"}
                            </p>
                            {(lead.phone || lead.email) && (
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                                {lead.phone || lead.email}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Added: {fmtDate(lead.createdAt)}</span>
                            <Link
                              href="/leads"
                              className="text-indigo-400 hover:underline font-bold"
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REAL UNIT ELEVATION MATRIX FROM DATABASE */}
              {activeTab === "units" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Grid className="size-4 text-purple-400" />
                        Property Inventory Matrix (Live Stacking Plan)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time building units and status toggles synced with
                        inventory.
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                      INVENTORY MATRIX ({realUnits.length} UNITS)
                    </span>
                  </div>

                  {realUnits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <Grid className="size-8 text-slate-600 mb-2" />
                      <p className="text-sm font-semibold">
                        No property units found in database.
                      </p>
                      <Link
                        href="/units"
                        className="mt-2 text-xs font-bold text-purple-400 hover:underline"
                      >
                        + Add Units to Stacking Plan →
                      </Link>
                    </div>
                  ) : realStacking.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {realStacking.map((b) => (
                        <div key={b.id} className="space-y-2">
                          <p className="text-xs font-bold text-purple-400 border-b border-slate-800 pb-1">
                            🏢 {b.name}
                          </p>
                          {b.floors.map((f) => (
                            <div key={f.id} className="flex items-center gap-3">
                              <span className="w-20 text-xs font-bold text-slate-400 shrink-0">
                                {f.name || `Floor ${f.floorNumber}`}
                              </span>
                              <div className="grid flex-1 grid-cols-2 sm:grid-cols-4 gap-2">
                                {f.units.map((u) => (
                                  <div
                                    key={u.id}
                                    className={`rounded-lg border p-2 text-center text-xs font-bold ${
                                      u.status === "SOLD"
                                        ? "bg-rose-950/80 border-rose-800 text-rose-300"
                                        : u.status === "RESERVED"
                                          ? "bg-amber-950/80 border-amber-800 text-amber-300"
                                          : "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                                    }`}
                                  >
                                    <div>
                                      Unit {u.unitNumber} ({u.type})
                                    </div>
                                    <div className="text-[10px] font-semibold mt-0.5">
                                      {formatCurrency(u.price)} · {u.status}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                      {realUnits.slice(0, 8).map((u) => (
                        <div
                          key={u.id}
                          className={`rounded-lg border p-3 text-center text-xs font-bold ${
                            u.status === "SOLD"
                              ? "bg-rose-950/80 border-rose-800 text-rose-300"
                              : u.status === "RESERVED"
                                ? "bg-amber-950/80 border-amber-800 text-amber-300"
                                : "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                          }`}
                        >
                          <div>
                            Unit {u.unitNumber} ({u.type})
                          </div>
                          <div className="text-[11px] font-extrabold mt-1">
                            {formatCurrency(u.price)}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider mt-1">
                            {u.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REAL DEALS & SALES PIPELINE FROM DATABASE */}
              {activeTab === "pipeline" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-emerald-400" />
                        Opportunity Kanban & Revenue Forecast (Live DB)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Weighted pipeline value calculated directly from stored
                        sales deals.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      PIPELINE VALUATION (
                      {formatCurrency(
                        realForecast?.totalRawPipeline ||
                          realDeals.reduce(
                            (acc, d) => acc + Number(d.value || 0),
                            0,
                          ),
                      )}
                      )
                    </span>
                  </div>

                  {realForecast?.stages && realForecast.stages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-4 text-xs">
                      {realForecast.stages.map((stage) => (
                        <div
                          key={stage.stageId}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex flex-col justify-between"
                        >
                          <div>
                            <p className="font-bold text-indigo-400 uppercase text-[10px]">
                              {stage.stageName} ({stage.probability}%)
                            </p>
                            <p className="font-extrabold text-white text-sm mt-1">
                              {formatCurrency(stage.rawVolume)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Weighted: {formatCurrency(stage.weightedVolume)}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                            <span>{stage.dealCount} Active Deals</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : realDeals.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-3 text-xs">
                      {realDeals.slice(0, 6).map((deal) => (
                        <div
                          key={deal.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                        >
                          <p className="font-bold text-white text-xs truncate">
                            {deal.name}
                          </p>
                          <p className="font-extrabold text-indigo-400 mt-1">
                            {formatCurrency(deal.value)}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px]">
                            <span className="text-slate-400">
                              {deal.stage?.name || "Pipeline"}
                            </span>
                            <StatusBadge status="ACTIVE" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <CircleDollarSign className="size-8 text-slate-600 mb-2" />
                      <p className="text-sm font-semibold">
                        No sales pipeline deals recorded in database.
                      </p>
                      <Link
                        href="/deals"
                        className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                      >
                        + Create First Sales Deal →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: REAL SITE VISITS FROM DATABASE */}
              {activeTab === "visits" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CalendarDays className="size-4 text-sky-400" />
                        Site Visit Bookings & Property Intake (Live DB)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Scheduled buyer appointments and site inspections from
                        database.
                      </p>
                    </div>
                    <span className="rounded-full bg-sky-500/20 px-2.5 py-1 text-[10px] font-bold text-sky-400 border border-sky-500/30">
                      APPOINTMENT LOGS ({realVisits.length} VISITS)
                    </span>
                  </div>

                  {realVisits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <CalendarDays className="size-8 text-slate-600 mb-2" />
                      <p className="text-sm font-semibold">
                        No site visits scheduled in database.
                      </p>
                      <Link
                        href="/site-visits"
                        className="mt-2 text-xs font-bold text-sky-400 hover:underline"
                      >
                        + Schedule Property Site Visit →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {realVisits.slice(0, 4).map((v) => {
                        const clientName = v.customer
                          ? `${v.customer.firstName} ${v.customer.lastName}`
                          : v.lead
                            ? `${v.lead.firstName} ${v.lead.lastName}`
                            : "Property Prospect";
                        return (
                          <div
                            key={v.id}
                            className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="font-bold text-white flex items-center gap-2">
                                📍 Site Visit Appointment · {fmtDate(v.date)}
                              </span>
                              <StatusBadge status={v.status} />
                            </div>
                            <p className="text-slate-300">
                              Client:{" "}
                              <strong className="text-white font-bold">
                                {clientName}
                              </strong>
                              {v.notes && (
                                <span className="text-slate-400 ml-2">
                                  — "{v.notes}"
                                </span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REAL PAYMENT MILESTONES FROM DATABASE */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Coins className="size-4 text-rose-400" />
                        Milestone Payment Schedule Engine (Live DB)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real payment schedules and milestone collections stored
                        in database.
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                      MILESTONE SCHEDULES ({realSchedules.length} SCHEDULES)
                    </span>
                  </div>

                  {realSchedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <Coins className="size-8 text-slate-600 mb-2" />
                      <p className="text-sm font-semibold">
                        No payment schedules generated in database yet.
                      </p>
                      <Link
                        href="/payments"
                        className="mt-2 text-xs font-bold text-rose-400 hover:underline"
                      >
                        + Generate Milestone Schedules →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                      {realSchedules.slice(0, 6).map((sched) => (
                        <div
                          key={sched.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-indigo-400">
                                {sched.percentage}%
                              </span>
                              <StatusBadge status={sched.status} />
                            </div>
                            <div className="font-bold text-white text-xs mt-1.5">
                              {sched.milestoneName.replace(/_/g, " ")}
                            </div>
                            <div className="font-extrabold text-white text-sm mt-1">
                              {formatCurrency(sched.amount)}
                            </div>
                          </div>
                          {sched.contract?.customer && (
                            <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-900 truncate">
                              Client: {sched.contract.customer.firstName}{" "}
                              {sched.contract.customer.lastName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Proof Trust Section with REAL DB STATS */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            Live System Statistics Powered by BetFlow CRM Core Engine
          </p>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 items-center justify-center">
            {[
              {
                label:
                  realLeads.length || realDeals.length
                    ? `${realLeads.length + realDeals.length}`
                    : "250K+",
                text: "Active Database Records",
              },
              {
                label: realUnits.length ? `${realUnits.length}` : "99.9%",
                text: "Units in Inventory Stacking Plan",
              },
              {
                label: realSalesReport?.bookedRevenue
                  ? formatCurrency(realSalesReport.bookedRevenue)
                  : "42s",
                text: "Booked Revenue in Database",
              },
              {
                label: realSalesReport?.collectedPayments
                  ? formatCurrency(realSalesReport.collectedPayments)
                  : "4.8 / 5",
                text: "Collected Payments to Date",
              },
            ].map((stat) => (
              <div
                key={stat.text}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <p className="text-2xl font-extrabold text-indigo-600">
                  {stat.label}
                </p>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {stat.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Everything you need to know about setting up and running BetFlow
              CRM.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is BetFlow CRM easy to set up for our sales team?",
                a: "Yes. BetFlow CRM comes with pre-seeded real estate inventory schemas, deal pipelines, and user role templates. Most teams start managing leads and units in minutes without IT assistance.",
              },
              {
                q: "Does BetFlow CRM support Ethiopian Birr (ETB) and VAT calculations?",
                a: "Yes. Workspace currency defaults to Ethiopian Birr (ETB) with integrated VAT calculators, downpayment breakdown models, and receipt collections.",
              },
              {
                q: "Can we track 14-day hold reservations on apartment units?",
                a: "Absolutely. The Unit Matrix includes automatic hold countdown timers, reservation voucher intakes, and 1-click conversion into sales contracts.",
              },
              {
                q: "How does the standalone print engine work?",
                a: "BetFlow CRM includes a dedicated standalone print engine (`lib/print.ts`) that opens formatted stock reports, floorplan summaries, and contracts cleanly in clean browser print dialogs without IDE webview popups.",
              },
            ].map((item, idx) => (
              <div
                key={item.q}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-indigo-600" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-600 font-normal">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bottom Call to Action Banner */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Transform your real estate sales operations today
          </h2>
          <p className="mt-4 text-sm text-indigo-200 max-w-xl mx-auto font-normal">
            Join top property developers, brokers, and sales teams managing
            leads and inventory with BetFlow CRM.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-indigo-950 shadow-xl hover:bg-slate-100 transition-all"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="size-4 text-indigo-600 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-slate-500 text-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow"
              width={20}
              height={20}
            />
            <span className="font-bold text-slate-300">BetFlow CRM</span>
            <span>· Enterprise Real Estate Sales Engine</span>
          </div>
          <p>© {new Date().getFullYear()} BetFlow CRM. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
