"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen, Search, Star } from "lucide-react";

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
    queueMicrotask(() => {
      void loadReports();
    });
  }, [loadReports]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter(
      (report) =>
        report.name.toLowerCase().includes(term) ||
        report.description.toLowerCase().includes(term) ||
        report.folder.toLowerCase().includes(term),
    );
  }, [reports, query]);

  return (
    <DashboardShell
      title="Reports"
      description="Browse and open analytics reports for your workspace."
      active="Reports"
    >
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">All Reports</h2>
            <p className="text-sm text-zinc-500">
              {loading
                ? "Loading reports…"
                : `${filtered.length} of ${reports.length} reports`}
            </p>
          </div>
          <label className="flex h-9 w-full items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-zinc-500 sm:w-72">
            <Search className="size-4 shrink-0" />
            <input
              aria-label="Search reports"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search all reports"
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            />
          </label>
        </div>

        {error ? (
          <div className="p-4">
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          </div>
        ) : null}

        {/* Desktop / tablet table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Report Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Folder</th>
                <th className="px-4 py-3 font-medium">Last Accessed Date</th>
                <th className="px-4 py-3 font-medium">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                    No reports match “{query}”.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id} className="group hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Star className="size-4 shrink-0 text-zinc-300 group-hover:text-amber-400" />
                        <Link
                          href={report.href}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {report.name}
                        </Link>
                      </div>
                    </td>
                    <td className="max-w-md px-4 py-3 text-zinc-600">
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
              No reports match “{query}”.
            </p>
          ) : (
            filtered.map((report) => (
              <Link
                key={report.id}
                href={report.href}
                className="block p-4 hover:bg-zinc-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-blue-600">{report.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600">
                    <FolderOpen className="size-3" />
                    {report.folder}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{report.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Last accessed {formatDate(report.lastAccessedAt)}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}