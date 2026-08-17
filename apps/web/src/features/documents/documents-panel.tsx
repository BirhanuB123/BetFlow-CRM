"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { apiDownload, apiFetch } from "@/services/api";

type DocumentEntry = {
  id: string;
  name: string;
  category: string;
  status: string;
  uploadedAt: string;
};

export function DocumentsPanel({
  entityType,
  entityId,
  title = "Documents",
}: {
  entityType: string;
  entityId: string;
  title?: string;
}) {
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ entityType, entityId });
      setDocuments(
        await apiFetch<DocumentEntry[]>(`/documents?${params.toString()}`),
      );
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    void load();
  }, [load]);

  const download = async (document: DocumentEntry) => {
    const blob = await apiDownload(`/documents/${document.id}/download`);
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = document.name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-zinc-500" />
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <Link
          href="/documents"
          className="text-sm text-[#233b66] hover:underline"
        >
          Manage
        </Link>
      </div>
      {loading ? (
        <p className="p-4 text-sm text-zinc-500">Loading documents…</p>
      ) : documents.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">No documents attached.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {documents.slice(0, 5).map((document) => (
            <li key={document.id} className="flex items-center gap-2 p-3">
              <FileText className="size-4 shrink-0 text-zinc-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{document.name}</p>
                <p className="text-xs text-zinc-500">
                  {document.category.replace(/_/g, " ")} ·{" "}
                  {document.status.replace(/_/g, " ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void download(document)}
                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label={`Download ${document.name}`}
              >
                <Download className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
