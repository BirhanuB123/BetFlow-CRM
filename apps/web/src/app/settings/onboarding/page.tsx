import { ClipboardCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { onboardingSteps, statusClass } from "@/features/settings/saas-data";

export default function OnboardingPage() {
  const completed = onboardingSteps.filter((step) => step.status === "Complete").length;

  return (
    <DashboardShell
      title="Tenant onboarding wizard"
      description="Guided tenant setup for users, roles, domains, branding, imports, and automation."
      active="Onboarding"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Progress" value={`${completed}/${onboardingSteps.length}`} detail="Required onboarding steps complete" />
        <StatCard label="Blocked items" value="1" detail="Needs DNS verification" />
        <StatCard label="Target go-live" value="Jul 5" detail="Customer portal and automations" />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Wizard steps</h2>
            <p className="text-sm text-zinc-500">Setup checklist with owners, due dates, and blockers.</p>
          </div>
          <Button>
            <ClipboardCheck className="size-4" />
            Continue setup
          </Button>
        </div>
        <CrmTable
          columns={["Step", "Owner", "Due", "Status"]}
          rows={onboardingSteps.map((step) => [
            <span key="step" className="font-medium">{step.step}</span>,
            step.owner,
            step.due,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[step.status]}`}>
              {step.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
