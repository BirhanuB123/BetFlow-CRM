"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { apiFetch } from "@/lib/api";

type Activity = {
  id: string;
  type: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  createdBy?: { firstName: string; lastName: string };
};

const typeClass: Record<string, string> = {
  Call: "bg-blue-50 text-blue-700",
  Email: "bg-cyan-50 text-cyan-700",
  Assignment: "bg-violet-50 text-violet-700",
  Task: "bg-amber-50 text-amber-800",
  Note: "bg-zinc-100 text-zinc-700",
  Deal: "bg-emerald-50 text-emerald-700",
  Lead: "bg-rose-50 text-rose-700",
  Customer: "bg-indigo-50 text-indigo-700",
  System: "bg-slate-100 text-slate-700",
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<Activity[]>("/activities");
        setActivities(data);
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <DashboardShell
      title="Activity timeline"
      description="Lead, deal, task, and note history in one stream."
      active="Activity"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-base font-semibold">Timeline</h2>
          <p className="text-sm text-zinc-500">Recent CRM workflow events.</p>
        </div>
        
        {loading ? (
          <p className="p-4 text-sm text-zinc-500">Loading timeline...</p>
        ) : activities.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500 text-center">No activity found.</p>
        ) : (
          <div className="divide-y divide-zinc-200">
            {activities.map((activity) => (
              <article key={activity.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${typeClass[activity.type] || typeClass['System']}`}>
                      {activity.type}
                    </span>
                    <h3 className="text-sm font-semibold">{activity.action}</h3>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {activity.createdBy ? `${activity.createdBy.firstName} ${activity.createdBy.lastName}` : "System"} · {activity.entityType}
                  </p>
                </div>
                <time className="text-sm text-zinc-500">{new Date(activity.createdAt).toLocaleString()}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
