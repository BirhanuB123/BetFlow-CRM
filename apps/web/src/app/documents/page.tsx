"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  Download,
  FileText,
  Trash2,
  Upload,
  X,
  Search,
  Eye,
  Filter,
  Sparkles,
  FolderOpen,
  Tag,
  Calendar,
  UserCheck,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiDownload, apiFetch, apiUpload } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import type { DocumentStatus, DocumentRecord } from "@betflow/shared";


type Customer = { id: string; firstName: string; lastName: string };
type Reservation = {
  id: string;
  customer: Customer;
  unit: { unitNumber: string };
};
type Contract = {
  id: string;
  customer: Customer;
  unit: { unitNumber: string };
};
type Payment = { id: string; amount: string; date: string };
type EntityType = "CUSTOMER" | "RESERVATION" | "CONTRACT" | "PAYMENT";
type EntityOption = { id: string; label: string };

const CATEGORIES = [
  "KEBELE_ID",
  "PASSPORT",
  "TIN_CERTIFICATE",
  "YELLOW_CARD",
  "FOREIGN_PASSPORT",
  "POWER_OF_ATTORNEY_MOFA",
  "ID",
  "KYC",
  "CONTRACT",
  "RECEIPT",
  "TITLE_DEED",
  "FLOOR_PLAN",
  "OTHER",
];
const statusClass: Record<DocumentStatus, string> = {
  PENDING_REVIEW: "bg-warning/10 text-warning border border-warning/20",
  VERIFIED: "bg-success/10 text-success border border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border border-destructive/20",
  EXPIRED: "bg-slate-100 text-slate-700 border border-slate-200",
};

const inputClass =
  "h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary font-medium";

type KycRequirement = {
  category: string;
  label: string;
  status: "VERIFIED" | "PENDING_REVIEW" | "EXPIRED" | "MISSING";
  document: DocumentRecord | null;
};

type KycStatusResult = {
  customerId: string;
  customerName: string;
  buyerType: "LOCAL" | "DIASPORA";
  isKycComplete: boolean;
  completionPercentage: number;
  verifiedCount: number;
  totalRequired: number;
  requirements: KycRequirement[];
};

