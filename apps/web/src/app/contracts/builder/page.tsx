"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  PenTool,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { SignatureModal } from "@/components/contracts/signature-modal";
import { apiDownload, apiFetch } from "@/lib/api";
import type {
  ContractTemplateResult,
  GenerateContractInput,
  SignatureAuditItem,
} from "@betflow/shared";

type CustomerOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};
type UnitOption = {
  id: string;
  unitNumber: string;
  type: string;
  price: string;
  floor: {
    name: string;
    building: { name: string; project: { name: string } };
  };
};

export default function ContractBuilderPage() {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [price, setPrice] = useState<number>(18500000);
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [specialTerms, setSpecialTerms] = useState("");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] =
    useState<ContractTemplateResult | null>(null);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatures, setSignatures] = useState<SignatureAuditItem[]>([]);

  const loadFormData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        apiFetch<CustomerOption[]>("/customers").catch(() => []),
        apiFetch<UnitOption[]>("/units?status=AVAILABLE").catch(() => []),
      ]);
      setCustomers(cRes);
      setUnits(uRes);
      if (cRes.length > 0) setSelectedCustomerId(cRes[0].id);
      if (uRes.length > 0) {
        setSelectedUnitId(uRes[0].id);
        setPrice(Number(uRes[0].price));
      }
    } catch (err) {
      console.error("Failed to load builder options", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFormData();
  }, [loadFormData]);

  const loadSignatures = async (contractId: string) => {
    try {
      const list = await apiFetch<SignatureAuditItem[]>(
        `/contracts/${contractId}/signatures`,
      );
      setSignatures(list);
    } catch {
      // Ignore if no signatures yet
    }
  };

  const handleUnitChange = (uId: string) => {
    setSelectedUnitId(uId);
    const selected = units.find((u) => u.id === uId);
    if (selected) {
      setPrice(Number(selected.price));
    }
  };

  const handleGenerate = async () => {
    if (!selectedCustomerId || !selectedUnitId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await apiFetch<ContractTemplateResult>(
        "/contracts/generate",
        {
          method: "POST",
          body: JSON.stringify({
            templateType: "ETHIOPIAN_REAL_ESTATE_SALE",
            customerId: selectedCustomerId,
            unitId: selectedUnitId,
            agreedPrice: Number(price),
            currency,
            discountPercent,
            specialTerms: specialTerms || undefined,
          } satisfies GenerateContractInput),
        },
      );
      setGeneratedResult(res);
      void loadSignatures(res.contractId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate legal contract",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSignatureSuccess = (newSig: SignatureAuditItem) => {
    setSignatures((prev) => [...prev, newSig]);
  };

  const downloadPdf = async () => {
    if (!generatedResult) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await apiDownload(
        `/contracts/${generatedResult.contractId}/pdf`,
      );
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Contract_${generatedResult.contractId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download PDF contract",
      );
    } finally {
      setDownloading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <DashboardShell
      title="Legal Contract Builder & E-Signature Engine"
      description="Automated Ethiopian real estate sales agreement generator, PDF engine & audit trail."
      active="Contract builder"
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb Bar with Back Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#233b66] transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="size-3.5 text-slate-500" />
              <span>Back to Transactions</span>
            </Link>
            <span className="text-slate-300 font-bold">•</span>
            <Link
              href="/transactions?tab=contracts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-2xs cursor-pointer"
            >
              <ScrollText className="size-3.5 text-primary" />
              <span>Back to Sales Contracts</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              SHA-256 PDF Engine Ready
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input Configuration Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Agreement Configuration
            </h2>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                Buyer Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email || "No Email"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                Target Unit & Project
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} ({u.type}) —{" "}
                    {u.floor.building.project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "ETB" | "USD")}
                  className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-bold"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD ($ Forex)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">
                  Agreed Contract Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                Custom Discount ({discountPercent}%)
              </label>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="mt-2 w-full accent-[#233b66]"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Discounts &gt; 5% automatically trigger Finance Manager
                Approval.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                Special Legal Terms (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Extended payment schedule or customized finishing specifications..."
                value={specialTerms}
                onChange={(e) => setSpecialTerms(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            <Button
              onClick={handleGenerate}
              disabled={generating || !selectedCustomerId || !selectedUnitId}
              className="w-full h-10 gap-2 font-semibold"
            >
              <FileCheck className="size-4" />
              {generating ? "Building Contract..." : "Generate Sales Agreement"}
            </Button>
          </div>

          {/* Action Bar when generated */}
          {generatedResult && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide border-b border-zinc-100 pb-2">
                Document & Signature Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={downloadPdf}
                  disabled={downloading}
                  variant="outline"
                  className="h-9 text-xs gap-1.5 font-semibold text-zinc-800"
                >
                  <Download className="size-4 text-[#233b66]" />{" "}
                  {downloading ? "Downloading..." : "Download PDF"}
                </Button>
                <Button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="h-9 text-xs gap-1.5 font-semibold"
                >
                  <PenTool className="size-4" /> Sign Digitally
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Live HTML Contract Document Preview & Audit Log */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs min-h-[550px]">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#233b66]" />
                <h2 className="text-base font-bold text-zinc-900">
                  Legal Document Preview
                </h2>
              </div>

              {generatedResult ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadPdf}
                    disabled={downloading}
                    className="h-7 text-[11px] gap-1 border-zinc-300"
                  >
                    <Download className="size-3 text-[#233b66]" />{" "}
                    {downloading ? "Downloading..." : "PDF Stream"}
                  </Button>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      signatures.length > 0
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : generatedResult.requiresApproval
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                  >
                    {signatures.length > 0 ? (
                      <>
                        <ShieldCheck className="size-3.5" /> Digitally Signed (
                        {signatures.length})
                      </>
                    ) : generatedResult.requiresApproval ? (
                      <>
                        <ShieldAlert className="size-3.5" /> Pending Approval
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" /> Approved & Active
                      </>
                    )}
                  </span>
                </div>
              ) : null}
            </div>

            {generatedResult ? (
              <div className="space-y-4">
                {generatedResult.requiresApproval ? (
                  <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Management Approval Required</p>
                      <p className="mt-0.5">{generatedResult.approvalReason}</p>
                      <p className="mt-1 text-[11px] text-amber-800 font-semibold">
                        Contract submitted to Manager Approval Queue
                        (/approvals).
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Document Container */}
                <div
                  className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 font-serif text-sm shadow-inner max-h-[420px] overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html: generatedResult.htmlContent,
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center text-zinc-400">
                <FileText className="size-12 stroke-1 text-zinc-300 mb-2" />
                <p className="text-sm font-medium">
                  Select parameters and click &quot;Generate Sales
                  Agreement&quot;
                </p>
                <p className="text-xs text-zinc-400">
                  Live preview of Ethiopian Real Estate Agreement will render
                  here.
                </p>
              </div>
            )}
          </div>

          {/* Signature Audit Trail Section */}
          {generatedResult && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    E-Signature Verification Audit Trail
                  </h3>
                </div>
                <span className="text-xs font-semibold text-zinc-500">
                  {signatures.length} Signatures Logged
                </span>
              </div>

              {signatures.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                  No signatures attached yet. Click{" "}
                  <strong>&quot;Sign Digitally&quot;</strong> to capture client
                  signature.
                </div>
              ) : (
                <div className="space-y-3">
                  {signatures.map((sig) => (
                    <div
                      key={sig.id}
                      className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 flex items-start gap-4 text-xs"
                    >
                      {/* Signature canvas rendering */}
                      <div className="bg-white rounded border border-zinc-300 p-1 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sig.signatureDataUrl}
                          alt="Signature"
                          className="h-12 w-28 object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-zinc-900">
                            {sig.signerName}{" "}
                            <span className="text-[11px] font-normal text-zinc-500">
                              ({sig.signerRole})
                            </span>
                          </p>
                          <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-semibold">
                            SHA-256 Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600">
                          Signed at:{" "}
                          <strong>
                            {new Date(sig.signedAt).toLocaleString()}
                          </strong>
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          IP: {sig.ipAddress} | Hash:{" "}
                          {sig.verificationHash.slice(0, 32)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Signature Modal */}
      {generatedResult && (
        <SignatureModal
          contractId={generatedResult.contractId}
          defaultSignerName={
            selectedCustomer
              ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
              : ""
          }
          defaultSignerEmail={selectedCustomer?.email || ""}
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSuccess={handleSignatureSuccess}
        />
      )}
    </DashboardShell>
  );
}
