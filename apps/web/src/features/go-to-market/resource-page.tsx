import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { resourceStatusClass, type ResourcePage } from "./go-to-market-data";

type ResourceContentPageProps = {
  page: ResourcePage;
};

export function ResourceContentPage({ page }: ResourceContentPageProps) {
  const Icon = page.icon;

  return (
    <DashboardShell
      title={page.title}
      description={page.description}
      active={page.active}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {page.metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center gap-3 border-b border-zinc-200 p-4">
          <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Resource outline</h2>
            <p className="text-sm text-zinc-500">
              Ownership, readiness, and included material.
            </p>
          </div>
        </div>
        <CrmTable
          columns={["Section", "Owner", "Status", "Included items"]}
          rows={page.sections.map((section) => [
            <span key="title" className="font-medium">
              {section.title}
            </span>,
            section.owner,
            <span
              key="status"
              className={`rounded-md px-2 py-1 text-xs font-medium ${resourceStatusClass[section.status]}`}
            >
              {section.status}
            </span>,
            section.items.join(", "),
          ])}
        />
      </section>
    </DashboardShell>
  );
}
