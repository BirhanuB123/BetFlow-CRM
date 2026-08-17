"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity as ActivityIcon, RotateCw } from "lucide-react";

import { apiFetch } from "@/services/api";
import { cn } from "@/lib/utils";

export type TimelineEntry = {
  id: string;
  action: string;
  label: string;
  detail: string | null;
  entityType: string;
  entityId: string;
  actor: string;
  createdAt: string;
};

type ActivityTimelineProps = {
  /** Scope the feed to a single record, e.g. entityType="Deal". Omit for the tenant-wide feed. */
  entityType?: string;
  entityId?: string;
  limit?: number;
  title?: string;
  className?: string;
};

// Color the node by the kind of event so a timeline scans quickly.
function dotClass(action: string): string {
  if (action.endsWith(".created") || action.endsWith(".registered"))
    return "bg-emerald-500";
  if (action.endsWith(".deleted")) return "bg-rose-500";
  if (
    action.includes("signed") ||
    action.includes("status") ||
    action.includes("stage")
  )
    return "bg-amber-500";
  return "bg-sky-500";
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ActivityTimeline({
  entityType,
  entityId,
  limit = 50,
  title = "Activity",
  className,
}: ActivityTimelineProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (entityType) params.set("entityType", entityType);
      if (entityId) params.set("entityId", entityId);
      params.set("limit", String(limit));
      const data = await apiFetch<TimelineEntry[]>(
        `/activities?${params.toString()}`,
      );
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section
      className={cn("rounded-lg border border-zinc-200 bg-white", className)}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 p-4">
        <div className="flex items-center gap-2">
          <ActivityIcon className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="text-zinc-400 transition-colors hover:text-zinc-700"
          aria-label="Refresh activity"
        >
          <RotateCw className={cn("size-4", loading && "animate-spin")} />
        </button>
      </div>

      {error ? (
        <p className="px-4 py-6 text-sm text-red-600">{error}</p>
      ) : loading && entries.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Loading activity…</p>
      ) : entries.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500">No activity yet.</p>
      ) : (
        <ol className="p-4">
          {entries.map((entry, index) => (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {index < entries.length - 1 && (
                <span className="absolute left-[5px] top-4 h-full w-px bg-zinc-200" />
              )}
              <span
                className={cn(
                  "relative mt-1 size-2.5 shrink-0 rounded-full",
                  dotClass(entry.action),
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900">
                    {entry.label}
                  </p>
                  <time className="shrink-0 text-xs text-zinc-400">
                    {timeAgo(entry.createdAt)}
                  </time>
                </div>
                {entry.detail && (
                  <p className="mt-0.5 text-sm text-zinc-500">{entry.detail}</p>
                )}
                <p className="mt-0.5 text-xs text-zinc-400">
                  {entry.actor}
                  {!entityType && (
                    <span className="text-zinc-300"> · {entry.entityType}</span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
