import { DashboardShell } from "@/components/layout/dashboard-shell";
import { activities } from "@/features/leads/crm-data";

const typeClass = {
  Call: "bg-blue-50 text-blue-700",
  Email: "bg-cyan-50 text-cyan-700",
  Assignment: "bg-violet-50 text-violet-700",
  Task: "bg-amber-50 text-amber-800",
  Note: "bg-zinc-100 text-zinc-700",
  Deal: "bg-emerald-50 text-emerald-700",
};

export default function ActivityPage() {
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
        <div className="divide-y divide-zinc-200">
          {activities.map((activity) => (
            <article key={activity.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${typeClass[activity.type]}`}>
                    {activity.type}
                  </span>
                  <h3 className="text-sm font-semibold">{activity.action}</h3>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {activity.actor} · {activity.target}
                </p>
              </div>
              <time className="text-sm text-zinc-500">{activity.time}</time>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
