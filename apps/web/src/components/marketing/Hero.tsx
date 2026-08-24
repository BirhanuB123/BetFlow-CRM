"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/language-context";
import {
  ArrowRight,
  Check,
  UserRoundCheck,
  Grid,
  CircleDollarSign,
  CalendarDays,
  Coins,
  FileText,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";

type HeroProps = {
  selectedWorkflows: Record<string, boolean>;
  onToggleWorkflow: (key: string) => void;
};

export function Hero({ selectedWorkflows, onToggleWorkflow }: HeroProps) {
  const { t } = useTranslation();

  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Credibility & Live System Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary/80 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>{t("hero.badge")}</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 border-l border-slate-800 pl-3">
                <Building2 className="size-3.5 text-primary/80" />
                <span>Purpose-built CRM OS for real estate developers & brokerages</span>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              {t("hero.titleStart")}{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                {t("hero.titleBrand")}
              </span>
            </h1>

            {/* Qualitative Credibility Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              {t("hero.subtitle")}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-primary/80/90 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
              Empowering sales teams with real-time unit locks, automated legal PDF contracts, and milestone tracking.
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
                      onClick={() => onToggleWorkflow(tag.key)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        active
                          ? "border-primary bg-primary/30 text-primary-foreground/90 shadow-md shadow-primary/20"
                          : "border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span
                        className={`flex size-3.5 items-center justify-center rounded ${active ? "bg-primary text-white" : "bg-slate-800"}`}
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

            {/* Outcome-Oriented Action Buttons (Outcome copy naming what the user gets) */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-primary px-8 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="#workspace-preview"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/20 px-6 text-sm font-bold text-primary-foreground/90 hover:bg-primary/30 hover:text-white transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="size-4 text-primary/80" />
                <span>Explore Live Workspace</span>
              </Link>
            </div>

            {/* Security Disclaimer Banner (Safely scoped, zero exposed credentials) */}
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-xs text-slate-400 shadow-xs">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>
                No credit card required · Instant sandbox access with zero setup.
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-2xl overflow-hidden group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                {/* Note: FUB-style hero direction recommends a real human/agent photo (e.g. sales team, handshake, client closing) here long-term once verified assets exist. Using architectural tower render for now. */}
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
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors"
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
  );
}
