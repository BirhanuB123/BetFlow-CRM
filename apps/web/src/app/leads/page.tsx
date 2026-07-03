"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  LayoutGrid,
  List,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "FOLLOW_UP",
  "WON",
  "LOST",
] as const;

type LeadStatus = (typeof LEAD_STATUSES)[number];

type LeadSource = { id: string; name: string };
type LeadOwner = { id: string; firstName: string; lastName: string };

type ApiLead = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  source: LeadSource | null;
  owner: LeadOwner | null;
};

type SortKey = "name" | "company" | "email" | "source" | "status" | "owner";

const statusClass: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-indigo-50 text-indigo-700",
  QUALIFIED: "bg-emerald-50 text-emerald-700",
  FOLLOW_UP: "bg-amber-50 text-amber-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-rose-50 text-rose-700",
};

const PAGE_SIZE = 10;
const emptyForm = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "",
  sourceId: "",
  status: "NEW" as LeadStatus,
};

function titleCase(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function fullName(lead: ApiLead) {
  return `${lead.firstName} ${lead.lastName}`.trim();
}

function ownerName(lead: ApiLead) {
  if (!lead.owner) return "—";
  return `${lead.owner.firstName} ${lead.owner.lastName}`.trim();
}

function initials(text: string) {
  const parts = text.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      setError(null);
      const [leadData, sourceData] = await Promise.all([
        apiFetch<ApiLead[]>("/leads"),
        apiFetch<LeadSource[]>("/leads/sources"),
      ]);
      setLeads(leadData);
      setSources(sourceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadLeads();
    });
  }, [loadLeads]);

  const toggleSet = (
    setState: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string,
  ) => {
    setState((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setPage(0);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter.size > 0 && !statusFilter.has(lead.status)) return false;
      if (sourceFilter.size > 0 && !sourceFilter.has(lead.source?.id ?? "")) {
        return false;
      }
      if (!term) return true;
      return [
        fullName(lead),
        lead.company ?? "",
        lead.email ?? "",
        lead.phone ?? "",
        lead.source?.name ?? "",
        ownerName(lead),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const sorted = useMemo(() => {
    const value = (lead: ApiLead) => {
      switch (sort.key) {
        case "company":
          return lead.company ?? "";
        case "email":
          return lead.email ?? "";
        case "source":
          return lead.source?.name ?? "";
        case "status":
          return lead.status;
        case "owner":
          return ownerName(lead);
        default:
          return fullName(lead);
      }
    };
    return [...filtered].sort((a, b) => {
      const cmp = value(a).localeCompare(value(b), undefined, {
        sensitivity: "base",
      });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((lead) => selected.has(lead.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageRows.forEach((lead) => next.delete(lead.id));
      } else {
        pageRows.forEach((lead) => next.add(lead.id));
      }
      return next;
    });
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(new Set());
    setSourceFilter(new Set());
    setPage(0);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiFetch<ApiLead>("/leads", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          sourceId: form.sourceId || undefined,
        }),
      });
      setForm(emptyForm);
      setCreateOpen(false);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setError(null);
    try {
      await apiFetch<ApiLead>(`/leads/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete ${selected.size} lead(s)? This cannot be undone.`)
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await Promise.all(
        [...selected].map((id) =>
          apiFetch(`/leads/${id}`, { method: "DELETE" }),
        ),
      );
      setSelected(new Set());
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete leads.");
    } finally {
      setBusy(false);
    }
  };

  const activeFilterCount =
    statusFilter.size + sourceFilter.size + (search.trim() ? 1 : 0);

  const rangeStart = sorted.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(sorted.length, (currentPage + 1) * PAGE_SIZE);

  return (
    <DashboardShell
      title="Leads"
      description="Capture, qualify, and assign incoming demand."
      active="Leads"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-zinc-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            All Leads
          </span>
          <button
            type="button"
            className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100"
            aria-label="More views"
          >
            …
          </button>
          <div className="mx-1 h-5 w-px bg-zinc-200" />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-zinc-100",
              showFilters ? "text-blue-700" : "text-zinc-600",
            )}
          >
            <FilterIcon className="size-4" />
            Filter
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-blue-600 px-1.5 text-xs text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => toggleSort(sort.key)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            <SlidersHorizontal className="size-4" />
            Sort
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-zinc-200">
            <button
              type="button"
              className="rounded-l-md bg-blue-50 p-1.5 text-blue-700"
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              className="rounded-r-md p-1.5 text-zinc-400 hover:bg-zinc-100"
              aria-label="Kanban view"
              title="Kanban view (coming soon)"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
          <Button className="h-9" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Lead
          </Button>
        </div>
      </div>

      {error ? (
        <p className="border-x border-zinc-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex items-stretch">
        {/* Filter rail */}
        {showFilters ? (
          <aside className="hidden w-60 shrink-0 border border-r-0 border-zinc-200 bg-white lg:block">
            <div className="border-b border-zinc-200 p-3">
              <p className="mb-2 text-sm font-semibold text-zinc-700">
                Filter Leads by
              </p>
              <label className="flex h-8 items-center gap-2 rounded-md border border-zinc-200 px-2 text-zinc-500">
                <Search className="size-4" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search"
                  className="w-full bg-transparent text-sm text-zinc-800 outline-none"
                />
              </label>
            </div>

            <div className="border-b border-zinc-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Status
              </p>
              <div className="space-y-1.5">
                {LEAD_STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-zinc-300"
                      checked={statusFilter.has(status)}
                      onChange={() => toggleSet(setStatusFilter, status)}
                    />
                    {titleCase(status)}
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Lead Source
              </p>
              <div className="space-y-1.5">
                {sources.length === 0 ? (
                  <p className="text-sm text-zinc-400">No sources</p>
                ) : (
                  sources.map((source) => (
                    <label
                      key={source.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-zinc-300"
                        checked={sourceFilter.has(source.id)}
                        onChange={() => toggleSet(setSourceFilter, source.id)}
                      />
                      {source.name}
                    </label>
                  ))
                )}
              </div>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          </aside>
        ) : null}

        {/* Table area */}
        <section className="min-w-0 flex-1 border border-zinc-200 bg-white">
          {/* Selection bar */}
          {selected.size > 0 ? (
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-blue-50 px-4 py-2 text-sm">
              <span className="font-medium text-blue-800">
                {selected.size} selected
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-2.5 py-1 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-zinc-500 hover:text-zinc-700"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      className="size-4 rounded border-zinc-300"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <SortableTh
                    label="Lead Name"
                    active={sort.key === "name"}
                    dir={sort.dir}
                    onClick={() => toggleSort("name")}
                  />
                  <SortableTh
                    label="Company"
                    active={sort.key === "company"}
                    dir={sort.dir}
                    onClick={() => toggleSort("company")}
                  />
                  <SortableTh
                    label="Email"
                    active={sort.key === "email"}
                    dir={sort.dir}
                    onClick={() => toggleSort("email")}
                  />
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <SortableTh
                    label="Lead Source"
                    active={sort.key === "source"}
                    dir={sort.dir}
                    onClick={() => toggleSort("source")}
                  />
                  <SortableTh
                    label="Status"
                    active={sort.key === "status"}
                    dir={sort.dir}
                    onClick={() => toggleSort("status")}
                  />
                  <SortableTh
                    label="Lead Owner"
                    active={sort.key === "owner"}
                    dir={sort.dir}
                    onClick={() => toggleSort("owner")}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                      Loading leads…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-zinc-500">
                      {leads.length === 0
                        ? "No leads yet. Create your first one."
                        : "No leads match your filters."}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((lead) => {
                    const isSelected = selected.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={cn(
                          "group hover:bg-zinc-50",
                          isSelected && "bg-blue-50/60",
                        )}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${fullName(lead)}`}
                            className="size-4 rounded border-zinc-300"
                            checked={isSelected}
                            onChange={() => toggleSet(setSelected, lead.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">
                            {fullName(lead)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {lead.company ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {lead.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {lead.phone ? (
                            <span className="flex items-center gap-2">
                              {lead.phone}
                              <a
                                href={`tel:${lead.phone}`}
                                className="text-zinc-300 hover:text-emerald-600 group-hover:text-zinc-400"
                                aria-label={`Call ${fullName(lead)}`}
                              >
                                <Phone className="size-3.5" />
                              </a>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {lead.source?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className={cn(
                              "cursor-pointer rounded-md px-2 py-1 text-xs font-medium outline-none",
                              statusClass[lead.status] ??
                                "bg-zinc-100 text-zinc-700",
                            )}
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value as LeadStatus,
                              )
                            }
                          >
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {titleCase(status)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-zinc-700">
                            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600">
                              {initials(ownerName(lead))}
                            </span>
                            {ownerName(lead)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-2.5 text-sm text-zinc-600">
            <span>
              Total Records <span className="font-semibold">{sorted.length}</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">
                {rangeStart} to {rangeEnd}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-md border border-zinc-200 p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() =>
                    setPage((p) => Math.min(pageCount - 1, p + 1))
                  }
                  className="rounded-md border border-zinc-200 p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {createOpen ? (
        <CreateLeadModal
          form={form}
          setForm={setForm}
          sources={sources}
          creating={creating}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}
    </DashboardShell>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 hover:text-zinc-800",
          active && "text-zinc-800",
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : null}
      </button>
    </th>
  );
}

function CreateLeadModal({
  form,
  setForm,
  sources,
  creating,
  onClose,
  onSubmit,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  sources: LeadSource[];
  creating: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const field = (key: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 className="text-base font-semibold text-zinc-900">Create Lead</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 p-5 sm:grid-cols-2">
          <Labeled label="First name" required>
            <input
              className="input"
              value={form.firstName}
              onChange={field("firstName")}
              required
            />
          </Labeled>
          <Labeled label="Last name" required>
            <input
              className="input"
              value={form.lastName}
              onChange={field("lastName")}
              required
            />
          </Labeled>
          <Labeled label="Company">
            <input
              className="input"
              value={form.company}
              onChange={field("company")}
            />
          </Labeled>
          <Labeled label="Email">
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={field("email")}
            />
          </Labeled>
          <Labeled label="Phone">
            <input
              className="input"
              value={form.phone}
              onChange={field("phone")}
            />
          </Labeled>
          <Labeled label="Lead source">
            <select
              className="input"
              value={form.sourceId}
              onChange={field("sourceId")}
            >
              <option value="">— None —</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Status">
            <select
              className="input"
              value={form.status}
              onChange={field("status")}
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {titleCase(status)}
                </option>
              ))}
            </select>
          </Labeled>

          <div className="col-span-full mt-1 flex justify-end gap-2 border-t border-zinc-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-9" disabled={creating}>
              {creating ? "Saving…" : "Save Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Labeled({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-600">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}