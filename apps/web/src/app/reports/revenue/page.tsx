import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { revenueReport } from "@/features/reports/reporting-data";

export default function RevenueReportPage() {
  return (
    <DashboardShell
      title="Revenue report"
      description="Booked, collected, outstanding, and forecast revenue."
      active="Revenue"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Revenue by period</h2>
          <p className="text-sm text-zinc-500">Monthly commercial outlook from reservations and contracts.</p>
        </div>
        <CrmTable
          columns={["Period", "Booked", "Collected", "Outstanding", "Forecast"]}
          rows={revenueReport.map((row) => [
            <span key="period" className="font-medium">{row.period}</span>,
            row.booked,
            row.collected,
            row.outstanding,
            row.forecast,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
