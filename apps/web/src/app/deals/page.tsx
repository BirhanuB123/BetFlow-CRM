import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PipelineBoard } from "@/components/tables/pipeline-board";
import { CrmTable } from "@/components/tables/crm-table";
import { deals } from "@/features/leads/crm-data";

export default function DealsPage() {
  return (
    <DashboardShell
      title="Deals"
      description="Pipeline board and deal economics."
      active="Deals"
    >
      <PipelineBoard />

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Deal list</h2>
          <p className="text-sm text-zinc-500">Forecast view across active opportunities.</p>
        </div>
        <CrmTable
          columns={["Customer", "Property", "Value", "Stage", "Probability", "Close date", "Owner"]}
          rows={deals.map((deal) => [
            deal.customer,
            deal.property,
            deal.value,
            deal.stage,
            `${deal.probability}%`,
            deal.closeDate,
            deal.owner,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
