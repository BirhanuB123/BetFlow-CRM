"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Edit2, RotateCw, Save } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { apiFetch } from "@/lib/api";
import { useBranding } from "@/lib/branding-context";

type BrandingSetting = {
  id: string;
  label: string;
  value: string;
  status: "live" | "draft";
};

const statusClass = {
  live: "bg-success/10 text-success border-success/20",
  draft: "bg-warning/10 text-warning border-warning/20",
};

export default function BrandingPage() {
  const { updateSystemName } = useBranding();
  const [settings, setSettings] = useState<BrandingSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BrandingSetting[]>("/saas/branding");
      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load branding settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleStartEdit = (setting: BrandingSetting) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    setError(null);
    try {
      const updated = await apiFetch<BrandingSetting>(`/saas/branding/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ value: editValue.trim(), status: "draft" }),
      });
      setSettings((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (id === "brand_name") {
        updateSystemName(updated.value);
      }
      setEditingId(null);
      showSuccess("Branding setting updated as draft");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update branding setting",
      );
    } finally {
      setSavingId(null);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const published = await apiFetch<BrandingSetting[]>(
        "/saas/branding/publish",
        {
          method: "POST",
        },
      );
      setSettings(published);
      const nameSetting = published.find((s) => s.id === "brand_name");
      if (nameSetting) {
        updateSystemName(nameSetting.value);
      }
      showSuccess("All branding changes published to live");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish branding changes",
      );
    } finally {
      setPublishing(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const draftCount = settings.filter((s) => s.status === "draft").length;

  return (
    <DashboardShell
      title="Branding & Portal Settings"
      description="Customize tenant workspace appearance and portal theme."
      active="Branding"
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
          label="White-label status"
          value={settings.length > 0 ? "Active" : "Unknown"}
          detail="Tenant logo, colors, and portal messaging"
        />
        <StatCard
          label="Brand assets"
          value={String(settings.length)}
          detail="Configurable identity parameters"
        />
        <StatCard
          label="Draft changes"
          value={String(draftCount)}
          detail="Requires publish to reflect on customer portal"
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
            <h2 className="text-base font-semibold">Brand settings</h2>
            <p className="text-sm text-zinc-500">
              Workspace labels, logo, colors, and login copy.
            </p>
          </div>
          <Button
            onClick={handlePublish}
            disabled={publishing || draftCount === 0}
          >
            {publishing ? (
              <RotateCw className="size-4 animate-spin mr-1" />
            ) : null}
            Publish changes
          </Button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading settings…</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-zinc-50 transition"
              >
                <div className="sm:w-1/3">
                  <p className="text-sm font-semibold text-zinc-800">
                    {setting.label}
                  </p>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  {editingId === setting.id ? (
                    <input
                      className="h-9 w-full max-w-md rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-zinc-600">
                      {setting.value}
                    </span>
                  )}

                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${statusClass[setting.status]}`}
                  >
                    {setting.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:w-[120px] justify-end">
                  {editingId === setting.id ? (
                    <>
                      <Button
                        size="icon-sm"
                        onClick={() => handleSave(setting.id)}
                        disabled={
                          savingId === setting.id ||
                          editValue.trim() === setting.value
                        }
                      >
                        {savingId === setting.id ? (
                          <RotateCw className="size-3.5 animate-spin" />
                        ) : (
                          <Save className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(setting)}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
