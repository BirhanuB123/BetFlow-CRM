import { Upload } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  documentMetrics,
  documentStatusClass,
  uploadedDocuments,
} from "@/features/contracts/document-data";

export default function DocumentsPage() {
  return (
    <DashboardShell
      title="Documents"
      description="Upload, classify, and verify customer and contract files."
      active="Documents"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {documentMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Document upload</h2>
            <p className="text-sm text-zinc-500">Files linked to customers, reservations, and payments.</p>
          </div>
          <Button>
            <Upload className="size-4" />
            Upload document
          </Button>
        </div>
        <CrmTable
          columns={["Document", "Category", "Related to", "Uploaded by", "Uploaded", "Status"]}
          rows={uploadedDocuments.map((document) => [
            <span key="name" className="font-medium">{document.name}</span>,
            document.category,
            document.relatedTo,
            document.uploadedBy,
            document.uploadedAt,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${documentStatusClass[document.status]}`}>
              {document.status}
            </span>,
          ])}
        />
      </section>
    </DashboardShell>
  );
}
