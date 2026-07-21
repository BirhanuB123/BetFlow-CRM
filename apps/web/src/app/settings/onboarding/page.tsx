"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardCheck, RotateCw } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";

type OnboardingStep = {
  step: string;
  owner: string;
  status: "Complete" | "In progress" | "Blocked" | "Not started";
  due: string;
};

const statusClass = {
  Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In progress": "bg-blue-50 text-blue-700 border-blue-200",
  Blocked: "bg-red-50 text-red-700 border-red-200",
  "Not started": "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function OnboardingPage() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadSteps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<OnboardingStep[]>("/saas/onboarding-steps");
      setSteps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load onboarding steps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSteps();
  }, []);

  const handleToggleStep = async (stepName: string, currentStatus: OnboardingStep["status"]) => {
    setUpdatingStep(stepName);
    setError(null);
    const nextStatus = currentStatus === "Complete" ? "In progress" : "Complete";
    try {
      const updated = await apiFetch<OnboardingStep>(`/saas/onboarding-steps/${encodeURIComponent(stepName)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setSteps((prev) => prev.map((s) => (s.step === stepName ? updated : s)));
      showSuccess(`Step '${stepName}' marked as ${nextStatus.toLowerCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update onboarding step");
    } finally {
      setUpdatingStep(null);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const completed = steps.filter((step) => step.status === "Complete").length;
  const blocked = steps.filter((step) => step.status === "Blocked").length;

  return (
    <DashboardShell
      title="Tenant onboarding wizard"
      description="Guided tenant setup for users, roles, domains, branding, imports, and automation."
      active="Onboarding"
    >
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard label="Progress" value={`${completed}/${steps.length}`} detail="Required onboarding steps complete" />
        <StatCard label="Blocked items" value={String(blocked)} detail="Items currently blocked" />
        <StatCard label="Target go-live" value="Jul 5" detail="Customer portal and automations" />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          <Check className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Wizard steps</h2>
            <p className="text-sm text-zinc-500">Setup checklist with owners, due dates, and blockers.</p>
          </div>
          <Button variant="outline" onClick={loadSteps}>
            <ClipboardCheck className="size-4 mr-1" />
            Refresh status
          </Button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading steps…</p>
        ) : (
          <CrmTable
            columns={["Step", "Owner", "Due", "Status", "Action"]}
            rows={steps.map((step) => [
              <span key="step" className="font-medium">{step.step}</span>,
              step.owner,
              step.due,
              <span key="status" className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${statusClass[step.status]}`}>
                {step.status}
              </span>,
              <Button
                key="action"
                variant="ghost"
                size="icon-sm"
                className="text-zinc-600 hover:text-zinc-950"
                onClick={() => handleToggleStep(step.step, step.status)}
                disabled={updatingStep === step.step}
              >
                {updatingStep === step.step ? (
                  <RotateCw className="size-3.5 animate-spin" />
                ) : step.status === "Complete" ? (
                  "Undo"
                ) : (
                  "Complete"
                )}
              </Button>,
            ])}
          />
        )}
      </section>
    </DashboardShell>
  );
}
