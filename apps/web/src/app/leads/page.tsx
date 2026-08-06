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
  Share2,
  Webhook,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
  convertedCustomerId: string | null;
  source: LeadSource | null;
  owner: LeadOwner | null;
  aiScore?: {
    score: number;
    intent: "HOT" | "WARM" | "COLD";
    factors: string[];
    suggestedNextAction: string;
    recommendedPriority: "High" | "Medium" | "Low";
  };
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

function SocialSourceBadge({ sourceName }: { sourceName: string | null | undefined }) {
  if (!sourceName) return <span className="text-zinc-400">—</span>;
  const lower = sourceName.toLowerCase();
  let bg = "bg-zinc-100 text-zinc-700 border-zinc-200";
  let icon = "🌐";
  if (lower.includes("facebook") || lower.includes("meta")) {
    bg = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
    icon = "🟦";
  } else if (lower.includes("instagram")) {
    bg = "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 font-semibold";
    icon = "📸";
  } else if (lower.includes("telegram")) {
    bg = "bg-sky-50 text-sky-700 border-sky-200 font-semibold";
    icon = "✈️";
  } else if (lower.includes("referral")) {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
    icon = "🤝";
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${bg}`}>
      <span>{icon}</span>
      <span>{sourceName}</span>
    </span>
  );
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
  const [showSocialDrawer, setShowSocialDrawer] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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
  const [convertLead, setConvertLead] = useState<ApiLead | null>(null);
  const [aiInsightLead, setAiInsightLead] = useState<ApiLead | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

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

  const handleDeleteSingle = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfirmModal({
      isOpen: true,
      title: "Delete Lead Confirmation",
      message: "Are you sure you want to delete this lead? This action cannot be undone.",
      confirmText: "Delete Lead",
      onConfirm: async () => {
        setError(null);
        try {
          await apiFetch(`/leads/${id}`, { method: "DELETE" });
          setLeads((prev) => prev.filter((l) => l.id !== id));
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to delete lead.");
          await loadLeads();
        }
      },
    });
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Batch Delete Leads Confirmation",
      message: `Are you sure you want to delete ${selected.size} selected lead(s)? This action cannot be undone.`,
      confirmText: `Delete ${selected.size} Lead(s)`,
      onConfirm: async () => {
        setBusy(true);
        setError(null);
        const ids = Array.from(selected);
        try {
          await Promise.all(
            ids.map((id) =>
              apiFetch(`/leads/${id}`, { method: "DELETE" }).catch((err) => {
                console.error(`Failed to delete lead ${id}:`, err);
                return null;
              })
            )
          );
          setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
          setSelected(new Set());
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to delete leads.");
          await loadLeads();
        } finally {
          setBusy(false);
        }
      },
    });
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-zinc-200 bg-white px-4 py-3 h-[60px]">
        <div className="flex items-center gap-1">
          <span className="rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
            All Leads
          </span>
          <button
            type="button"
            onClick={() => setShowSocialDrawer((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors border",
              showSocialDrawer
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            )}
          >
            <Webhook className="size-3.5" />
            Social Outreach Webhooks
          </button>
          <div className="mx-1 h-5 w-px bg-zinc-200" />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-zinc-100 transition-colors font-medium",
              showFilters ? "text-indigo-700 bg-indigo-50/50" : "text-zinc-600",
            )}
          >
            <FilterIcon className="size-4" />
            Filter
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-indigo-600 px-1.5 text-xs text-white font-bold">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => toggleSort(sort.key)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <SlidersHorizontal className="size-4" />
            Sort
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-zinc-200">
            <button
              type="button"
              className="rounded-l-md bg-indigo-50 p-1.5 text-indigo-700"
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
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="h-8 bg-[#233b66] hover:bg-[#1d3257] text-white rounded shadow-sm text-[13px] px-4 font-medium"
          >
            <Plus className="size-3.5 mr-1" />
            Create Lead
          </Button>
        </div>
      </div>

      {/* Social Outreach Integration Drawer */}
      {showSocialDrawer && (
        <div className="border-x border-b border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 p-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-blue-600 p-2 text-white shadow-xs">
                <Webhook className="size-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  Social Lead Outreach & Meta Webhook Intake
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">Integrated</span>
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Meta Lead Ads (Facebook & Instagram) and Telegram Bot submissions automatically create leads in this table.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== "undefined"
                    ? `${window.location.origin.replace("3001", "4000")}/api/enterprise/social-leads/meta-webhook`
                    : "/api/enterprise/social-leads/meta-webhook";
                  void navigator.clipboard.writeText(url);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                {copiedUrl ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-slate-400" />}
                <span>{copiedUrl ? "Copied Webhook URL!" : "Copy Meta Callback URL"}</span>
              </button>

              <Link
                href="/integrations/social-leads"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <span>Full Webhook Guide</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

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
                  className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
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
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-indigo-50/60 px-4 py-2 text-sm">
              <span className="font-semibold text-indigo-900">
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
                  <th className="px-4 py-3 font-medium text-purple-700">AI Score</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-zinc-500">
                      Loading leads…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-zinc-500">
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
                          "group hover:bg-zinc-50 transition-colors",
                          isSelected && "bg-indigo-50/50",
                        )}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${fullName(lead)}`}
                            className="size-4 rounded border-zinc-300 accent-indigo-600 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSet(setSelected, lead.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {lead.convertedCustomerId ? (
                            <Link
                              href={`/customers/${lead.convertedCustomerId}`}
                              className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {fullName(lead)}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-indigo-600">
                                {fullName(lead)}
                              </span>
                              {lead.status !== "LOST" && (
                                <button
                                  type="button"
                                  onClick={() => setConvertLead(lead)}
                                  className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 opacity-0 transition hover:border-emerald-300 hover:text-emerald-700 group-hover:opacity-100"
                                >
                                  Convert
                                </button>
                              )}
                            </div>
                          )}
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
                        <td className="px-4 py-3">
                          <SocialSourceBadge sourceName={lead.source?.name} />
                        </td>
                        <td className="px-4 py-3">
                          {lead.convertedCustomerId ? (
                            <span className="rounded-md bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                              Converted
                            </span>
                          ) : (
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
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-zinc-700">
                            <span className="flex size-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600">
                              {initials(ownerName(lead))}
                            </span>
                            {ownerName(lead)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lead.aiScore ? (
                            <button
                              type="button"
                              onClick={() => setAiInsightLead(lead)}
                              className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:scale-105",
                                lead.aiScore.intent === "HOT" &&
                                  "bg-rose-100 text-rose-800 border border-rose-300",
                                lead.aiScore.intent === "WARM" &&
                                  "bg-amber-100 text-amber-800 border border-amber-300",
                                lead.aiScore.intent === "COLD" &&
                                  "bg-blue-100 text-blue-800 border border-blue-300",
                              )}
                              title="Click to view AI Intent Analysis & Next Actions"
                            >
                              <span>
                                {lead.aiScore.intent === "HOT"
                                  ? "🔥"
                                  : lead.aiScore.intent === "WARM"
                                    ? "⚡"
                                    : "🧊"}
                              </span>
                              <span>{lead.aiScore.score}/100</span>
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(lead.id, e)}
                            className="text-zinc-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                            title="Delete lead"
                            aria-label="Delete lead"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
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

      {convertLead ? (
        <ConvertLeadModal
          lead={convertLead}
          onClose={() => setConvertLead(null)}
          onConverted={() => {
            setConvertLead(null);
            void loadLeads();
          }}
        />
      ) : null}

      {aiInsightLead ? (
        <AiInsightsModal
          lead={aiInsightLead}
          onClose={() => setAiInsightLead(null)}
        />
      ) : null}

      {/* Custom Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant="danger"
        loading={busy}
      />
    </DashboardShell>
  );
}

function ConvertLeadModal({
  lead,
  onClose,
  onConverted,
}: {
  lead: ApiLead;
  onClose: () => void;
  onConverted: () => void;
}) {
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  const [createAccount, setCreateAccount] = useState(true);
  const [createDeal, setCreateDeal] = useState(true);
  const [dealName, setDealName] = useState(`${fullName(lead)} - Opportunity`);
  const [dealValue, setDealValue] = useState("50000");
  const [dealStageId, setDealStageId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const s = await apiFetch<{ id: string; name: string }[]>("/deals/stages");
        setStages(s);
        if (s[0]) setDealStageId(s[0].id);
      } catch {
        /* stages optional */
      }
    });
  }, []);

  const accountName = (lead.company?.trim() || fullName(lead)).trim();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/leads/${lead.id}/convert`, {
        method: "POST",
        body: JSON.stringify({
          createAccount,
          deal: createDeal
            ? { name: dealName, value: dealValue, stageId: dealStageId }
            : null,
        }),
      });
      onConverted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Convert Qualified Lead
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transform <span className="font-semibold text-slate-800">{fullName(lead)}</span> into Contact, Account & Deal
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}

          {/* Contact Details Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs space-y-1">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">1. Contact Entity</div>
            <div className="font-semibold text-indigo-900 text-sm">{fullName(lead)}</div>
            <div className="text-slate-600">{lead.email || "No email"} · {lead.phone || "No phone"}</div>
          </div>

          {/* Account Creation Options */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <label className="flex items-start gap-2.5 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
              />
              <div>
                <span>Create linked Account entity:</span>
                <span className="font-bold text-indigo-700 block mt-0.5">“{accountName}”</span>
              </div>
            </label>
          </div>

          {/* Sales Deal Creation Options */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-indigo-900 cursor-pointer">
              <input
                type="checkbox"
                checked={createDeal}
                onChange={(e) => setCreateDeal(e.target.checked)}
                className="size-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
              />
              <span>2. Create Sales Opportunity in Kanban Pipeline</span>
            </label>

            {createDeal && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Opportunity Name *</label>
                  <input
                    required
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500 font-medium"
                    placeholder="Deal name"
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Value ($) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500 font-medium"
                    placeholder="Value"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pipeline Stage *</label>
                  <select
                    required
                    aria-label="Deal stage"
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-indigo-500 font-medium"
                    value={dealStageId}
                    onChange={(e) => setDealStageId(e.target.value)}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving ? "Converting Lead…" : "Convert Lead Now"}
            </Button>
          </div>
        </form>
      </div>
    </div>
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

function AiInsightsModal({
  lead,
  onClose,
}: {
  lead: ApiLead;
  onClose: () => void;
}) {
  const score = lead.aiScore;
  if (!score) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {score.intent === "HOT"
                ? "🔥"
                : score.intent === "WARM"
                  ? "⚡"
                  : "🧊"}
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                AI Intent Analysis
              </h2>
              <p className="text-xs text-zinc-500">
                {lead.firstName} {lead.lastName} ({lead.company || "Individual"})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Score Ring / Badge */}
        <div className="my-5 flex items-center justify-between rounded-lg bg-purple-50/70 p-4 border border-purple-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              Lead Score
            </p>
            <p className="text-3xl font-extrabold text-purple-900 mt-0.5">
              {score.score} <span className="text-sm font-normal text-purple-600">/ 100</span>
            </p>
          </div>
          <div className="text-right">
            <span
              className={cn(
                "inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                score.intent === "HOT" && "bg-rose-600 text-white",
                score.intent === "WARM" && "bg-amber-500 text-white",
                score.intent === "COLD" && "bg-blue-600 text-white",
              )}
            >
              {score.intent} Intent
            </span>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              Priority: <span className="text-zinc-900 font-semibold">{score.recommendedPriority}</span>
            </p>
          </div>
        </div>

        {/* Factors */}
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
            AI Scoring Breakdown Factors
          </h3>
          <ul className="space-y-1.5 text-xs">
            {score.factors.map((factor, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 rounded-md bg-zinc-50 px-2.5 py-1.5 text-zinc-700 border border-zinc-100"
              >
                <span className="size-1.5 rounded-full bg-purple-600 shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Next Action */}
        <div className="mb-5 rounded-lg bg-amber-50/80 p-3.5 border border-amber-200/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
            <span>💡</span> Recommended Smart Action
          </h3>
          <p className="text-xs leading-relaxed text-amber-900/90 font-medium">
            {score.suggestedNextAction}
          </p>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-9"
        >
          Close Insights
        </Button>
      </div>
    </div>
  );
}