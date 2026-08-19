"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Megaphone, MessageSquare, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SocialOutreachView } from "@/components/views/social-outreach-view";
import { SmsAutomationView } from "@/components/views/sms-automation-view";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

type CampaignTab = "social" | "sms";

function CampaignsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasModulePermission, loaded } = usePermissions();

  const canAccessCampaigns = useMemo(() => {
    return hasModulePermission("Marketing & Automation");
  }, [hasModulePermission]);

  const activeTab: CampaignTab = useMemo(() => {
    const raw = searchParams.get("tab")?.toLowerCase();
    if (raw === "sms") return "sms";
    return "social";
  }, [searchParams]);

  const setTab = (tab: CampaignTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/campaigns?${params.toString()}`);
  };

  if (loaded && !canAccessCampaigns) {
    return (
      <DashboardShell
        title="Campaigns & Marketing Automation"
        description="Broadcast outreach and automated SMS buyer nurture campaigns"
        active="Campaigns"
      >
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            Access Restricted
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            You do not have permission to view or manage marketing campaigns.
            Please contact your workspace administrator to request access to the
            Marketing & Automation module.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Campaigns & Marketing Automation"
      description="Manage Telegram broadcasts, Meta lead form outreach, Ethio Telecom bulk SMS, and automated buyer drip sequences."
      active="Campaigns"
    >
      <div className="space-y-6">
        {/* Module Tab Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab("social")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all cursor-pointer",
                activeTab === "social"
                  ? "border-[#233b66] text-[#233b66]"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              )}
            >
              <Megaphone className="size-4" />
              <span>Social & Channel Outreach</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("sms")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all cursor-pointer",
                activeTab === "sms"
                  ? "border-[#233b66] text-[#233b66]"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              )}
            >
              <MessageSquare className="size-4" />
              <span>SMS & Drip Automation</span>
            </button>
          </div>
        </div>

        {/* Tab View Component */}
        <div>
          {activeTab === "social" && <SocialOutreachView />}
          {activeTab === "sms" && <SmsAutomationView />}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell
          title="Campaigns & Marketing Automation"
          description="Manage Telegram broadcasts, Meta lead form outreach, Ethio Telecom bulk SMS, and automated buyer drip sequences."
          active="Campaigns"
        >
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-xs font-medium text-slate-400">Loading campaigns module…</p>
          </div>
        </DashboardShell>
      }
    >
      <CampaignsPageContent />
    </Suspense>
  );
}
