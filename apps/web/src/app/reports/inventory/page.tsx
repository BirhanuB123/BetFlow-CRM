import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { inventoryReport } from "@/features/reports/reporting-data";

export default function InventoryReportPage() {
  return (
    <DashboardShell
      title="Inventory report"
      description="Availability, reservations, sales, and blocked stock by project."
      active="Inventory rpt"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Inventory position</h2>
          <p className="text-sm text-zinc-500">Unit status summary across active projects.</p>
        </div>
        <CrmTable
          columns={["Project", "Total", "Available", "Reserved", "Sold", "Blocked"]}
          rows={inventoryReport.map((row) => [
            <span key="project" className="font-medium">{row.project}</span>,
            row.totalUnits,
            row.available,
            row.reserved,
            row.sold,
            row.blocked,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