function documentSize(bytes?: number | null) {
  if (bytes == null) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [options, setOptions] = useState<Record<EntityType, EntityOption[]>>({
    CUSTOMER: [],
    RESERVATION: [],
    CONTRACT: [],
    PAYMENT: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<DocumentStatus | "ALL">("ALL");
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [selectedKycCustomerId, setSelectedKycCustomerId] = useState<string>("");
  const [kycStatus, setKycStatus] = useState<KycStatusResult | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(false);

  const [form, setForm] = useState({
    file: null as File | null,
    category: "OTHER",
    entityType: "CUSTOMER" as EntityType,
    entityId: "",
    expiresAt: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [documentsData, customers, reservations, contracts, payments] =
        await Promise.all([
          apiFetch<DocumentRecord[]>("/documents"),
          apiFetch<Customer[]>("/customers"),
          apiFetch<Reservation[]>("/reservations"),
          apiFetch<Contract[]>("/contracts"),
          apiFetch<Payment[]>("/payments"),
        ]);
      setDocuments(documentsData);
      setOptions({
        CUSTOMER: customers.map((customer) => ({
          id: customer.id,
          label: `${customer.firstName} ${customer.lastName}`,
        })),
        RESERVATION: reservations.map((reservation) => ({
          id: reservation.id,
          label: `${reservation.customer.firstName} ${reservation.customer.lastName} · Unit ${reservation.unit.unitNumber}`,
        })),
        CONTRACT: contracts.map((contract) => ({
          id: contract.id,
          label: `${contract.customer.firstName} ${contract.customer.lastName} · Unit ${contract.unit.unitNumber}`,
        })),
        PAYMENT: payments.map((payment) => ({
          id: payment.id,
          label: `Payment ${payment.id.slice(0, 8)} · ${new Date(payment.date).toLocaleDateString()}`,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    });
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
      setForm({
        file: null,
        category: "OTHER",
        entityType: "CUSTOMER",
        entityId: "",
        expiresAt: "",
      });
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
    const rejectionReason =
      status === "REJECTED"
        ? window.prompt("Reason for rejecting this document:")
        : undefined;
    if (status === "REJECTED" && !rejectionReason?.trim()) return;
    try {
      await apiFetch(`/documents/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
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

  const fetchKycStatus = async (customerId: string) => {
    setSelectedKycCustomerId(customerId);
    if (!customerId) {
      setKycStatus(null);
      return;
    }
    setLoadingKyc(true);
    try {
      const res = await apiFetch<KycStatusResult>(`/documents/kyc-status/${customerId}`);
      setKycStatus(res);
    } catch {
      setKycStatus(null);
    } finally {
      setLoadingKyc(false);
    }
  };

  return (
    <DashboardShell
      title={t("documents.title")}
      description={t("documents.subtitle")}
      active="Documents"
    >
      <div className="space-y-6">
        {/* Ethiopian KYC Compliance Presets Widget */}
        <section className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary via-slate-900 to-slate-950 p-5 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/60 pb-4">
            <div>
              <h2 className="text-sm font-bold tracking-wide flex items-center gap-2 text-primary/80">
                <UserCheck className="size-4 text-primary/80" />
                Ethiopian KYC Compliance Presets (Local vs Diaspora Verification Flow)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a buyer to verify mandatory Kebele ID, Passport, TIN, or MoFA-verified Power of Attorney (ውክልና).
              </p>
            </div>

            <select
              value={selectedKycCustomerId}
              onChange={(e) => fetchKycStatus(e.target.value)}
              className="h-9 rounded-lg border border-primary/70 bg-slate-900 px-3 text-xs font-semibold text-white focus:outline-none focus:border-primary/40"
            >
              <option value="">-- Inspect Customer KYC Compliance --</option>
              {options.CUSTOMER.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loadingKyc ? (
            <p className="py-4 text-center text-xs text-slate-400 animate-pulse">
              Evaluating buyer KYC presets and document validity...
            </p>
          ) : kycStatus ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {kycStatus.customerName}
                  </span>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-extrabold text-primary/80 border border-primary/40">
                    {kycStatus.buyerType === "DIASPORA"
                      ? "✈️ DIASPORA BUYER PRESET"
                      : "🇪🇹 LOCAL BUYER PRESET"}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-xs font-extrabold px-3 py-1 rounded-full border",
                    kycStatus.isKycComplete
                      ? "bg-success/20 text-success border-success/40"
                      : "bg-warning/20 text-warning border-warning/40",
                  )}
                >
                  {kycStatus.isKycComplete
                    ? "✓ 100% KYC Complete"
                    : `${kycStatus.completionPercentage}% KYC Complete (${kycStatus.verifiedCount}/${kycStatus.totalRequired} Verified)`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    kycStatus.isKycComplete ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${kycStatus.completionPercentage}%` }}
                />
              </div>

              {/* Mandatory Checklist Items Grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                {kycStatus.requirements.map((req) => (
                  <div
                    key={req.category}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-slate-300">
                        {req.label}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Category: {req.category}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border",
                          req.status === "VERIFIED" &&
                            "bg-success/20 text-success border-success/40",
                          req.status === "PENDING_REVIEW" &&
                            "bg-warning/20 text-warning border-warning/40",
                          req.status === "EXPIRED" &&
                            "bg-destructive/20 text-destructive border-destructive/40",
                          req.status === "MISSING" &&
                            "bg-slate-800 text-slate-400 border-slate-700",
                        )}
                      >
                        {req.status === "VERIFIED"
                          ? "✓ Verified"
                          : req.status === "PENDING_REVIEW"
                            ? "⏳ Pending Review"
                            : req.status === "EXPIRED"
                              ? "🚨 Expired"
                              : "✕ Missing"}
                      </span>

                      {req.document && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(req.document)}
                          className="text-[10px] font-semibold text-primary/80 hover:text-primary/80 underline"
                        >
                          View File
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400 italic">
              Select a customer above to view their mandatory Ethiopian KYC document checklist and Ministry of Foreign Affairs (MoFA) verification status.
            </p>
          )}
        </section>
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

          <Button
            onClick={() => setShowUpload((value) => !value)}
            className="h-9 text-xs font-semibold"
          >
            {showUpload ? (
              <X className="size-4 mr-1.5" />
            ) : (
              <Upload className="size-4 mr-1.5" />
            )}
            {showUpload ? "Cancel" : "Upload New Document"}
          </Button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <form
            onSubmit={upload}
            className="grid gap-3.5 rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4"
          >
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Select Document File *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                className={inputClass}
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] ?? null })
                }
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Document Category
              </label>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Link to Entity
              </label>
              <select
                className={inputClass}
                value={form.entityType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    entityType: e.target.value as EntityType,
                    entityId: "",
                  })
                }
              >
                <option value="CUSTOMER">Customer Contact</option>
                <option value="RESERVATION">Reservation</option>
                <option value="CONTRACT">Contract</option>
                <option value="PAYMENT">Payment Receipt</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Related Record *
              </label>
              <select
                required
                className={inputClass}
                value={form.entityId}
                onChange={(e) => setForm({ ...form, entityId: e.target.value })}
              >
                <option value="">Select related record…</option>
                {options[form.entityType].map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-4 flex items-center justify-between border-t border-primary/10 pt-3">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                Expiry Date (Optional):
                <input
                  type="date"
                  className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                />
              </label>
              <Button
                type="submit"
                disabled={saving}
                className="h-9 text-xs font-semibold"
              >
                {saving ? "Uploading File…" : "Upload & Submit for Review"}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        {/* Repository Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50/70 p-3">
            {(
              [
                "ALL",
                "PENDING_REVIEW",
                "VERIFIED",
                "REJECTED",
                "EXPIRED",
              ] as const
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === st
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100",
                )}
              >
                {st === "ALL" ? "All Documents" : st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading document library…
            </p>
          ) : visibleDocuments.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500 font-medium">
              No documents match your filter.
            </p>
          ) : (
            <CrmTable
              columns={[
                "Document Name",
                "Category",
                "Related Record",
                "Uploaded Date",
                "Status",
                "Actions",
              ]}
              rows={visibleDocuments.map((doc) => [
                <div key="name" className="flex items-center gap-2">
                  <FileText className="size-4 text-primary shrink-0" />
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="font-bold text-primary hover:underline text-xs text-left"
                  >
                    {doc.name}
                    <span className="font-normal text-slate-400 block text-[11px]">
                      {documentSize(doc.sizeBytes)}
                    </span>
                  </button>
                </div>,
                <span
                  key="cat"
                  className="inline-flex items-center rounded-md bg-primary/10 border border-primary/10 px-2 py-0.5 text-xs font-bold text-primary"
                >
                  {doc.category.replace(/_/g, " ")}
                </span>,
                `${doc.entityType.replace(/_/g, " ")} · ${doc.entityId.slice(0, 8)}`,
                <span
                  key="uploaded"
                  className="text-xs font-medium text-slate-600"
                >
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                  <span className="block text-[11px] text-slate-400">
                    {doc.uploadedBy?.name ?? "System"}
                  </span>
                </span>,
                <span
                  key="status"
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-bold",
                    statusClass[doc.status],
                  )}
                  title={doc.rejectionReason ?? undefined}
                >
                  {doc.status.replace(/_/g, " ")}
                </span>,
                <div key="actions" className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    onClick={() => setPreviewDoc(doc)}
                    title="Quick Preview"
                  >
                    <Eye className="size-4 text-primary" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    onClick={() => void download(doc)}
                    title="Download file"
                  >
                    <Download className="size-4 text-slate-600" />
                  </button>
                  {doc.status === "PENDING_REVIEW" && (
                    <>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-success hover:bg-success/10"
                        onClick={() => void review(doc.id, "VERIFIED")}
                        title="Approve & Verify"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => void review(doc.id, "REJECTED")}
                        title="Reject"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                    onClick={() => void remove(doc.id)}
                    title="Delete document"
                  >
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
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {previewDoc.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {documentSize(previewDoc.sizeBytes)} ·{" "}
                      {previewDoc.category}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="my-4 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Document Status:</span>
                  <span
                    className={cn(
                      "font-bold px-2 py-0.5 rounded text-[11px]",
                      statusClass[previewDoc.status],
                    )}
                  >
                    {previewDoc.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Linked Entity:</span>
                  <span className="font-semibold text-slate-800">
                    {previewDoc.entityType} ({previewDoc.entityId.slice(0, 8)})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Uploaded On:</span>
                  <span className="font-medium">
                    {new Date(previewDoc.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Uploaded By:</span>
                  <span className="font-medium">
                    {previewDoc.uploadedBy?.name ?? "System"}
                  </span>
                </div>
                {previewDoc.rejectionReason && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-destructive mt-2">
                    <span className="font-bold block">Rejection Reason:</span>
                    {previewDoc.rejectionReason}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => void download(previewDoc)}
                  className="flex-1 h-9 text-xs font-semibold"
                >
                  <Download className="size-3.5 mr-1.5" />
                  Download File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewDoc(null)}
                  className="h-9 text-xs font-semibold"
                >
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
