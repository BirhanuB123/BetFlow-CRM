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
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#233b66] selection:text-white">
      {/* 1. Header Navigation (Follow Up Boss Style Sticky Bar) */}
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
              <span className="text-lg font-extrabold text-[#233b66] tracking-tight">
                betflow
              </span>
              <span className="rounded-md bg-[#233b66] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                CRM Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-xs font-semibold text-slate-600 md:flex">
            <Link
              href="/dashboard"
              className="hover:text-[#233b66] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/leads"
              className="hover:text-[#233b66] transition-colors"
            >
              Lead Intake
            </Link>
            <Link
              href="/units"
              className="hover:text-[#233b66] transition-colors"
            >
              Stacking Plan
            </Link>
            <Link
              href="/contracts"
              className="hover:text-[#233b66] transition-colors"
            >
              Contracts & PDF
            </Link>
            <Link
              href="/portal"
              className="hover:text-[#233b66] transition-colors"
            >
              Buyer Portal
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyCreds}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5 text-slate-400" />
              )}
              {copied ? "Copied!" : "Demo Credentials"}
            </button>

            <Link
              href="/auth"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#233b66] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#233b66]/20 hover:bg-[#1c3054] active:scale-[0.98] transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Follow Up Boss Style High-Impact Banner with Background Image Overlay) */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#233b66]/5 via-white to-white">
        {/* Background Image Overlay matching system colors (#233b66) */}
        <div className="absolute inset-0 z-0 opacity-15 bg-cover bg-center bg-no-repeat pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/30 via-white/80 to-white pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Eyebrow Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#233b66]/20 bg-[#233b66]/10 px-4 py-1.5 text-xs font-bold text-[#233b66] mb-6 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>
              Real Estate Sales, Unit Stacking & E-Signature Operating System
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl max-w-5xl mx-auto leading-[1.12]">
            Streamline real estate sales & contracts with{" "}
            <span className="bg-gradient-to-r from-slate-900 via-[#233b66] to-indigo-600 bg-clip-text text-transparent underline decoration-[#233b66]/30 decoration-wavy underline-offset-8">
              BetFlow CRM
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Manage buyer leads, property floor plans, unit holds, bank slips,
            digital e-signatures, and automated legal PDF contracts — in one
            seamless workspace.
          </p>

          {/* Interactive Workflow Selector Tags */}
          <div className="mt-8 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select key workflows to explore:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                {
                  key: "leads",
                  label: "Lead Intake & Conversion",
                  icon: UserRoundCheck,
                },
                { key: "units", label: "Unit Stacking Elevation", icon: Grid },
                {
                  key: "pipeline",
                  label: "Sales Kanban Pipeline",
                  icon: CircleDollarSign,
                },
                {
                  key: "visits",
                  label: "Site Visit Scheduler",
                  icon: CalendarDays,
                },
                { key: "payments", label: "Payment Schedules", icon: Coins },
                {
                  key: "contracts",
                  label: "PDF & E-Signatures",
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
                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      active
                        ? "border-[#233b66] bg-[#233b66] text-white shadow-md shadow-[#233b66]/20"
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
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#233b66] px-8 text-sm font-bold text-white shadow-lg shadow-[#233b66]/25 hover:bg-[#1c3054] active:scale-[0.98] transition-all w-full sm:w-auto"
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

          {/* Quick Credential Callout */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5 text-xs text-indigo-950 shadow-xs max-w-xl mx-auto">
            <KeyRound className="size-4 text-[#233b66] shrink-0" />
            <span className="text-slate-700">
              <strong>Quick Demo Access:</strong>{" "}
              <span className="font-mono text-[#233b66] font-bold">
                {demoCredentials.email}
              </span>{" "}
              /{" "}
              <span className="font-mono text-[#233b66] font-bold">
                {demoCredentials.password}
              </span>
            </span>
          </div>

          {/* Follow Up Boss Style Social Proof Metric Bar */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xl font-extrabold text-[#233b66]">100% Real-Time</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">PostgreSQL Sync</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xl font-extrabold text-[#233b66]">SHA-256 Verified</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Digital E-Signatures</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xl font-extrabold text-[#233b66]">Unit Elevation</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Stacking Floor Locks</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xl font-extrabold text-[#233b66]">Automated PDF</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Sales Agreements</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dark Glass Workspace Window Showcase (Follow Up Boss macOS Window Frame) */}
      <section className="py-16 bg-slate-900 border-t border-b border-slate-800 text-white relative z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="dark rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* macOS Styled Header / Window Chrome */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-200 font-mono text-[11px]">
                  <Database className="size-3.5 text-emerald-400" />
                  <span>betflow-crm.app — Active PostgreSQL Session</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-200">
                  Real-time CRM Workspace Records
                </span>
                <button
                  type="button"
                  onClick={() => void loadDatabaseData()}
                  disabled={loadingDb}
                  className="ml-2 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
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
                  label: "Unit Stacking Elevation",
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
                        ? "bg-[#233b66] text-white border border-indigo-400/40 shadow-md shadow-[#233b66]/40"
                        : "bg-slate-900/90 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-black ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-200 border border-slate-700"}`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Preview Display */}
            <div className="min-h-[340px] text-white">
              {/* TAB 1: REAL LEADS FROM DATABASE */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserRoundCheck className="size-4 text-indigo-400" />
                        Buyer Lead Intake & Conversion (Live Database)
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Real-time buyer leads stored in database schema.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                      LEADS ({realLeads.length} RECORDS)
                    </span>
                  </div>

                  {realLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
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
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-extrabold text-white truncate">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <StatusPill status={lead.status} size="sm" />
                            </div>
                            <p className="text-xs text-slate-300 font-semibold mt-1 truncate">
                              {lead.company ||
                                lead.source?.name ||
                                "Direct Inquiry"}
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

              {/* TAB 2: REAL UNIT ELEVATION MATRIX FROM DATABASE */}
              {activeTab === "units" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Grid className="size-4 text-purple-400" />
                        Property Inventory Matrix (Live Stacking Plan)
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Floor-by-floor building elevation matrix and unit status locks.
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                      INVENTORY MATRIX ({realUnits.length} UNITS)
                    </span>
                  </div>

                  {realUnits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
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
                  ) : realStacking.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {realStacking.map((b) => (
                        <div key={b.id} className="space-y-2">
                          <p className="text-xs font-bold text-purple-400 border-b border-slate-800 pb-1">
                            🏢 {b.name}
                          </p>
                          {b.floors.map((f) => (
                            <div key={f.id} className="flex items-center gap-3">
                              <span className="w-20 text-xs font-extrabold text-slate-300 shrink-0">
                                {f.name || `Floor ${f.floorNumber}`}
                              </span>
                              <div className="grid flex-1 grid-cols-2 sm:grid-cols-4 gap-2">
                                {f.units.map((u) => (
                                  <div
                                    key={u.id}
                                    className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-center text-xs font-extrabold text-white"
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
                          className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-center text-xs font-extrabold text-white"
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

              {/* TAB 3: REAL DEALS & SALES PIPELINE FROM DATABASE */}
              {activeTab === "pipeline" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-emerald-400" />
                        Opportunity Kanban & Revenue Forecast (Live DB)
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
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
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
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
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between"
                        >
                          <div>
                            <p className="text-sm font-extrabold text-white truncate">
                              {deal.name}
                            </p>
                            <p className="text-xs text-slate-300 font-semibold mt-1">
                              {deal.customer.firstName} {deal.customer.lastName}
                            </p>
                            <p className="text-sm font-black text-emerald-400 mt-2">
                              {formatCurrency(deal.value)}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-indigo-400 font-bold">
                              {deal.stage.name}
                            </span>
                            <Link
                              href="/deals"
                              className="text-slate-300 hover:text-white font-bold"
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

              {/* TAB 4: REAL SITE VISITS */}
              {activeTab === "visits" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CalendarDays className="size-4 text-amber-400" />
                        Site Visit Calendar & Tour Records
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Scheduled property tours and agent dispatch records.
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                      SITE TOURS ({realVisits.length} VISITS)
                    </span>
                  </div>

                  {realVisits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
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
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4"
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
                          {visit.notes && (
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                              {visit.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REAL PAYMENT SCHEDULES */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Coins className="size-4 text-emerald-400" />
                        Installment Payment Milestones & Receipts
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Track construction milestones, downpayments, and bank slips.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                      SCHEDULED MILESTONES ({realSchedules.length})
                    </span>
                  </div>

                  {realSchedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
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
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4"
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
                          {sch.contract?.customer && (
                            <p className="text-xs text-slate-300 mt-1 font-semibold">
                              Buyer: {sch.contract.customer.firstName}{" "}
                              {sch.contract.customer.lastName}
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

      {/* 4. Follow Up Boss Style Alternating Feature Showcase Rows */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#233b66]">
              Why Real Estate Developers Choose BetFlow
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Turn every buyer lead into a closed property sale
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Purpose-built tools for managing high-value residential, commercial,
              and diaspora property sales.
            </p>
          </div>

          {/* Row 1: Lead Intake */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-[#233b66]">
                <UserRoundCheck className="size-4" />
                <span>Speed-to-Lead Engine</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Capture & convert buyer leads before anyone else
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your social channels, Meta lead forms, and website landing pages. Automatically assign leads to sales agents based on location and budget.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold pt-2">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Instant Facebook & Instagram lead form webhook synchronization</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Automated SMS and WhatsApp drip sequence triggers</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Diaspora buyer tracking with currency conversion support</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/leads"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#233b66] hover:underline"
                >
                  <span>Explore Lead Intake Engine</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#233b66] text-white text-xs font-bold">
                      BH
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Birhanu Haile</p>
                      <p className="text-[11px] text-slate-500">Addis Ababa • Luxury Apartment Inquiry</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    HOT LEAD
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Budget Range</span>
                    <span className="font-extrabold text-slate-800">12.5M – 18.0M ETB</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Preferred Unit</span>
                    <span className="font-extrabold text-slate-800">3 BHK Penthouse</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Stacking Plan Elevation Matrix */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-extrabold text-[#233b66]">Bole Tower A — Floor 12 Elevation</span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">STACKING PLAN</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
                    <p className="text-emerald-800 font-extrabold">Unit 1201</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">AVAILABLE</p>
                    <p className="text-[11px] text-slate-700 mt-1 font-mono">142 sqm</p>
                  </div>
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                    <p className="text-amber-800 font-extrabold">Unit 1202</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">RESERVED</p>
                    <p className="text-[11px] text-slate-700 mt-1 font-mono">98 sqm</p>
                  </div>
                  <div className="rounded-lg border border-slate-300 bg-slate-100 p-3">
                    <p className="text-slate-800 font-extrabold">Unit 1203</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">SOLD</p>
                    <p className="text-[11px] text-slate-700 mt-1 font-mono">180 sqm</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                <Grid className="size-4" />
                <span>Inventory Lock Matrix</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Floor-by-floor unit stacking elevation matrix
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Never double-book a property unit again. Manage real-time inventory statuses across multiple towers, floors, and layouts with instant reservation locks.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold pt-2">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Atomic unit status locking (`AVAILABLE`, `RESERVED`, `SOLD`)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Calculated price per sqm and orientation filters</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Direct link to buyer hold receipts and sales contracts</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/units"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#233b66] hover:underline"
                >
                  <span>Open Stacking Elevation Matrix</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Row 3: Contracts & E-Signatures */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <FileSignature className="size-4" />
                <span>Legal Document Automation</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Automated legal PDF contracts & digital e-signatures
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate server-side sales contracts in seconds with custom installment schedules. Collect digital signatures with tamper-evident cryptographic audit logs.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold pt-2">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>PDF generation with custom branding and payment milestones</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Touch & mouse signature pad canvas with SHA-256 hash</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Audit trail with timestamp, IP address, and signer verification</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/contracts"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#233b66] hover:underline"
                >
                  <span>Test PDF & Contract Builder</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-extrabold text-[#233b66]">Sales Contract Agreement #2026-089</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">VERIFIED E-SIGN</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 font-mono">
                  <p className="text-[11px] text-slate-600">Signer: Solomon Tadesse</p>
                  <p className="text-[11px] text-slate-600">SHA-256: 8f9a2b1c4e7d3a2f...</p>
                  <p className="text-[10px] text-emerald-600 font-bold">✓ Signature Recorded (Aug 10, 2026)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bento Box Feature Highlights (6 Follow Up Boss Style Capability Cards) */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#233b66]">
              End-to-End Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Built for Ethiopian Real Estate Developers
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Purpose-built tools for managing high-value residential, commercial,
              and diaspora property sales.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#233b66]/10 text-[#233b66] mb-5 group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                <Grid className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Floor Stacking Elevation Matrix
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Visualize building floors, unit layouts, sqm area, and live
                availability statuses (`AVAILABLE`, `RESERVED`, `SOLD`) with
                atomic inventory locking.
              </p>
              <Link
                href="/units"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#233b66] hover:underline"
              >
                <span>View Stacking Plan</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#233b66]/10 text-[#233b66] mb-5 group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                <FileText className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Automated Legal PDF Contracts
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Generate server-side PDF Ethiopian sales agreements with custom
                payment schedules, property specifications, and brand headers.
              </p>
              <Link
                href="/contracts"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#233b66] hover:underline"
              >
                <span>Generate Contracts</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#233b66]/10 text-[#233b66] mb-5 group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                <FileSignature className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Digital E-Signatures & Audit Trail
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Capture buyer signatures on touch/mouse canvas pads with
                timestamped SHA-256 cryptographic verification hashes.
              </p>
              <Link
                href="/contracts/builder"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#233b66] hover:underline"
              >
                <span>Test Contract Builder</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#233b66]/10 text-[#233b66] mb-5 group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                <Laptop className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Buyer Self-Service Portal
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Dedicated client portal allowing buyers to track payment schedules,
                upload bank slips, download receipts, and view signed agreements.
              </p>
              <Link
                href="/portal"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#233b66] hover:underline"
              >
                <span>Explore Buyer Portal</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#233b66]/10 text-[#233b66] mb-5 group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                <ChartNoAxesCombined className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Sales Forecasting & Cash Flow Aging
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Monitor agent sales conversion, aging payment receipts, overdue
                milestones, and weighted revenue projections.
              </p>
              <Link
                href="/reports"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#233b66] hover:underline"
              >
                <span>View Analytics</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {/* Card 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#233b66]/10 text-[#233b66] mb-5 group-hover:bg-[#233b66] group-hover:text-white transition-colors">
                <Workflow className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Meta & Website Lead Integrations
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Connect Facebook Lead Ads, Instagram inquiries, and website forms
                with automatic lead assignment and SMS/email drip triggers.
              </p>
              <Link
                href="/integrations/social-leads"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#233b66] hover:underline"
              >
                <span>Social Webhooks</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Follow Up Boss Style Social Proof & Testimonials */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#233b66]">
              Real Results
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Trusted by Top Real Estate Developers
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;BetFlow CRM transformed how our sales agents manage unit availability and contracts. We eliminated double-booking and closed deals 35% faster.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs font-extrabold text-slate-900">Dawit Yohannes</p>
                <p className="text-[11px] text-slate-500 font-medium">Sales Director, Apex Real Estate</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;The unit stacking elevation matrix and buyer self-service portal gave our diaspora buyers complete trust. Highly recommended for real estate teams.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs font-extrabold text-slate-900">Helina Bekele</p>
                <p className="text-[11px] text-slate-500 font-medium">Operations Lead, Sunshine Housing</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;Generating legal PDF sales agreements with cryptographic e-signatures directly from lead records saved our legal team hundreds of hours.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs font-extrabold text-slate-900">Tewodros Alemu</p>
                <p className="text-[11px] text-slate-500 font-medium">General Manager, Zemen Properties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. High-Conversion Follow Up Boss Bottom CTA Banner */}
      <section className="relative overflow-hidden py-16 bg-[#233b66] text-white">
        {/* Background Image Overlay matching system colors (#233b66) */}
        <div className="absolute inset-0 z-0 opacity-25 bg-cover bg-center bg-no-repeat pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/hero-bg.png')" }} />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to streamline your real estate sales pipeline?
          </h2>
          <p className="mt-4 text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Get instant access to the BetFlow CRM command center with live unit stacking, lead intake, and automated contract workflows.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-[#233b66] shadow-lg hover:bg-slate-100 active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              type="button"
              onClick={copyCreds}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/20 transition-all w-full sm:w-auto cursor-pointer"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-slate-300" />}
              <span>{copied ? "Demo Credentials Copied!" : "Copy Demo Credentials"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer (Structured Multi-Column & Operational Indicator) */}
      <footer className="border-t border-slate-200 bg-slate-900 text-white py-12">
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
                <p className="text-sm font-extrabold tracking-tight">
                  betflow CRM
                </p>
                <p className="text-xs text-slate-400">
                  Real Estate Sales & Contract Automation Operating System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/leads" className="hover:text-white transition-colors">
                Leads
              </Link>
              <Link href="/units" className="hover:text-white transition-colors">
                Inventory
              </Link>
              <Link href="/contracts" className="hover:text-white transition-colors">
                Contracts
              </Link>
              <Link href="/portal" className="hover:text-white transition-colors">
                Buyer Portal
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} BetFlow S.C. All rights reserved.</p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (NestJS + Prisma + PostgreSQL)</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
