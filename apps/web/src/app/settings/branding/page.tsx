import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { brandingSettings, statusClass } from "@/features/settings/saas-data";

export default function BrandingPage() {
  return (
    <DashboardShell
      title="Custom branding"
      description="Tenant-specific visual identity and login experience."
      active="Branding"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="White-label status" value="Enabled" detail="Tenant logo, colors, portal, and sender identity" />
        <StatCard label="Brand assets" value="6" detail="Logo, favicon, palette, login, portal, email" />
        <StatCard label="Draft changes" value="3" detail="Require publish before customer portal launch" />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Brand settings</h2>
            <p className="text-sm text-zinc-500">Workspace labels, logo, colors, and login copy.</p>
          </div>
          <Button>Publish changes</Button>
        </div>
        <CrmTable
          columns={["Setting", "Value", "Status"]}
          rows={brandingSettings.map((setting) => [
            <span key="label" className="font-medium">{setting.label}</span>,
            setting.value,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[setting.status]}`}>
              {setting.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
