"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { StickyNote, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type ApiNote = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
};

type NotesPanelProps = {
  entityType: string;
  entityId: string;
  title?: string;
  className?: string;
  /** Called after a note is added/removed so parents can refresh a timeline. */
  onChange?: () => void;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function NotesPanel({
  entityType,
  entityId,
  title = "Notes",
  className,
  onChange,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = new URLSearchParams({ entityType, entityId });
      const data = await apiFetch<ApiNote[]>(`/notes?${params.toString()}`);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const addNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch<ApiNote>("/notes", {
        method: "POST",
        body: JSON.stringify({ content: draft, entityType, entityId }),
      });
      setDraft("");
      await load();
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async (id: string) => {
    setError(null);
    try {
      await apiFetch(`/notes/${id}`, { method: "DELETE" });
      await load();
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  return (
    <section className={cn("rounded-lg border border-zinc-200 bg-white", className)}>
      <div className="flex items-center gap-2 border-b border-zinc-200 p-4">
        <StickyNote className="size-4 text-zinc-500" />
        <h2 className="text-base font-semibold">{title}</h2>
        {notes.length > 0 && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            {notes.length}
          </span>
        )}
      </div>

      <form onSubmit={addNote} className="border-b border-zinc-100 p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className="w-full resize-y rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={saving || !draft.trim()}>
            {saving ? "Saving…" : "Add note"}
          </Button>
        </div>
      </form>

      {error && (
        <p className="border-b border-zinc-100 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500">No notes yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {notes.map((note) => (
            <li key={note.id} className="group flex gap-3 p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                {initials(note.author.firstName, note.author.lastName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-800">
                    {note.author.firstName} {note.author.lastName}
                  </p>
                  <time className="shrink-0 text-xs text-zinc-400">
                    {timeAgo(note.createdAt)}
                  </time>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-zinc-600">
                  {note.content}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                className="text-zinc-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                aria-label="Delete note"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
