"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
} from "lucide-react";

import { demoCredentials } from "@/features/go-to-market/go-to-market-data";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"leads" | "units" | "pipeline" | "visits" | "payments">("leads");

  // Workflow selectable tags state (monday.com style)
  const [selectedWorkflows, setSelectedWorkflows] = useState<Record<string, boolean>>({
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
    void navigator.clipboard.writeText(`${demoCredentials.email} / ${demoCredentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. monday.com Style Top Navbar */}
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
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">betflow</span>
              <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                Sales CRM
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-xs font-semibold text-slate-600 md:flex">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <Link href="/leads" className="hover:text-indigo-600 transition-colors">Lead Intake</Link>
            <Link href="/units" className="hover:text-indigo-600 transition-colors">Unit Stacking Plan</Link>
            <Link href="/deals" className="hover:text-indigo-600 transition-colors">Sales Kanban</Link>
            <Link href="/reports" className="hover:text-indigo-600 transition-colors">Print Engine</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyCreds}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-slate-400" />}
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

      {/* 2. monday.com Style Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-6">
            <Sparkles className="size-3.5 text-indigo-600" />
            <span>The #1 Real Estate Sales CRM for Ethiopia Developers & Agencies</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-[1.12]">
            Real estate sales grow faster with <span className="text-indigo-600 underline decoration-indigo-300 decoration-wavy underline-offset-8">BetFlow CRM</span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Manage buyer leads, property floor plans, unit hold reservations, payment schedules, and automated sales contracts — all in one visual workspace.
          </p>

          {/* Interactive "What would you like to manage?" Workflow Selector Tags */}
          <div className="mt-8 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select what you want to manage:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                { key: "leads", label: "Contact & Lead Intake", icon: UserRoundCheck },
                { key: "units", label: "Unit Elevation Matrix", icon: Grid },
                { key: "pipeline", label: "Deals & Sales Pipelines", icon: CircleDollarSign },
                { key: "visits", label: "Site Visits & Meetings", icon: CalendarDays },
                { key: "payments", label: "Payment Schedules", icon: Coins },
                { key: "contracts", label: "Automated Contracts", icon: FileText },
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
                    <span className={`flex size-4 items-center justify-center rounded ${active ? "bg-white/20" : "bg-slate-100"}`}>
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
              <strong>Quick Login:</strong> <span className="font-mono text-indigo-700 font-bold">{demoCredentials.email}</span> / <span className="font-mono text-indigo-700 font-bold">{demoCredentials.password}</span>
            </span>
          </div>
        </div>

        {/* 3. Interactive Tabbed Product Feature Showcase Container (monday.com style) */}
        <div className="mt-14 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 sm:p-6 overflow-hidden">
            {/* Interactive Tabs Header */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-4 mb-6">
              {[
                { id: "leads", label: "Lead Intake Engine", icon: UserRoundCheck },
                { id: "units", label: "Unit Elevation Matrix", icon: Grid },
                { id: "pipeline", label: "Sales Kanban Pipeline", icon: CircleDollarSign },
                { id: "visits", label: "Site Visit Scheduler", icon: CalendarDays },
                { id: "payments", label: "Payment Milestone Tracking", icon: Coins },
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
                    <Icon className={`size-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Preview Display */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 text-white p-5 sm:p-6 min-h-[340px]">
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserRoundCheck className="size-4 text-indigo-400" />
                        Buyer Lead Intake & Automated Conversion
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Filter by source (*Meta Ads, Telegram, Website, Referrals*) and convert to deals in 1 click.</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      LIVE INTAKE
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Abebe Kebede</p>
                      <p className="text-xs font-extrabold text-white mt-1">2-Bed Apartment · Bole</p>
                      <span className="inline-block mt-2 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                        NEW LEAD
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tigist Alemu</p>
                      <p className="text-xs font-extrabold text-white mt-1">3-Bed Penthouse · Kazanchis</p>
                      <span className="inline-block mt-2 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        SITE VISIT SCHEDULED
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Dawit Haile</p>
                      <p className="text-xs font-extrabold text-white mt-1">Commercial Space · CMC</p>
                      <span className="inline-block mt-2 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        CONTRACT SIGNED
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "units" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Grid className="size-4 text-purple-400" />
                        Harbor Point Tower · Interactive Stacking Elevation Plan
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Real-time inventory grid with 1-click status toggles and 14-day hold timers.</p>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                      INVENTORY MATRIX
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { floor: "Floor 12", units: [{ id: "1201", type: "3-Bed", status: "SOLD", color: "bg-rose-950/80 border-rose-800 text-rose-300" }, { id: "1202", type: "Penthouse", status: "RESERVED", color: "bg-amber-950/80 border-amber-800 text-amber-300" }, { id: "1203", type: "2-Bed", status: "AVAILABLE", color: "bg-emerald-950/80 border-emerald-800 text-emerald-300" }] },
                      { floor: "Floor 11", units: [{ id: "1101", type: "2-Bed", status: "AVAILABLE", color: "bg-emerald-950/80 border-emerald-800 text-emerald-300" }, { id: "1102", type: "3-Bed", status: "AVAILABLE", color: "bg-emerald-950/80 border-emerald-800 text-emerald-300" }, { id: "1103", type: "1-Bed", status: "SOLD", color: "bg-rose-950/80 border-rose-800 text-rose-300" }] },
                    ].map((r) => (
                      <div key={r.floor} className="flex items-center gap-3">
                        <span className="w-20 text-xs font-bold text-slate-400">{r.floor}</span>
                        <div className="grid flex-1 grid-cols-3 gap-2">
                          {r.units.map((u) => (
                            <div key={u.id} className={`rounded-lg border p-2.5 text-center text-xs font-bold ${u.color}`}>
                              <div>Unit {u.id} ({u.type})</div>
                              <div className="text-[10px] font-semibold mt-0.5">{u.status}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "pipeline" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-emerald-400" />
                        Opportunity Kanban Pipeline & Weighted Revenue Forecast
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop stage movement with stage probabilities (*ETB 156.8M total active pipeline*).</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      PIPELINE VALUATION
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="font-bold text-indigo-400 uppercase text-[10px]">Proposal Stage (40%)</p>
                      <p className="font-extrabold text-white mt-1">ETB 45.0M</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">6 Active Deals</p>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="font-bold text-amber-400 uppercase text-[10px]">Reservation Deposit (80%)</p>
                      <p className="font-extrabold text-white mt-1">ETB 62.5M</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">4 Active Holds</p>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <p className="font-bold text-emerald-400 uppercase text-[10px]">Contract Signed (100%)</p>
                      <p className="font-extrabold text-white mt-1">ETB 49.3M</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">3 Finalized Sales</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "visits" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CalendarDays className="size-4 text-sky-400" />
                        Site Visit Bookings & Property Intake
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Record buyer sqm preferences, floor levels, budget ETB, and facing directions.</p>
                    </div>
                    <span className="rounded-full bg-sky-500/20 px-2.5 py-1 text-[10px] font-bold text-sky-400 border border-sky-500/30">
                      APPOINTMENT LOGS
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white">Bole Tower Site Visit · Today 2:30 PM</span>
                      <span className="text-indigo-400 font-semibold">Agent: Birhanu B.</span>
                    </div>
                    <p className="text-slate-300">Client: <strong className="text-white">Kebede User</strong> · Preference: 140 sqm, Floor 8+, Budget ETB 12.5M</p>
                  </div>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Coins className="size-4 text-rose-400" />
                        Milestone Payment Schedule Engine
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Automated 30/20/20/20/10 milestone schedules (*Downpayment, Foundation, Structure, Finishing, Handover*).</p>
                    </div>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                      MILESTONE SCHEDULES
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-5 text-center text-xs">
                    {[
                      { step: "30%", name: "Downpayment", status: "COLLECTED" },
                      { step: "20%", name: "Foundation", status: "VERIFIED" },
                      { step: "20%", name: "Structure", status: "PENDING" },
                      { step: "20%", name: "Finishing", status: "UPCOMING" },
                      { step: "10%", name: "Handover", status: "UPCOMING" },
                    ].map((m) => (
                      <div key={m.name} className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                        <div className="font-extrabold text-indigo-400">{m.step}</div>
                        <div className="font-bold text-white text-[11px] mt-0.5">{m.name}</div>
                        <div className="text-[9px] font-semibold text-slate-400 mt-1">{m.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Proof Trust Section */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            Trusted by leading real estate developers and sales brokers across Ethiopia
          </p>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 items-center justify-center">
            {[
              { label: "250K+", text: "Deals & Leads Processed" },
              { label: "99.9%", text: "Inventory Accuracy" },
              { label: "42s", text: "Avg Lead Assignment" },
              { label: "4.8 / 5", text: "Customer Satisfaction" },
            ].map((stat) => (
              <div key={stat.text} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-2xl font-extrabold text-indigo-600">{stat.label}</p>
                <p className="text-xs font-medium text-slate-600 mt-1">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions (Accordion) */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Everything you need to know about setting up and running BetFlow CRM.
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

      {/* 6. monday.com Style Bottom Call to Action Banner */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Transform your real estate sales operations today
          </h2>
          <p className="mt-4 text-sm text-indigo-200 max-w-xl mx-auto font-normal">
            Join top property developers, brokers, and sales teams managing leads and inventory with BetFlow CRM.
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
            <Image src="/betflow-mark.svg" alt="BetFlow" width={20} height={20} />
            <span className="font-bold text-slate-300">BetFlow CRM</span>
            <span>· Enterprise Real Estate Sales Engine</span>
          </div>
          <p>© {new Date().getFullYear()} BetFlow CRM. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}



