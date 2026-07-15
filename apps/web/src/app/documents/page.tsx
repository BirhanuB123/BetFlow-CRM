"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Download, FileText, Trash2, Upload, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { apiDownload, apiFetch, apiUpload } from "@/lib/api";
import { cn } from "@/lib/utils";

type DocumentStatus = "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";
type DocumentRecord = {
  id: string;
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  category: string;
  status: DocumentStatus;
  entityType: string;
  entityId: string;
  uploadedAt: string;
  expiresAt: string | null;
  rejectionReason: string | null;
  uploadedBy: { id: string; name: string } | null;
  reviewedBy: { id: string; name: string } | null;
};

type Customer = { id: string; firstName: string; lastName: string };
type Reservation = { id: string; customer: Customer; unit: { unitNumber: string } };
type Contract = { id: string; customer: Customer; unit: { unitNumber: string } };
type Payment = { id: string; amount: string; date: string };
type EntityType = "CUSTOMER" | "RESERVATION" | "CONTRACT" | "PAYMENT";
type EntityOption = { id: string; label: string };

const CATEGORIES = ["ID", "KYC", "CONTRACT", "RECEIPT", "TITLE_DEED", "FLOOR_PLAN", "OTHER"];
const statusClass: Record<DocumentStatus, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};

const inputClass = "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400";

