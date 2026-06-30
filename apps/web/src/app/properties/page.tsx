import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { buildings, floors, projects } from "@/features/properties/inventory-data";

export default function PropertiesPage() {
  return (
    <DashboardShell
      title="Properties"
      description="Buildings and floor release status by project."
      active="Properties"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Buildings</h2>
          <p className="text-sm text-zinc-500">Building-level inventory and availability.</p>
        </div>
        <CrmTable
          columns={["Building", "Project", "Address", "Status", "Floors", "Units", "Available"]}
          rows={buildings.map((building) => {
            const project = projects.find((item) => item.id === building.projectId);

            return [
              <span key="building" className="font-medium">{building.name}</span>,
              project?.name ?? "Unknown",
              building.address,
              <span key="status" className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">{building.status}</span>,
              building.floors,
              building.units,
              building.availableUnits,
            ];
          })}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Floors</h2>
          <p className="text-sm text-zinc-500">Release controls and availability by floor.</p>
        </div>
        <CrmTable
          columns={["Floor", "Building", "Release", "Units", "Available"]}
          rows={floors.map((floor) => {
            const building = buildings.find((item) => item.id === floor.buildingId);

            return [
              <span key="floor" className="font-medium">{floor.label}</span>,
              building?.name ?? "Unknown",
              <span key="release" className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">{floor.releaseStatus}</span>,
              floor.units,
              floor.availableUnits,
            ];
          })}
        />
      </section>
    </DashboardShell>
  );
}
