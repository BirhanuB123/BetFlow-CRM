"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  CalendarDays,
  PhoneCall,
  Building2,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TasksView } from "@/components/views/tasks-view";
import { MeetingsView } from "@/components/views/meetings-view";
import { CallsView } from "@/components/views/calls-view";
import { SiteVisitsView } from "@/components/views/site-visits-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

type ActivityTab = "tasks" | "meetings" | "calls" | "site-visits";

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const currentTab = (searchParams.get("tab") as ActivityTab) || "tasks";

  const handleTabChange = (tab: ActivityTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/activities?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Tab Bar Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-4 pt-2 shadow-2xs rounded-xl overflow-x-auto">
        <button
          onClick={() => handleTabChange("tasks")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap",
            currentTab === "tasks"
              ? "border-[#233b66] text-[#233b66]"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
          )}
        >
          <ClipboardList className="size-4" />
          <span>{t("activities.tabTasks")}</span>
        </button>

        <button
          onClick={() => handleTabChange("meetings")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap",
            currentTab === "meetings"
              ? "border-[#233b66] text-[#233b66]"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
          )}
        >
          <CalendarDays className="size-4" />
          <span>{t("activities.tabMeetings")}</span>
        </button>

        <button
          onClick={() => handleTabChange("calls")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap",
            currentTab === "calls"
              ? "border-[#233b66] text-[#233b66]"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
          )}
        >
          <PhoneCall className="size-4" />
          <span>{t("activities.tabCalls")}</span>
        </button>

        <button
          onClick={() => handleTabChange("site-visits")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap",
            currentTab === "site-visits"
              ? "border-[#233b66] text-[#233b66]"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
          )}
        >
          <Building2 className="size-4" />
          <span>{t("activities.tabSiteVisits")}</span>
        </button>
      </div>

      {/* Tab View Content */}
      <div className="transition-all duration-150">
        {currentTab === "tasks" && <TasksView />}
        {currentTab === "meetings" && <MeetingsView />}
        {currentTab === "calls" && <CallsView />}
        {currentTab === "site-visits" && <SiteVisitsView />}
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { t } = useTranslation();
  return (
    <DashboardShell
      title={t("activities.title")}
      description={t("activities.subtitle")}
      active="Activities"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading activities…</div>}>
        <ActivitiesContent />
      </Suspense>
    </DashboardShell>
  );
}