function documentSize(bytes: number | null) {
  if (bytes == null) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [options, setOptions] = useState<Record<EntityType, EntityOption[]>>({ CUSTOMER: [], RESERVATION: [], CONTRACT: [], PAYMENT: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<DocumentStatus | "ALL">("ALL");
  const [form, setForm] = useState({ file: null as File | null, category: "OTHER", entityType: "CUSTOMER" as EntityType, entityId: "", expiresAt: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [documentsData, customers, reservations, contracts, payments] = await Promise.all([
        apiFetch<DocumentRecord[]>("/documents"),
        apiFetch<Customer[]>("/customers"),
        apiFetch<Reservation[]>("/reservations"),
        apiFetch<Contract[]>("/contracts"),
        apiFetch<Payment[]>("/payments"),
      ]);
      setDocuments(documentsData);
      setOptions({
        CUSTOMER: customers.map((customer) => ({ id: customer.id, label: `${customer.firstName} ${customer.lastName}` })),
        RESERVATION: reservations.map((reservation) => ({ id: reservation.id, label: `${reservation.customer.firstName} ${reservation.customer.lastName} · Unit ${reservation.unit.unitNumber}` })),
        CONTRACT: contracts.map((contract) => ({ id: contract.id, label: `${contract.customer.firstName} ${contract.customer.lastName} · Unit ${contract.unit.unitNumber}` })),
        PAYMENT: payments.map((payment) => ({ id: payment.id, label: `Payment ${payment.id.slice(0, 8)} · ${new Date(payment.date).toLocaleDateString()}` })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // defer load to avoid synchronous setState within effect
    const t = setTimeout(() => { void load(); });
    return () => clearTimeout(t);
  }, [load]);

  const visibleDocuments = useMemo(
    () => filter === "ALL" ? documents : documents.filter((document) => document.status === filter),
    [documents, filter],
  );
  const pending = documents.filter((document) => document.status === "PENDING_REVIEW").length;
  const verified = documents.filter((document) => document.status === "VERIFIED").length;
  const rejected = documents.filter((document) => document.status === "REJECTED").length;

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.file || !form.entityId) {
      setError("Choose a file and the CRM record it belongs to.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", form.file);
      body.set("category", form.category);
      body.set("entityType", form.entityType);
      body.set("entityId", form.entityId);
      if (form.expiresAt) body.set("expiresAt", form.expiresAt);
      await apiUpload<DocumentRecord>("/documents", body);
      setForm({ file: null, category: "OTHER", entityType: "CUSTOMER", entityId: "", expiresAt: "" });
      setShowUpload(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document upload failed");
    } finally {
      setSaving(false);
    }
  };

  const download = async (document: DocumentRecord) => {
    try {
      const blob = await apiDownload(`/documents/${document.id}/download`);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document download failed");
    }
  };

  const review = async (id: string, status: "VERIFIED" | "REJECTED") => {
    const rejectionReason = status === "REJECTED" ? window.prompt("Why is this document rejected?") : undefined;
    if (status === "REJECTED" && !rejectionReason?.trim()) return;
    try {
      await apiFetch(`/documents/${id}/review`, { method: "PATCH", body: JSON.stringify({ status, rejectionReason }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document review failed");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document deletion failed");
    }
  };

  return (
    <DashboardShell title="Documents" description="Securely upload, review, and retrieve customer and transaction files." active="Documents">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All documents" value={String(documents.length)} detail="Tenant document library" />
        <StatCard label="Pending review" value={String(pending)} detail="Needs verification" />
        <StatCard label="Verified" value={String(verified)} detail="Approved for use" />
        <StatCard label="Rejected" value={String(rejected)} detail="Requires replacement" />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Document library</h2>
            <p className="text-sm text-zinc-500">PDF, image, DOC, and DOCX files up to 20 MB.</p>
          </div>
          <Button onClick={() => setShowUpload((value) => !value)}>
            {showUpload ? <X className="size-4" /> : <Upload className="size-4" />}
            {showUpload ? "Cancel" : "Upload document"}
          </Button>
        </div>

        {showUpload && (
          <form onSubmit={upload} className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className={inputClass} onChange={(event) => setForm({ ...form, file: event.target.files?.[0] ?? null })} required />
            <select className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category.replace(/_/g, " ")}</option>)}
            </select>
            <select className={inputClass} value={form.entityType} onChange={(event) => setForm({ ...form, entityType: event.target.value as EntityType, entityId: "" })}>
              <option value="CUSTOMER">Customer</option><option value="RESERVATION">Reservation</option><option value="CONTRACT">Contract</option><option value="PAYMENT">Payment</option>
            </select>
            <select required className={inputClass} value={form.entityId} onChange={(event) => setForm({ ...form, entityId: event.target.value })}>
              <option value="">Select related {form.entityType.toLowerCase()}…</option>
              {options[form.entityType].map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <label className="grid gap-1 text-xs font-medium text-zinc-600">Expires on (optional)<input type="date" className={inputClass} value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} /></label>
            <div className="flex items-end xl:col-span-3"><Button type="submit" disabled={saving}>{saving ? "Uploading…" : "Upload and submit for review"}</Button></div>
          </form>
        )}

        {error && <p className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 px-4 py-3">
          {(["ALL", "PENDING_REVIEW", "VERIFIED", "REJECTED", "EXPIRED"] as const).map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", filter === status ? "bg-[#334cff] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}>{status === "ALL" ? "All" : status.replace(/_/g, " ")}</button>)}
        </div>

        {loading ? <p className="p-6 text-sm text-zinc-500">Loading documents…</p> : visibleDocuments.length === 0 ? <p className="p-8 text-center text-sm text-zinc-500">No documents match this filter.</p> : (
          <CrmTable columns={["Document", "Category", "Related to", "Uploaded", "Status", "Actions"]} rows={visibleDocuments.map((document) => [
            <button key="name" type="button" onClick={() => void download(document)} className="inline-flex items-center gap-2 font-medium text-[#334cff] hover:underline"><FileText className="size-4" />{document.name}<span className="font-normal text-zinc-400">({documentSize(document.sizeBytes)})</span></button>,
            document.category.replace(/_/g, " "),
            `${document.entityType.replace(/_/g, " ")} · ${document.entityId.slice(0, 8)}`,
            <span key="uploaded">{new Date(document.uploadedAt).toLocaleDateString()}<span className="block text-xs text-zinc-400">{document.uploadedBy?.name ?? "Unknown"}</span></span>,
            <span key="status" className={cn("rounded-md px-2 py-1 text-xs font-medium", statusClass[document.status])} title={document.rejectionReason ?? undefined}>{document.status.replace(/_/g, " ")}</span>,
            <div key="actions" className="flex items-center gap-1"><button type="button" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100" onClick={() => void download(document)} aria-label={`Download ${document.name}`}><Download className="size-4" /></button>{document.status === "PENDING_REVIEW" && <><button type="button" className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50" onClick={() => void review(document.id, "VERIFIED")} aria-label={`Verify ${document.name}`}><Check className="size-4" /></button><button type="button" className="rounded p-1.5 text-rose-600 hover:bg-rose-50" onClick={() => void review(document.id, "REJECTED")} aria-label={`Reject ${document.name}`}><X className="size-4" /></button></>}<button type="button" className="rounded p-1.5 text-rose-600 hover:bg-rose-50" onClick={() => void remove(document.id)} aria-label={`Delete ${document.name}`}><Trash2 className="size-4" /></button></div>,
          ])} />
        )}
      </section>
    </DashboardShell>
  );
}
