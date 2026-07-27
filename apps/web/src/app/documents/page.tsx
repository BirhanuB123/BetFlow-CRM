"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Download, FileText, Trash2, Upload, X, Search, Eye, Filter, Sparkles, FolderOpen, Tag, Calendar, UserCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
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
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border border-amber-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
  EXPIRED: "bg-slate-100 text-slate-700 border border-slate-200",
};

const inputClass = "h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500 font-medium";

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
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<DocumentStatus | "ALL">("ALL");
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
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
    const t = setTimeout(() => { void load(); });
    return () => clearTimeout(t);
  }, [load]);

  const visibleDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (filter !== "ALL" && doc.status !== filter) return false;
      if (search.trim()) {
        const term = search.trim().toLowerCase();
        const nameMatch = doc.name.toLowerCase().includes(term);
        const catMatch = doc.category.toLowerCase().includes(term);
        return nameMatch || catMatch;
      }
      return true;
    });
  }, [documents, filter, search]);

  const pending = documents.filter((d) => d.status === "PENDING_REVIEW").length;
  const verified = documents.filter((d) => d.status === "VERIFIED").length;
  const rejected = documents.filter((d) => d.status === "REJECTED").length;

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.file || !form.entityId) {
      setError("Please select a file and the CRM record it belongs to.");
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

  const download = async (doc: DocumentRecord) => {
    try {
      const blob = await apiDownload(`/documents/${doc.id}/download`);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = doc.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document download failed");
    }
  };

  const review = async (id: string, status: "VERIFIED" | "REJECTED") => {
    const rejectionReason = status === "REJECTED" ? window.prompt("Reason for rejecting this document:") : undefined;
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
    <DashboardShell
      title="Document Management Center"
      description="Securely upload, store, categorize, and verify real estate contracts, KYC records, payment receipts, and floor plans."
      active="Documents"
    >
      <div className="space-y-6">
        {/* Toolbar Header */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-slate-500 sm:w-80">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              aria-label="Search documents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by name or category…"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <Button onClick={() => setShowUpload((value) => !value)} className="h-9 text-xs font-semibold">
            {showUpload ? <X className="size-4 mr-1.5" /> : <Upload className="size-4 mr-1.5" />}
            {showUpload ? "Cancel" : "Upload New Document"}
          </Button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <form onSubmit={upload} className="grid gap-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Select Document File *</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className={inputClass} onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} required />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Document Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Link to Entity</label>
              <select className={inputClass} value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value as EntityType, entityId: "" })}>
                <option value="CUSTOMER">Customer Contact</option>
                <option value="RESERVATION">Reservation</option>
                <option value="CONTRACT">Contract</option>
                <option value="PAYMENT">Payment Receipt</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Related Record *</label>
              <select required className={inputClass} value={form.entityId} onChange={(e) => setForm({ ...form, entityId: e.target.value })}>
                <option value="">Select related record…</option>
                {options[form.entityType].map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>

            <div className="xl:col-span-4 flex items-center justify-between border-t border-indigo-100 pt-3">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                Expiry Date (Optional):
                <input type="date" className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </label>
              <Button type="submit" disabled={saving} className="h-9 text-xs font-semibold">
                {saving ? "Uploading File…" : "Upload & Submit for Review"}
              </Button>
            </div>
          </form>
        )}

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">{error}</p>}

        {/* Repository Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50/70 p-3">
            {(["ALL", "PENDING_REVIEW", "VERIFIED", "REJECTED", "EXPIRED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === st
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100",
                )}
              >
                {st === "ALL" ? "All Documents" : st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="p-8 text-center text-xs text-slate-500 font-medium">Loading document library…</p>
          ) : visibleDocuments.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500 font-medium">No documents match your filter.</p>
          ) : (
            <CrmTable
              columns={["Document Name", "Category", "Related Record", "Uploaded Date", "Status", "Actions"]}
              rows={visibleDocuments.map((doc) => [
                <div key="name" className="flex items-center gap-2">
                  <FileText className="size-4 text-indigo-500 shrink-0" />
                  <button type="button" onClick={() => setPreviewDoc(doc)} className="font-bold text-indigo-600 hover:underline text-xs text-left">
                    {doc.name}
                    <span className="font-normal text-slate-400 block text-[11px]">{documentSize(doc.sizeBytes)}</span>
                  </button>
                </div>,
                <span key="cat" className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {doc.category.replace(/_/g, " ")}
                </span>,
                `${doc.entityType.replace(/_/g, " ")} · ${doc.entityId.slice(0, 8)}`,
                <span key="uploaded" className="text-xs font-medium text-slate-600">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                  <span className="block text-[11px] text-slate-400">{doc.uploadedBy?.name ?? "System"}</span>
                </span>,
                <span key="status" className={cn("rounded-md px-2 py-1 text-xs font-bold", statusClass[doc.status])} title={doc.rejectionReason ?? undefined}>
                  {doc.status.replace(/_/g, " ")}
                </span>,
                <div key="actions" className="flex items-center gap-1">
                  <button type="button" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setPreviewDoc(doc)} title="Quick Preview">
                    <Eye className="size-4 text-indigo-600" />
                  </button>
                  <button type="button" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => void download(doc)} title="Download file">
                    <Download className="size-4 text-slate-600" />
                  </button>
                  {doc.status === "PENDING_REVIEW" && (
                    <>
                      <button type="button" className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50" onClick={() => void review(doc.id, "VERIFIED")} title="Approve & Verify">
                        <Check className="size-4" />
                      </button>
                      <button type="button" className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50" onClick={() => void review(doc.id, "REJECTED")} title="Reject">
                        <X className="size-4" />
                      </button>
                    </>
                  )}
                  <button type="button" className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50" onClick={() => void remove(doc.id)} title="Delete document">
                    <Trash2 className="size-4" />
                  </button>
                </div>,
              ])}
            />
          )}
        </section>

        {/* Document Preview Drawer / Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{previewDoc.name}</h3>
                    <p className="text-xs text-slate-500">{documentSize(previewDoc.sizeBytes)} · {previewDoc.category}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setPreviewDoc(null)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                  <X className="size-4" />
                </button>
              </div>

              <div className="my-4 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Document Status:</span>
                  <span className={cn("font-bold px-2 py-0.5 rounded text-[11px]", statusClass[previewDoc.status])}>{previewDoc.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Linked Entity:</span>
                  <span className="font-semibold text-slate-800">{previewDoc.entityType} ({previewDoc.entityId.slice(0, 8)})</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Uploaded On:</span>
                  <span className="font-medium">{new Date(previewDoc.uploadedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Uploaded By:</span>
                  <span className="font-medium">{previewDoc.uploadedBy?.name ?? "System"}</span>
                </div>
                {previewDoc.rejectionReason && (
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700 mt-2">
                    <span className="font-bold block">Rejection Reason:</span>
                    {previewDoc.rejectionReason}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => void download(previewDoc)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-xs font-semibold">
                  <Download className="size-3.5 mr-1.5" />
                  Download File
                </Button>
                <Button variant="outline" onClick={() => setPreviewDoc(null)} className="h-9 text-xs font-semibold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

