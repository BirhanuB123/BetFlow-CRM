"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, ShieldAlert, X, XCircle } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { ApprovalRequestItem } from "@betflow/shared";

function fmt(val: number, curr: "ETB" | "USD") {
  if (curr === "USD") return formatCurrency(val);
  return `${val.toLocaleString()} ETB`;
}

export default function ApprovalWorkflowsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApprovalRequestItem[]>("/contracts/approvals");
      setApprovals(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load approval queue",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const handleReview = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      await apiFetch(`/contracts/approvals/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      await loadApprovals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to review contract",
      );
    }
  };

  const pending = approvals.filter((a) => a.status === "PENDING");
  const processed = approvals.filter((a) => a.status !== "PENDING");

  return (
    <DashboardShell
      title="Manager Approval Workflows"
      description="Multi-tier approval queue for custom discounts, non-standard terms, and high-value contracts."
      active="Approval workflows"
    >
      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Pending Approval Requests */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Pending Manager Approvals
              </h2>
              <p className="text-xs text-zinc-500">
                Requires Executive or Finance Manager sign-off before contract
                activation.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {pending.length} Pending
          </span>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading approval queue…</p>
        ) : pending.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No pending contract approvals requiring action.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-zinc-400">
                      ID: {item.id}
                    </span>
                    <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                      PENDING REVIEW
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Buyer:{" "}
                    <span className="font-semibold text-zinc-800">
                      {item.buyerName}
                    </span>
                  </p>

                  <div className="mt-3 rounded-lg bg-white p-3 border border-amber-100 text-xs space-y-1">
                    <p className="flex justify-between">
                      <span className="text-zinc-500">Agreed Price:</span>
                      <span className="font-extrabold text-zinc-900">
                        {fmt(item.amount, item.currency)}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-zinc-500">Custom Discount:</span>
                      <span className="font-bold text-rose-600">
                        {item.discountPercent}%
                      </span>
                    </p>
                    <div className="mt-2 border-t border-zinc-100 pt-1 text-[11px] text-amber-900">
                      <strong>Reason:</strong> {item.reason}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                    onClick={() => handleReview(item.id, "APPROVE")}
                  >
                    <Check className="size-3.5" /> Approve Contract
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 border-rose-300 text-rose-700 hover:bg-rose-50 gap-1 text-xs"
                    onClick={() => handleReview(item.id, "REJECT")}
                  >
                    <X className="size-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Processed Approvals History */}
      {processed.length > 0 ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 mb-3">
            Approval History Log
          </h2>
          <div className="divide-y divide-zinc-100">
            {processed.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <div>
                  <p className="font-bold text-zinc-900">{item.title}</p>
                  <p className="text-zinc-500">{item.reason}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                    item.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {item.status === "APPROVED" ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <XCircle className="size-3" />
                  )}
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}
