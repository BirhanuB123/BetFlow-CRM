"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileCheck, FileText, Send, ShieldAlert } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { ContractTemplateResult, GenerateContractInput } from "@betflow/shared";

type CustomerOption = { id: string; firstName: string; lastName: string; email: string | null };
type UnitOption = { id: string; unitNumber: string; type: string; price: string; floor: { name: string; building: { name: string; project: { name: string } } } };

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
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<ContractTemplateResult | null>(null);

  const loadFormData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        apiFetch<CustomerOption[]>("/customers").catch(() => []),
        apiFetch<UnitOption[]>("/units").catch(() => []),
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
      const res = await apiFetch<ContractTemplateResult>("/contracts/generate", {
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
      });
      setGeneratedResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate legal contract");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardShell
      title="Legal Contract Builder"
      description="Automated Ethiopian real estate sales agreement generator & approval rules."
      active="Contract builder"
    >
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input Configuration Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Agreement Configuration
            </h2>

            <div>
              <label className="text-xs font-semibold text-zinc-700">Buyer Customer</label>
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
              <label className="text-xs font-semibold text-zinc-700">Target Unit & Project</label>
              <select
                value={selectedUnitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} ({u.type}) — {u.floor.building.project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Currency</label>
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
                <label className="text-xs font-semibold text-zinc-700">Agreed Contract Price</label>
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
                className="mt-2 w-full accent-[#334cff]"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Discounts &gt; 5% automatically trigger Finance Manager Approval.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">Special Legal Terms (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g., Extended payment schedule or customized finishing specifications..."
                value={specialTerms}
                onChange={(e) => setSpecialTerms(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs"
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <Button
              onClick={handleGenerate}
              disabled={generating || !selectedCustomerId || !selectedUnitId}
              className="w-full h-10 bg-[#334cff] hover:bg-[#2539cc] text-white gap-2 font-semibold"
            >
              <FileCheck className="size-4" />
              {generating ? "Building Contract..." : "Generate Sales Agreement"}
            </Button>
          </div>
        </div>

        {/* Right Live HTML Contract Document Preview */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs min-h-[600px]">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#334cff]" />
                <h2 className="text-base font-bold text-zinc-900">Legal Document Preview</h2>
              </div>

              {generatedResult ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    generatedResult.requiresApproval
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {generatedResult.requiresApproval ? (
                    <>
                      <ShieldAlert className="size-3.5" /> Pending Approval
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" /> Approved & Active
                    </>
                  )}
                </span>
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
                        Contract submitted to Manager Approval Queue (/approvals).
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Document Container */}
                <div
                  className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 font-serif text-sm shadow-inner max-h-[500px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generatedResult.htmlContent }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center text-zinc-400">
                <FileText className="size-12 stroke-1 text-zinc-300 mb-2" />
                <p className="text-sm font-medium">Select parameters and click &quot;Generate Sales Agreement&quot;</p>
                <p className="text-xs text-zinc-400">Live preview of Ethiopian Real Estate Agreement will render here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
