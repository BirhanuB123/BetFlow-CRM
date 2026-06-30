import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { customers } from "@/features/leads/crm-data";

export default function CustomersPage() {
  return (
    <DashboardShell
      title="Customers"
      description="Converted relationships and account ownership."
      active="Customers"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Customer accounts</h2>
            <p className="text-sm text-zinc-500">Buyer, investor, and tenant records.</p>
          </div>
          <Button variant="outline">Import</Button>
        </div>
        <CrmTable
          columns={["Customer", "Type", "Owner", "Value", "Status", "Phone"]}
          rows={customers.map((customer) => [
            <div key="customer">
              <p className="font-medium">{customer.name}</p>
              <p className="text-zinc-500">{customer.email}</p>
            </div>,
            customer.type,
            customer.owner,
            customer.lifetimeValue,
            <span key="status" className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
              {customer.status}
            </span>,
            customer.phone,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
