"use client";

import { useCallback, useEffect, useState } from "react";
import { Hammer, HardHat, Layers, Send, X, CheckCircle2, AlertCircle } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  ConstructionMilestone,
  ConstructionStageKey,
  MilestoneTriggerResult,
  UpdateMilestoneProgressInput,
} from "@betflow/shared";

type ApiBuilding = {
  id: string;
  name: string;
  floorsCount: number;
  project: { id: string; name: string };
};

const STAGE_LABELS: Record<ConstructionStageKey, { en: string; am: string }> = {
  FOUNDATION: { en: "Foundation", am: "መሰረት" },
  SUPERSTRUCTURE: { en: "Concrete Frame", am: "ኮንክሪት ስራ" },
  BLOCKWORK: { en: "Masonry Walls", am: "ብሎኬት" },
  FINISHING: { en: "Finishing & MEP", am: "ማጠናቀቂያ" },
  HANDOVER: { en: "Key & Carta", am: "ካርታና ርክክብ" },
};

export default function PropertiesPage() {
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<ConstructionMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Milestone Update Modal State
  const [editingMilestone, setEditingMilestone] = useState<ConstructionMilestone | null>(null);
  const [percent, setPercent] = useState<number>(0);
  const [status, setStatus] = useState<"NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">("IN_PROGRESS");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [triggerResult, setTriggerResult] = useState<MilestoneTriggerResult | null>(null);

  const loadBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch buildings
      const res = await apiFetch<ApiBuilding[]>("/buildings");
      setBuildings(res);
      if (res.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(res[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load buildings");
    } finally {
      setLoading(false);
    }
  }, [selectedBuildingId]);

  const loadMilestones = useCallback(async (bId: string) => {
    try {
      const res = await apiFetch<ConstructionMilestone[]>(
        `/real-estate/construction/milestones/${bId}`,
      );
      setMilestones(res);
    } catch (err) {
      console.error("Failed to load milestones", err);
    }
  }, []);

  useEffect(() => {
    void loadBuildings();
  }, [loadBuildings]);

  useEffect(() => {
    if (selectedBuildingId) {
      void loadMilestones(selectedBuildingId);
    }
  }, [selectedBuildingId, loadMilestones]);

  const openMilestoneModal = (m: ConstructionMilestone) => {
    setEditingMilestone(m);
    setPercent(m.completionPercent);
    setStatus(m.status);
    setPhotoUrl(m.photoUrl || "");
    setTriggerResult(null);
  };

  const handleUpdateMilestone = async () => {
    if (!editingMilestone || !selectedBuildingId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch<MilestoneTriggerResult>(
        "/real-estate/construction/milestones/update",
        {
          method: "POST",
          body: JSON.stringify({
            buildingId: selectedBuildingId,
            stageKey: editingMilestone.stageKey,
            completionPercent: Number(percent),
            status,
            photoUrl: photoUrl || undefined,
          } satisfies UpdateMilestoneProgressInput),
        },
      );
      setTriggerResult(res);
      await loadMilestones(selectedBuildingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update construction progress");
    } finally {
      setSubmitting(false);
    }
  };

  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId);

  return (
    <DashboardShell
      title="Properties & Construction Milestones"
      description="Ethiopian Real Estate site progress tracking & automated milestone payment demands."
      active="Properties"
    >
      {/* Building Selector */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-2">
          <HardHat className="size-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Active Building Site</h2>
            <p className="text-xs text-zinc-500">Select project building to view & update construction stages.</p>
          </div>
        </div>
        <select
          value={selectedBuildingId || ""}
          onChange={(e) => setSelectedBuildingId(e.target.value)}
          className="h-9 min-w-48 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold"
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.project.name})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Construction Milestones Tracker Grid */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <span>🏗️ Ethiopian Construction Stages (የግንባታ ደረጃዎች)</span>
              {activeBuilding && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {activeBuilding.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-500">
              Updating a stage to 100% / COMPLETED automatically triggers milestone payment invoices for all buyer contracts.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading construction progress…</p>
        ) : milestones.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No milestone data for this building.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-5">
            {milestones.map((m, idx) => {
              const label = STAGE_LABELS[m.stageKey] ?? { en: m.stageNameEnglish, am: m.stageNameAmharic };

              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md",
                    m.status === "COMPLETED"
                      ? "border-emerald-200 bg-emerald-50/40"
                      : m.status === "IN_PROGRESS"
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-zinc-200 bg-zinc-50/40",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400">STAGE {idx + 1}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase",
                          m.status === "COMPLETED" && "bg-emerald-100 text-emerald-800",
                          m.status === "IN_PROGRESS" && "bg-amber-100 text-amber-800",
                          m.status === "NOT_STARTED" && "bg-zinc-100 text-zinc-600",
                        )}
                      >
                        {m.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-zinc-900">{label.en}</h3>
                    <p className="text-xs font-semibold text-amber-800">{label.am}</p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-600 mb-1">
                        <span>Progress</span>
                        <span>{m.completionPercent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            m.status === "COMPLETED" ? "bg-emerald-600" : "bg-amber-500",
                          )}
                          style={{ width: `${m.completionPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full h-8 text-xs font-semibold gap-1 bg-white hover:bg-zinc-50"
                    onClick={() => openMilestoneModal(m)}
                  >
                    <Hammer className="size-3 text-amber-600" /> Update Stage
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* EDIT MILESTONE & TRIGGER PAYMENT MODAL */}
      {editingMilestone ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <HardHat className="size-5 text-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    Update {editingMilestone.stageNameEnglish} ({editingMilestone.stageNameAmharic})
                  </h2>
                  <p className="text-xs text-zinc-500">Site Engineer Construction Entry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="my-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Milestone Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED")}
                  className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold"
                >
                  <option value="NOT_STARTED">Not Started (ያልተጀመረ)</option>
                  <option value="IN_PROGRESS">In Progress (በስራ ላይ)</option>
                  <option value="COMPLETED">Completed 100% (የተጠናቀቀ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">
                  Completion Percentage ({percent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">Site Progress Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/site-photos/foundation-july.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs"
                />
              </div>

              {/* Trigger Warning Box */}
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1">
                  <span>⚡ Auto-Invoice Demand Trigger</span>
                </p>
                <p className="mt-0.5">
                  Updating stage to <strong>100% / COMPLETED</strong> will issue milestone payment demand notices to all buyers in {activeBuilding?.name}.
                </p>
              </div>

              {/* Trigger Result Success Notice */}
              {triggerResult ? (
                <div className="rounded-lg bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="size-4" /> Milestone Payment Demand Issued!
                  </p>
                  <p>✓ Contracts Triggered: {triggerResult.contractsTriggered}</p>
                  <p>✓ Payment Demands Generated: {triggerResult.invoicesGenerated}</p>
                  <p>✓ Buyer Alerts Sent: {triggerResult.notificationsSent}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-zinc-100 pt-3">
              <Button variant="outline" onClick={() => setEditingMilestone(null)} className="h-9">
                Close
              </Button>
              <Button
                onClick={handleUpdateMilestone}
                disabled={submitting}
                className="h-9 bg-amber-600 hover:bg-amber-700 text-white gap-1"
              >
                <Send className="size-3.5" />
                {submitting ? "Publishing…" : "Publish & Trigger Payments"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
