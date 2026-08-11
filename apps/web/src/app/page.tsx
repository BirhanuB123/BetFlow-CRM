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
  FileCheck2,
  FileSignature,
  CreditCard,
  MousePointerClick,
  ExternalLink,
  Laptop,
  CheckCircle,
  Play,
  Building,
  Search,
  Lock,
  MessageSquare,
} from "lucide-react";

import { demoCredentials } from "@/features/go-to-market/go-to-market-data";
import { apiFetch, API_BASE_URL, getSession } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { StatusPill } from "@/components/ui/status-pill";

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

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "leads" | "units" | "pipeline" | "visits" | "payments"
  >("leads");

  // Live Database States
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

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
          // Ignore silent auth fallback
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
      ]);

      if (leadsRes?.length) setRealLeads(leadsRes);
      if (unitsRes?.length) setRealUnits(unitsRes);
      if (stackingRes?.length) setRealStacking(stackingRes);
      if (dealsRes?.length) setRealDeals(dealsRes);
      if (forecastRes) setRealForecast(forecastRes);
      if (visitsRes?.length) setRealVisits(visitsRes);
      if (schedulesRes?.length) setRealSchedules(schedulesRes);

      setDbConnected(true);
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
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#233b66] selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow CRM"
              width={36}
              height={36}
              className="rounded-lg shadow-sm transition-transform group-hover:scale-105 bg-white p-0.5"
              priority
            />
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight">
                betflow
              </span>
              <span className="rounded-md bg-indigo-600/30 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">
                CRM OS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-xs font-bold text-slate-300 md:flex">
            <Link
              href="/dashboard"
              className="hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/leads"
              className="hover:text-indigo-400 transition-colors"
            >
              Lead Intake
            </Link>
            <Link
              href="/units"
              className="hover:text-indigo-400 transition-colors"
            >
              Stacking Matrix
            </Link>
            <Link
              href="/contracts"
              className="hover:text-indigo-400 transition-colors"
            >
              Contracts & PDF
            </Link>
            <Link
              href="/portal"
              className="hover:text-indigo-400 transition-colors"
            >
              Buyer Portal
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyCreds}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-400" />
              ) : (
                <Copy className="size-3.5 text-slate-400" />
              )}
              <span>{copied ? "Copied!" : "Demo Credentials"}</span>
            </button>

            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Real Architectural Render Image & Glowing Elements */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>Enterprise Real Estate Sales & Stacking OS</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Close real estate sales 3x faster with{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  BetFlow CRM
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                The all-in-one operating system for property developers. Automate buyer lead intake, floor-by-floor unit stacking hold locks, bank payment schedules, and legal PDF e-signatures.
              </p>

              {/* Workflow Tag Selectors */}
              <div className="pt-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Select key workflows to test:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "leads", label: "Buyer Lead Intake", icon: UserRoundCheck },
                    { key: "units", label: "Unit Stacking Elevation", icon: Grid },
                    { key: "pipeline", label: "Sales Kanban Pipeline", icon: CircleDollarSign },
                    { key: "visits", label: "Site Visit Scheduler", icon: CalendarDays },
                    { key: "payments", label: "Payment Milestones", icon: Coins },
                    { key: "contracts", label: "PDF & E-Signatures", icon: FileText },
                  ].map((tag) => {
                    const Icon = tag.icon;
                    const active = selectedWorkflows[tag.key];
                    return (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() => toggleWorkflow(tag.key)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          active
                            ? "border-indigo-500 bg-indigo-600/30 text-indigo-200 shadow-md shadow-indigo-600/20"
                            : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span
                          className={`flex size-3.5 items-center justify-center rounded ${active ? "bg-indigo-500 text-white" : "bg-slate-800"}`}
                        >
                          {active && <Check className="size-2.5" />}
                        </span>
                        <Icon className="size-3.5 shrink-0" />
                        <span>{tag.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Launch Command Center</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/auth"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <span>Explore Demo Account</span>
                </Link>
              </div>

              {/* Credentials Note */}
              <div className="inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-xs text-slate-300 shadow-xs">
                <KeyRound className="size-4 text-indigo-400 shrink-0" />
                <span>
                  Demo Login:{" "}
                  <span className="font-mono text-indigo-300 font-bold">
                    {demoCredentials.email}
                  </span>{" "}
                  /{" "}
                  <span className="font-mono text-indigo-300 font-bold">
                    {demoCredentials.password}
                  </span>
                </span>
              </div>
            </div>

            {/* Right Column: High-End Property Architectural Render Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-2xl overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    src="/tower.png"
                    alt="Luxury Real Estate Architectural Render"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="rounded-md bg-slate-950/90 backdrop-blur-md border border-slate-800 px-2.5 py-1 text-[11px] font-extrabold text-white">
                      Bole Medhanialem Tower
                    </span>
                    <span className="rounded-md bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-extrabold text-white">
                      84% SOLD OUT
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800/80 text-xs flex items-center justify-between text-white">
                    <div>
                      <p className="font-bold text-slate-200">Active Inventory Stacking</p>
                      <p className="text-[11px] text-slate-400">12 Floors • 48 Luxury Apartments</p>
                    </div>
                    <Link
                      href="/units"
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      View Matrix →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dark macOS Application Workspace Frame with Live Database Tabs */}
      <section className="py-16 bg-slate-950 border-t border-b border-slate-800 text-white relative z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* macOS Chrome Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-300 font-mono text-[11px]">
                  <Database className="size-3.5 text-emerald-400" />
                  <span>betflow-crm.app — Active PostgreSQL Database Session</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  Live CRM Database Records
                </span>
                <button
                  type="button"
                  onClick={() => void loadDatabaseData()}
                  disabled={loadingDb}
                  className="ml-2 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={`size-3 text-indigo-400 ${loadingDb ? "animate-spin" : ""}`}
                  />
                  <span>{loadingDb ? "Syncing..." : "Refresh DB"}</span>
                </button>
              </div>
            </div>

            {/* Interactive Tabs Header */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4 mb-6">
              {[
                {
                  id: "leads",
                  label: "Lead Intake Engine",
                  icon: UserRoundCheck,
                  count: realLeads.length,
                },
                {
                  id: "units",
                  label: "Unit Stacking Matrix",
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
                  label: "Payment Milestones",
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
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white border border-indigo-400/40 shadow-md shadow-indigo-600/40"
                        : "bg-slate-950/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-black ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300 border border-slate-700"}`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="min-h-[340px] text-white">
              {/* TAB 1: REAL LEADS */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserRoundCheck className="size-4 text-indigo-400" />
                        Buyer Lead Intake & Conversion (Live Database)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Real-time buyer lead records stored in database schema.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                      LEADS ({realLeads.length} RECORDS)
                    </span>
                  </div>

                  {realLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <UserRoundCheck className="size-8 text-slate-500 mb-2" />
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
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-extrabold text-white truncate">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <StatusPill status={lead.status} size="sm" />
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-1 truncate">
                              {lead.company || lead.source?.name || "Direct Inquiry"}
                            </p>
                            {(lead.phone || lead.email) && (
                              <p className="text-[11px] text-indigo-300 font-mono mt-1 truncate">
                                {lead.phone || lead.email}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            <span>Added: {fmtDate(lead.createdAt)}</span>
                            <Link
                              href="/leads"
                              className="text-indigo-400 hover:text-indigo-300 font-bold"
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

              {/* TAB 2: STACKING MATRIX */}
              {activeTab === "units" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Grid className="size-4 text-purple-400" />
                        Property Inventory Matrix (Live Stacking Plan)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Floor-by-floor building elevation matrix and unit status locks.
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                      INVENTORY MATRIX ({realUnits.length} UNITS)
                    </span>
                  </div>

                  {realUnits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <Grid className="size-8 text-slate-500 mb-2" />
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
                  ) : (
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                      {realUnits.slice(0, 8).map((u) => (
                        <div
                          key={u.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-center text-xs font-extrabold text-white"
                        >
                          <div>
                            Unit {u.unitNumber} ({u.type})
                          </div>
                          <div className="text-[11px] font-bold mt-1 text-emerald-400">
                            {formatCurrency(u.price)}
                          </div>
                          <div className="mt-1 flex justify-center">
                            <StatusPill status={u.status} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PIPELINE */}
              {activeTab === "pipeline" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-emerald-400" />
                        Opportunity Kanban & Revenue Forecast (Live DB)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Weighted pipeline value calculated directly from stored sales deals.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
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

                  {realDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <CircleDollarSign className="size-8 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold">
                        No sales deals in pipeline yet.
                      </p>
                      <Link
                        href="/deals"
                        className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                      >
                        + Create First Opportunity Deal →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {realDeals.slice(0, 6).map((deal) => (
                        <div
                          key={deal.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between"
                        >
                          <div>
                            <p className="text-sm font-extrabold text-white truncate">
                              {deal.name}
                            </p>
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                              {deal.customer?.firstName} {deal.customer?.lastName}
                            </p>
                            <p className="text-sm font-black text-emerald-400 mt-2">
                              {formatCurrency(deal.value)}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-indigo-400 font-bold">
                              {deal.stage?.name}
                            </span>
                            <Link
                              href="/deals"
                              className="text-slate-400 hover:text-white font-bold"
                            >
                              Kanban →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: VISITS */}
              {activeTab === "visits" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CalendarDays className="size-4 text-amber-400" />
                        Site Visit Calendar & Tour Records
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Scheduled property tours and agent dispatch records.
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                      SITE TOURS ({realVisits.length} VISITS)
                    </span>
                  </div>

                  {realVisits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <CalendarDays className="size-8 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold">
                        No upcoming site visits scheduled.
                      </p>
                      <Link
                        href="/site-visits"
                        className="mt-2 text-xs font-bold text-amber-400 hover:underline"
                      >
                        + Book Property Site Tour →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {realVisits.slice(0, 6).map((visit) => (
                        <div
                          key={visit.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-white">
                              {visit.lead
                                ? `${visit.lead.firstName} ${visit.lead.lastName}`
                                : visit.customer
                                  ? `${visit.customer.firstName} ${visit.customer.lastName}`
                                  : "Buyer Visit"}
                            </span>
                            <StatusPill status={visit.status} size="sm" />
                          </div>
                          <p className="text-xs text-amber-400 font-bold mt-2">
                            🗓️ {fmtDate(visit.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Coins className="size-4 text-emerald-400" />
                        Installment Payment Milestones & Receipts
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Track construction milestones, downpayments, and bank slips.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                      SCHEDULED MILESTONES ({realSchedules.length})
                    </span>
                  </div>

                  {realSchedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <Coins className="size-8 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold">
                        No payment milestones logged yet.
                      </p>
                      <Link
                        href="/payments"
                        className="mt-2 text-xs font-bold text-emerald-400 hover:underline"
                      >
                        + Manage Payment Schedules →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {realSchedules.slice(0, 6).map((sch) => (
                        <div
                          key={sch.id}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-white">
                              {sch.milestoneName} ({sch.percentage}%)
                            </span>
                            <StatusPill status={sch.status} size="sm" />
                          </div>
                          <p className="text-sm font-black text-emerald-400 mt-2">
                            {formatCurrency(sch.amount)}
                          </p>
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

      {/* 4. Showcase Cards: Property Interiors & PDF Contracts */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
              High-Craft Real Estate Workflows
            </span>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Turn every buyer lead into a closed property sale
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Purpose-built tools for managing high-value residential, commercial, and diaspora property sales.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Render Card */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-xl overflow-hidden group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900">
                <Image
                  src="/interior.png"
                  alt="Modern Apartment Living Render"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs">
                  <span className="rounded bg-indigo-600/30 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 uppercase">
                    Luxury Penthouse Interior
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-1">Floor 14 • Penthouse A</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">240 sqm • Panoramic City View • Reserved</p>
                </div>
              </div>
            </div>

            {/* Right Feature Highlights */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Grid className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Atomic Unit Reservation Locks</h3>
                    <p className="text-xs text-slate-400">Zero risk of double booking. SQL row locks guarantee instant unit reservation status.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FileSignature className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">SHA-256 Verified PDF Contracts</h3>
                    <p className="text-xs text-slate-400">Server-side legal contract generation with mouse/touch signature pads and timestamped hash.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Coins className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Milestone Payment Schedules</h3>
                    <p className="text-xs text-slate-400">Track 30% downpayments, construction milestones, overdue penalties, and bank deposit slips.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Banner */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-r from-indigo-900 via-[#233b66] to-slate-950 text-white border-t border-slate-800">
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
            Ready to streamline your real estate sales pipeline?
          </h2>
          <p className="mt-4 text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get instant access to the BetFlow CRM command center with live unit stacking, buyer lead intake, and automated contract workflows.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-extrabold text-white shadow-lg hover:bg-indigo-500 active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={copyCreds}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all w-full sm:w-auto cursor-pointer"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-slate-400" />}
              <span>{copied ? "Demo Credentials Copied!" : "Copy Demo Credentials"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Multi-Column Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/betflow-mark.svg"
                alt="BetFlow CRM"
                width={32}
                height={32}
                className="rounded-lg bg-white p-1"
              />
              <div>
                <p className="text-sm font-extrabold text-white tracking-tight">
                  betflow CRM
                </p>
                <p className="text-xs text-slate-400">
                  Real Estate Sales & Contract Automation Operating System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-300">
              <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/leads" className="hover:text-indigo-400 transition-colors">
                Leads
              </Link>
              <Link href="/units" className="hover:text-indigo-400 transition-colors">
                Inventory
              </Link>
              <Link href="/contracts" className="hover:text-indigo-400 transition-colors">
                Contracts
              </Link>
              <Link href="/portal" className="hover:text-indigo-400 transition-colors">
                Buyer Portal
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} BetFlow S.C. All rights reserved.</p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (NestJS + Prisma + PostgreSQL)</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
