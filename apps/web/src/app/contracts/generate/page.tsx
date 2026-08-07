import { FileOutput } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import {
  contractStatusClass,
  generatedPdfs,
} from "@/features/contracts/document-data";

export default function ContractGenerationPage() {
  return (
    <DashboardShell
      title="PDF generation"
      description="Generate customer-ready contract PDFs from approved templates."
      active="Contracts"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Generated PDFs</h2>
            <p className="text-sm text-zinc-500">
              Template output prepared for legal review or signature.
            </p>
          </div>
          <Button>
            <FileOutput className="size-4" />
            Generate PDF
          </Button>
        </div>
        <CrmTable
          columns={["Contract", "Customer", "Unit", "Generated", "Status"]}
          rows={generatedPdfs.map((pdf) => [
            <span key="contract" className="font-medium">
              {pdf.contract}
            </span>,
            pdf.customer,
            pdf.unit,
            pdf.generatedAt,
            <span
              key="status"
              className={`rounded-md px-2 py-1 text-xs font-medium ${contractStatusClass[pdf.status]}`}
            >
              {pdf.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
