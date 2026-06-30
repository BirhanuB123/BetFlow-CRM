import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { notes } from "@/features/leads/crm-data";

export default function NotesPage() {
  return (
    <DashboardShell
      title="Notes"
      description="Internal sales context attached to leads, customers, and deals."
      active="Notes"
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Shared notes</h2>
            <p className="text-sm text-zinc-500">Relationship intelligence for the team.</p>
          </div>
          <Button>Add note</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <article key={note.id} className="rounded-md border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{note.relatedTo}</p>
                <span className="text-xs text-zinc-500">{note.createdAt}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{note.body}</p>
              <p className="mt-4 text-xs font-medium text-zinc-500">{note.author}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
