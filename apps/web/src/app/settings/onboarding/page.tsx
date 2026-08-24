"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ClipboardCheck, RotateCw } from "lucide-react";
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
  Complete: "bg-success/10 text-success border-success/20",
  "In progress": "bg-info/10 text-info border-info/20",
  Blocked: "bg-destructive/10 text-destructive border-destructive/20",
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
      setError(
        err instanceof Error ? err.message : "Failed to load onboarding steps",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSteps();
  }, []);

  const handleToggleStep = async (
    stepName: string,
    currentStatus: OnboardingStep["status"],
  ) => {
    setUpdatingStep(stepName);
    setError(null);
    const nextStatus =
      currentStatus === "Complete" ? "In progress" : "Complete";
    try {
      const updated = await apiFetch<OnboardingStep>(
        `/saas/onboarding-steps/${encodeURIComponent(stepName)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      setSteps((prev) => prev.map((s) => (s.step === stepName ? updated : s)));
      showSuccess(`Step '${stepName}' marked as ${nextStatus.toLowerCase()}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update onboarding step",
      );
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
      title="Tenant Onboarding"
      description="Step-by-step workspace setup and team readiness progress."
      active="Onboarding"
    >
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#233b66] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Settings
      </Link>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard
          label="Progress"
          value={`${completed}/${steps.length}`}
          detail="Required onboarding steps complete"
        />
        <StatCard
          label="Blocked items"
          value={String(blocked)}
          detail="Items currently blocked"
        />
        <StatCard
          label="Target go-live"
          value="Jul 5"
          detail="Customer portal and automations"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <Check className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Wizard steps</h2>
            <p className="text-sm text-zinc-500">
              Setup checklist with owners, due dates, and blockers.
            </p>
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
              <span key="step" className="font-medium">
                {step.step}
              </span>,
              step.owner,
              step.due,
              <span
                key="status"
                className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${statusClass[step.status]}`}
              >
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
