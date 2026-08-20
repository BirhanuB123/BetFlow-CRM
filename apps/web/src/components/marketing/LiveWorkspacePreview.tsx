"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { formatCurrency } from "@/lib/currency";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Database,
  RefreshCw,
  UserRoundCheck,
  Grid,
  CircleDollarSign,
  CalendarDays,
  Coins,
} from "lucide-react";
import {
  demoLeads,
  demoUnits,
  demoStacking,
  demoDeals,
  demoForecast,
  demoVisits,
  demoSchedules,
  type LeadItem,
  type UnitItem,
  type StackingBuilding,
  type DealItem,
  type ForecastStage,
  type SiteVisitItem,
  type PaymentScheduleItem,
} from "@/features/go-to-market/demo-preview-data";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type LiveWorkspacePreviewProps = {
  activeTab: "leads" | "units" | "pipeline" | "visits" | "payments";
  onTabChange: (tab: "leads" | "units" | "pipeline" | "visits" | "payments") => void;
};

export function LiveWorkspacePreview({ activeTab, onTabChange }: LiveWorkspacePreviewProps) {
  const [loadingDb, setLoadingDb] = useState(false);
  const [realLeads, setRealLeads] = useState<LeadItem[]>(demoLeads);
  const [realUnits, setRealUnits] = useState<UnitItem[]>(demoUnits);
  const [realDeals, setRealDeals] = useState<DealItem[]>(demoDeals);
  const [realForecast] = useState<typeof demoForecast>(demoForecast);
  const [realVisits, setRealVisits] = useState<SiteVisitItem[]>(demoVisits);
  const [realSchedules, setRealSchedules] = useState<PaymentScheduleItem[]>(demoSchedules);

  const resetPreviewData = useCallback(async () => {
    setLoadingDb(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setRealLeads([...demoLeads]);
    setRealUnits([...demoUnits]);
    setRealDeals([...demoDeals]);
    setRealVisits([...demoVisits]);
    setRealSchedules([...demoSchedules]);
    setLoadingDb(false);
  }, []);

  return (
    <section id="workspace-preview" className="py-16 bg-slate-950 border-t border-b border-slate-800 text-white relative z-20">
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
                <span>betflow-crm.app — Interactive Demo Workspace Sandbox</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                Interactive Demo Records
              </span>
              <button
                type="button"
                onClick={() => void resetPreviewData()}
                disabled={loadingDb}
                className="ml-2 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`size-3 text-indigo-400 ${loadingDb ? "animate-spin" : ""}`}
                />
                <span>{loadingDb ? "Syncing..." : "Reset Preview"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Tabs Header */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4 mb-6">
            {[
              {
                id: "leads" as const,
                label: "Lead Intake Engine",
                icon: UserRoundCheck,
                count: realLeads.length,
              },
              {
                id: "units" as const,
                label: "Unit Stacking Matrix",
                icon: Grid,
                count: realUnits.length,
              },
              {
                id: "pipeline" as const,
                label: "Sales Kanban Pipeline",
                icon: CircleDollarSign,
                count: realDeals.length,
              },
              {
                id: "visits" as const,
                label: "Site Visit Scheduler",
                icon: CalendarDays,
                count: realVisits.length,
              },
              {
                id: "payments" as const,
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
                  onClick={() => onTabChange(tab.id)}
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
            {/* TAB 1: LEADS */}
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
                          href="/pipeline?tab=leads"
                          className="text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
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

                <div className="grid gap-3 sm:grid-cols-3">
                  {realUnits.slice(0, 6).map((unit) => (
                    <div
                      key={unit.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-black text-purple-300 border border-purple-500/30">
                            Unit {unit.unitNumber}
                          </span>
                          <StatusPill status={unit.status} size="sm" />
                        </div>
                        <p className="text-xs font-semibold text-slate-300 mt-2 truncate">
                          {unit.type}
                        </p>
                        <p className="text-sm font-black text-emerald-400 mt-1">
                          {formatCurrency(unit.price)}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>{unit.area ? `${unit.area} sqm` : "Standard Floorplan"}</span>
                        <Link
                          href="/units"
                          className="text-purple-400 hover:text-purple-300 font-bold"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PIPELINE */}
            {activeTab === "pipeline" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CircleDollarSign className="size-4 text-emerald-400" />
                      Sales Opportunity Pipeline (Forecast Matrix)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Live deal stages, probability weightings, and revenue forecasts.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                    RAW PIPELINE (
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
                          href="/pipeline?tab=deals"
                          className="text-slate-400 hover:text-white font-bold"
                        >
                          Kanban →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
