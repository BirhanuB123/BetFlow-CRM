import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { conversionReport } from "@/features/reports/reporting-data";

export default function ConversionReportPage() {
  return (
    <DashboardShell
      title="Conversion report"
      description="Lead funnel conversion from capture through contract signature."
      active="Sales report"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Conversion funnel</h2>
          <p className="text-sm text-zinc-500">Stage progression and drop-off rates.</p>
        </div>
        <CrmTable
          columns={["Stage", "Count", "Rate", "Drop-off"]}
          rows={conversionReport.map((row) => [
            <span key="stage" className="font-medium">{row.stage}</span>,
            row.count,
            row.rate,
            row.dropOff,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
