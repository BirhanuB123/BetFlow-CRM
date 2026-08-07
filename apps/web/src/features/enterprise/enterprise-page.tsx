import { PlugZap } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  enterpriseStatusClass,
  integrationHealthClass,
  type EnterpriseCapability,
} from "./enterprise-data";

type EnterprisePageProps = {
  capability: EnterpriseCapability;
};

export function EnterprisePage({ capability }: EnterprisePageProps) {
  return (
    <DashboardShell
      title={capability.title}
      description={capability.description}
      active={capability.active}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {capability.metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
            <div>
              <h2 className="text-base font-semibold">Workflow readiness</h2>
              <p className="text-sm text-zinc-500">
                Operational steps, owners, status, and SLA coverage.
              </p>
            </div>
            <Button>
              <PlugZap className="size-4" />
              {capability.commandLabel}
            </Button>
          </div>
          <CrmTable
            columns={["Step", "Owner", "Status", "SLA"]}
            rows={capability.workflow.map((step) => [
              <span key="step" className="font-medium">
                {step.step}
              </span>,
              step.owner,
              <span
                key="status"
                className={`rounded-md px-2 py-1 text-xs font-medium ${enterpriseStatusClass[step.status]}`}
              >
                {step.status}
              </span>,
              step.sla,
            ])}
          />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-base font-semibold">Integration surface</h2>
            <p className="text-sm text-zinc-500">
              External channels, internal engines, and operational health.
            </p>
          </div>
          <div className="divide-y divide-zinc-200">
            {capability.integrations.map((integration) => (
              <div key={integration.name} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{integration.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {integration.type}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${integrationHealthClass[integration.health]}`}
                  >
                    {integration.health}
                  </span>
                </div>
                <p className="mt-3 text-sm text-zinc-500">
                  {integration.volume}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
