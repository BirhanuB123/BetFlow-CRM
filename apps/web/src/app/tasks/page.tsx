import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CrmTable } from "@/components/tables/crm-table";
import { Button } from "@/components/ui/button";
import { notes, tasks } from "@/features/leads/crm-data";

const statusClass = {
  Open: "bg-zinc-100 text-zinc-700",
  "In progress": "bg-blue-50 text-blue-700",
  Done: "bg-emerald-50 text-emerald-700",
};

export default function TasksPage() {
  return (
    <DashboardShell
      title="Tasks and notes"
      description="Follow-up work and relationship context."
      active="Tasks"
    >
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">Task queue</h2>
            <p className="text-sm text-zinc-500">Next actions by owner and account.</p>
          </div>
          <Button>New task</Button>
        </div>
        <CrmTable
          columns={["Task", "Owner", "Related to", "Due", "Status", "Priority"]}
          rows={tasks.map((task) => [
            <span key="title" className="font-medium">{task.title}</span>,
            task.owner,
            task.relatedTo,
            task.due,
            <span key="status" className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass[task.status]}`}>
              {task.status}
            </span>,
            task.priority,
          ])}
        />
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Notes</h2>
            <p className="text-sm text-zinc-500">Internal context attached to leads and customers.</p>
          </div>
          <Button variant="outline">Add note</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <article key={note.id} className="rounded-md border border-zinc-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{note.relatedTo}</p>
                <span className="text-xs text-zinc-500">{note.createdAt}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{note.body}</p>
              <p className="mt-3 text-xs font-medium text-zinc-500">{note.author}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
