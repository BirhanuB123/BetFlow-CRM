"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo, Suspense } from "react";
import { UserRoundCheck, UsersRound, CircleDollarSign } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LeadsView } from "@/components/views/leads-view";
import { CustomersView } from "@/components/views/customers-view";
import { DealsView } from "@/components/views/deals-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

type TabKey = "leads" | "customers" | "deals";

function PipelineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const activeTab: TabKey = useMemo(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "customers") return "customers";
    if (tabParam === "deals") return "deals";
    return "leads";
  }, [searchParams]);

  const setTab = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`/pipeline?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4">
      {/* Shared Header Chrome & Tab Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("leads")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "leads"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            <UserRoundCheck className="size-4" />
            {t("pipeline.tabLeads")}
          </button>

          <button
            type="button"
            onClick={() => setTab("customers")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "customers"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            <UsersRound className="size-4" />
            {t("pipeline.tabCustomers")}
          </button>

          <button
            type="button"
            onClick={() => setTab("deals")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "deals"
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            <CircleDollarSign className="size-4" />
            {t("pipeline.tabDeals")}
          </button>
        </div>
      </div>

      {/* Render Active View Component */}
      {activeTab === "leads" && <LeadsView />}
      {activeTab === "customers" && <CustomersView />}
      {activeTab === "deals" && <DealsView />}
    </div>
  );
}

export default function PipelinePage() {
  const { t } = useTranslation();
  return (
    <DashboardShell
      title={t("pipeline.title")}
      description={t("pipeline.subtitle")}
      active="Pipeline"
    >
      <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading pipeline...</div>}>
        <PipelineContent />
      </Suspense>
    </DashboardShell>
  );
}
