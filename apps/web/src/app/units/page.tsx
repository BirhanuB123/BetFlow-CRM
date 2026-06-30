import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { buildings, floors, projects, statusClass, units } from "@/features/properties/inventory-data";

export default function UnitsPage() {
  return (
    <DashboardShell
      title="Units"
      description="Unit status, pricing, and availability controls."
      active="Units"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Unit availability</h2>
            <p className="text-sm text-zinc-500">Inventory status for sales and reservations.</p>
          </div>
          <Button variant="outline">Bulk update</Button>
        </div>
        <CrmTable
          columns={["Unit", "Project", "Building", "Floor", "Type", "Area", "Price", "Status", "Available from"]}
          rows={units.map((unit) => {
            const project = projects.find((item) => item.id === unit.projectId);
            const building = buildings.find((item) => item.id === unit.buildingId);
            const floor = floors.find((item) => item.id === unit.floorId);

            return [
              <span key="unit" className="font-medium">{unit.unitNumber}</span>,
              project?.name ?? "Unknown",
              building?.name ?? "Unknown",
              floor?.label ?? "Unknown",
              unit.type,
              `${unit.areaSqft.toLocaleString()} sqft`,
              unit.price,
              <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[unit.status]}`}>{unit.status}</span>,
              unit.availableFrom,
            ];
          })}
        />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {(["Available", "Reserved", "Sold", "Blocked"] as const).map((status) => {
          const count = units.filter((unit) => unit.status === status).length;

          return (
            <div key={status} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm font-medium text-zinc-500">{status}</p>
              <p className="mt-3 text-2xl font-semibold">{count}</p>
              <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClass[status]}`}>
                Unit status
              </span>
            </div>
          );
        })}
      </section>
    </DashboardShell>
  );
}
