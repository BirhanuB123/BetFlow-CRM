import { Archive } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import {
  contractStatusClass,
  signedContracts,
} from "@/features/contracts/document-data";

export default function SignedContractsPage() {
  return (
    <DashboardShell
      title="Signed contract storage"
      description="Store, locate, and audit signed agreements."
      active="Contracts"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Signed contracts</h2>
            <p className="text-sm text-zinc-500">
              Final contract files with storage paths and signature state.
            </p>
          </div>
          <Button>
            <Archive className="size-4" />
            Store signed contract
          </Button>
        </div>
        <CrmTable
          columns={["Contract", "Customer", "Signed", "Storage", "Status"]}
          rows={signedContracts.map((contract) => [
            <span key="contract" className="font-medium">
              {contract.contract}
            </span>,
            contract.customer,
            contract.signedAt,
            contract.storage,
            <span
              key="status"
              className={`rounded-md px-2 py-1 text-xs font-medium ${contractStatusClass[contract.status]}`}
            >
              {contract.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
