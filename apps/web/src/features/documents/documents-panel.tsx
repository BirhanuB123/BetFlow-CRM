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

import { cn } from "@/lib/utils";

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
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="size-4 text-primary shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {title} ({documents.length})
          </h2>
        </div>
        <Link
          href="/documents"
          className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
        >
          Manage All →
        </Link>
      </div>
      {loading ? (
        <p className="p-4 text-xs text-slate-500">Loading documents…</p>
      ) : documents.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-xs font-semibold text-slate-500">
            No attached files found for this record.
          </p>
          <Link
            href="/documents"
            className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
          >
            + Upload Document
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {documents.slice(0, 6).map((document) => (
            <li
              key={document.id}
              className="flex items-center justify-between gap-2 p-3 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <FileText className="size-4 shrink-0 text-slate-400 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 leading-snug">
                    {document.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 truncate">
                      {document.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border",
                        document.status === "VERIFIED"
                          ? "bg-success/10 text-success border-success/20"
                          : document.status === "EXPIRED"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20",
                      )}
                    >
                      {document.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void download(document)}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer shadow-2xs"
                title={`Download ${document.name}`}
                aria-label={`Download ${document.name}`}
              >
                <Download className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
