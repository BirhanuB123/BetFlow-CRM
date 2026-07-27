import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, ChartNoAxesCombined, ShieldCheck, Workflow, Sparkles, CheckCircle2, PhoneCall, Layers, KeyRound } from "lucide-react";

import { demoCredentials, landingMetrics, launchChecklist } from "@/features/go-to-market/go-to-market-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-zinc-950">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/betflow-mark.svg"
              alt="BetFlow"
              width={36}
              height={36}
              className="rounded-lg shadow-xs"
              priority
            />
            <span className="text-base font-bold text-slate-900 tracking-tight">BetFlow CRM</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <Link href="/leads" className="hover:text-indigo-600 transition-colors">Leads</Link>
            <Link href="/customers" className="hover:text-indigo-600 transition-colors">Contacts</Link>
            <Link href="/deals" className="hover:text-indigo-600 transition-colors">Deals</Link>
            <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
              Launch CRM Workspace
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 w-fit mb-4">
            <Sparkles className="size-3.5 text-indigo-600" />
            Enterprise Real Estate Sales Engine
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl leading-[1.15]">
            Manage Leads, Real Estate Inventory, Deals & Sales Contracts in One CRM.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            BetFlow CRM empowers real estate developers, brokers, and sales teams with an all-in-one platform for lead intake, unit hold reservations, payment schedules, and automated contracts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md transition-all">
              Go to Command Center
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/auth" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-xs">
              Demo Credentials
            </Link>
          </div>
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs font-medium text-indigo-950 flex items-center gap-3">
            <KeyRound className="size-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Demo Login:</strong> <span className="font-mono text-indigo-700">{demoCredentials.email}</span> / <span className="font-mono text-indigo-700">{demoCredentials.password}</span> (Tenant: {demoCredentials.tenant})
            </span>
          </div>
        </div>

        {/* Live Sales Command Preview Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="rounded-xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Live Sales Command Center</p>
                <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">$8.4M Active Pipeline</p>
              </div>
              <div className="rounded-xl bg-indigo-600/30 p-3 border border-indigo-400/30 backdrop-blur-xs">
                <ChartNoAxesCombined className="size-7 text-emerald-400" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Website Leads", count: "124 active" },
                { label: "Meta & Facebook", count: "89 qualified" },
                { label: "Site Visit Bookings", count: "18 scheduled" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                  <p className="text-[11px] font-medium text-indigo-200">{item.label}</p>
                  <p className="mt-1.5 text-base font-bold text-white">{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3.5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors">
              <Building2 className="size-5 text-indigo-600" />
              <p className="mt-2.5 text-sm font-bold text-slate-900">Inventory Hold System</p>
              <p className="mt-1 text-xs text-slate-500">Live floorplans, unit reservations, hold timers, and price calculators.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors">
              <Workflow className="size-5 text-indigo-600" />
              <p className="mt-2.5 text-sm font-bold text-slate-900">Sales Workflow Engine</p>
              <p className="mt-1 text-xs text-slate-500">Site visits, stage conversion, payment schedules, and sales contracts.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 md:col-span-2 hover:border-indigo-300 transition-colors">
              <ShieldCheck className="size-5 text-indigo-600" />
              <p className="mt-2.5 text-sm font-bold text-slate-900">Multi-Tenant SaaS Controls</p>
              <p className="mt-1 text-xs text-slate-500">Tenant-isolated database, role-based access, automated audit logs, and compliance verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {landingMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            System Readiness Checklist
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {launchChecklist.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-medium text-slate-700 flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-indigo-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

