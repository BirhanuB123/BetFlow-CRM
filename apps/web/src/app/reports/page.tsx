"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, FolderOpen, Library, Search, Star } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type ReportCatalogEntry = {
  id: string;
  name: string;
  description: string;
  folder: string;
  href: string;
  lastAccessedAt: string | null;
  createdBy: string | null;
};

const FAVORITES_KEY = "betflow-report-favorites";
const ALL = "All Reports";

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReportsCatalogPage() {
  const [reports, setReports] = useState<ReportCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string>(ALL);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadReports = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<ReportCatalogEntry[]>("/reports/catalog");
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
    try {
      const saved = window.localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(new Set(JSON.parse(saved) as string[]));
    } catch {
      /* ignore */
    }
  }, [loadReports]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const folders = useMemo(() => {
    const set = new Set(reports.map((r) => r.folder));
    return [ALL, "Favorites", ...[...set].sort()];
  }, [reports]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reports
      .filter((report) => {
        if (folder === "Favorites" && !favorites.has(report.id)) return false;
        if (folder !== ALL && folder !== "Favorites" && report.folder !== folder)
          return false;
        if (!term) return true;
        return (
          report.name.toLowerCase().includes(term) ||
          report.description.toLowerCase().includes(term) ||
          report.folder.toLowerCase().includes(term)
        );
      })
      // Group by folder like Zoho, then alphabetically by name.
      .sort((a, b) =>
        a.folder === b.folder
          ? a.name.localeCompare(b.name)
          : a.folder.localeCompare(b.folder),
      );
  }, [reports, query, folder, favorites]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(filtered.map((r) => r.id)));
  };
  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <DashboardShell
      title="Reports"
      description="Browse and open analytics reports for your workspace."
      active="Reports"
    >
      {/* Zoho-style toolbar: folder dropdown left, search right */}
      <div className="mb-3 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <select
            aria-label="Filter reports by folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="h-9 w-full appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-9 text-sm font-medium text-zinc-800 outline-none focus:border-zinc-400 sm:w-56"
          >
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex h-9 w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-zinc-500 sm:w-72">
            <Search className="size-4 shrink-0" />
            <input
              aria-label="Search all reports"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search All Reports"
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            />
          </label>
          <span className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 sm:flex">
            <Library className="size-4" />
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {error ? (
          <div className="p-4">
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          </div>
        ) : null}

        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-blue-50/60 px-4 py-2 text-sm text-zinc-700">
            <span className="font-medium">{selected.size} selected</span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Desktop / tablet table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-white text-zinc-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all reports"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-zinc-300"
                  />
                </th>
                <th className="px-2 py-3 font-medium">Report Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Folder</th>
                <th className="px-4 py-3 font-medium">Last Accessed Date</th>
                <th className="px-4 py-3 font-medium">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id} className="group hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${report.name}`}
                        checked={selected.has(report.id)}
                        onChange={() => toggleRow(report.id)}
                        className="size-4 rounded border-zinc-300"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(report.id)}
                          aria-label={
                            favorites.has(report.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Star
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              favorites.has(report.id)
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-300 hover:text-amber-400",
                            )}
                          />
                        </button>
                        <Link
                          href={report.href}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {report.name}
                        </Link>
                      </div>
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-zinc-600">
                      {report.description}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{report.folder}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(report.lastAccessedAt)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {report.createdBy ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-zinc-200 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-100" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-zinc-500">
              No reports match your filters.
            </p>
          ) : (
            filtered.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={report.href}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {report.name}
                  </Link>
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600">
                    <FolderOpen className="size-3" />
                    {report.folder}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{report.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Last accessed {formatDate(report.lastAccessedAt)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-200 px-4 py-2.5 text-xs text-zinc-500">
          {loading ? "Loading reports…" : `${filtered.length} of ${reports.length} reports`}
        </div>
      </div>
    </DashboardShell>
  );
}