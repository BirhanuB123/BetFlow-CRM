"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, FolderOpen, Library, Search, Star, Download, Printer, ArrowUpRight, BarChart3 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
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
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
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

  const handleExportCSV = () => {
    const headers = ["Report Name", "Folder", "Description", "Last Accessed", "Created By"];
    const rows = filtered.map((r) => [
      `"${r.name}"`,
      `"${r.folder}"`,
      `"${r.description}"`,
      `"${formatDate(r.lastAccessedAt)}"`,
      `"${r.createdBy ?? "System"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `betflow_reports_catalog.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardShell
      title="Reports & Analytics Catalog"
      description="Browse, filter, and open live operational analytics reports for your workspace."
      active="Reports"
    >
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              aria-label="Filter reports by folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3.5 pr-9 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 sm:w-56"
            >
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>

          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-slate-500 sm:w-72">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              aria-label="Search all reports"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports by title or description"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="size-3.5 mr-1.5 text-indigo-600" />
            Export Catalog
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-9 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Printer className="size-3.5 mr-1.5 text-slate-500" />
            Print
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {error && (
          <div className="p-4">
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
              {error}
            </p>
          </div>
        )}

        {selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50/70 px-5 py-2.5 text-xs text-slate-700">
            <span className="font-semibold text-indigo-900">{selected.size} selected</span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-indigo-600 hover:underline font-medium ml-2"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-semibold">
              <tr>
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all reports"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="size-3.5 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 font-semibold">Report Name</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Folder</th>
                <th className="px-4 py-3 font-semibold">Last Accessed</th>
                <th className="px-4 py-3 font-semibold">Created By</th>
                <th className="w-16 px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 font-medium">
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id} className="group hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Select ${report.name}`}
                        checked={selected.has(report.id)}
                        onChange={() => toggleRow(report.id)}
                        className="size-3.5 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
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
                                : "text-slate-300 hover:text-amber-400",
                            )}
                          />
                        </button>
                        <Link
                          href={report.href}
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5"
                        >
                          <BarChart3 className="size-4 text-indigo-500 shrink-0" />
                          {report.name}
                        </Link>
                      </div>
                    </td>
                    <td className="max-w-md truncate px-4 py-3 text-slate-600">
                      {report.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {report.folder}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {formatDate(report.lastAccessedAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {report.createdBy ?? "System"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={report.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Open
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-200 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">
              No reports match your filters.
            </p>
          ) : (
            filtered.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={report.href}
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1.5 text-sm"
                  >
                    <BarChart3 className="size-4 text-indigo-500" />
                    {report.name}
                  </Link>
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    <FolderOpen className="size-3" />
                    {report.folder}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{report.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Last accessed {formatDate(report.lastAccessedAt)}</span>
                  <Link href={report.href} className="font-semibold text-indigo-600 hover:underline">
                    View Report &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 font-medium">
          {loading ? "Loading reports…" : `Total Reports: ${filtered.length} ${filtered.length !== reports.length ? `(Filtered from ${reports.length})` : ""}`}
        </div>
      </div>
    </DashboardShell>
  );
}