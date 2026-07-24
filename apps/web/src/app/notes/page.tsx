"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type Note = {
  id: string;
  content: string;
  entityType: string;
  entityId: string;
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<Note[]>("/notes");
        setNotes(data);
      } catch (err) {
        console.error("Failed to load notes:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

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
        
        {loading ? (
          <p className="p-4 text-sm text-zinc-500">Loading notes...</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {notes.length > 0 ? (
              notes.map((note) => (
                <article key={note.id} className="rounded-md border border-zinc-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold capitalize">{note.entityType} Note</p>
                    <span className="text-xs text-zinc-500">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{note.content}</p>
                  <p className="mt-4 text-xs font-medium text-zinc-500">
                    {note.createdBy ? `${note.createdBy.firstName} ${note.createdBy.lastName}` : "Unknown Agent"}
                  </p>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-md border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
                No notes found.
              </div>
            )}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
