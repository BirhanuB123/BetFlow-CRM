"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SocialBroadcastsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/campaigns?tab=social");
  }, [router]);

  return (
    <DashboardShell
      title="Redirecting to Campaigns…"
      description="Redirecting to the unified Marketing & Automation campaigns module"
    >
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
        <p className="text-xs font-semibold text-slate-500">
          Redirecting to Social Outreach Campaigns…
        </p>
      </div>
    </DashboardShell>
  );
}
