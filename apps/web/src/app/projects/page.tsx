import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { projects } from "@/features/properties/inventory-data";

export default function ProjectsPage() {
  const totalUnits = projects.reduce((sum, project) => sum + project.units, 0);
  const availableUnits = projects.reduce((sum, project) => sum + project.availableUnits, 0);

  return (
    <DashboardShell
      title="Projects"
      description="Portfolio-level inventory across active developments."
      active="Projects"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Projects" value={String(projects.length)} detail="Across sales and planning" />
        <StatCard label="Total units" value={String(totalUnits)} detail="Residential and commercial" />
        <StatCard label="Available units" value={String(availableUnits)} detail="Open for offer or reservation" />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Project inventory</h2>
            <p className="text-sm text-zinc-500">Availability, status, and revenue potential.</p>
          </div>
          <Button>New project</Button>
        </div>
        <CrmTable
          columns={["Project", "Location", "Status", "Buildings", "Units", "Available", "Potential"]}
          rows={projects.map((project) => [
            <span key="project" className="font-medium">{project.name}</span>,
            project.location,
            <span key="status" className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">{project.status}</span>,
            project.buildings,
            project.units,
            project.availableUnits,
            project.revenuePotential,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
