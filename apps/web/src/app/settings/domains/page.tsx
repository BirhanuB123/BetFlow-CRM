import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { customDomains, statusClass } from "@/features/settings/saas-data";

export default function DomainsPage() {
  return (
    <DashboardShell
      title="Custom domain"
      description="Tenant domain routing, DNS verification, and SSL status."
      active="Domains"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Verified domains" value="1" detail="Production traffic is routable" />
        <StatCard label="Pending DNS" value="2" detail="CNAME records required" />
        <StatCard label="SSL certificates" value="1/3" detail="Certificates issue after DNS verification" />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Domains</h2>
            <p className="text-sm text-zinc-500">CNAME targets and certificate state.</p>
          </div>
          <Button>Add domain</Button>
        </div>
        <CrmTable
          columns={["Domain", "Target", "DNS", "SSL"]}
          rows={customDomains.map((domain) => [
            <span key="domain" className="font-medium">{domain.domain}</span>,
            domain.target,
            <span key="dns" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[domain.status]}`}>
              {domain.status}
            </span>,
            <span key="ssl" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[domain.ssl]}`}>
              {domain.ssl}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
