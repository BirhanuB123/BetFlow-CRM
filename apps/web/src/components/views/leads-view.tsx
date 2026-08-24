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
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  Plus,
  Search,
  Trash2,
  Pencil,
  UserRoundCheck,
  X,
  Webhook,
  Copy,
  Check,
} from "lucide-react";

import { AccessRestricted } from "@/components/ui/access-restricted";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

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
  diasporaTag?: {
    isDiaspora: boolean;
    originCountry: string;
    flag: string;
    countryCode: string;
  };
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
  NEW: "bg-info/10 text-info",
  CONTACTED: "bg-primary/10 text-primary",
  QUALIFIED: "bg-success/10 text-success",
  FOLLOW_UP: "bg-warning/10 text-warning",
  WON: "bg-success/10 text-success",
  LOST: "bg-destructive/10 text-destructive",
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

function SocialSourceBadge({
  sourceName,
}: {
  sourceName: string | null | undefined;
}) {
  if (!sourceName) return <span className="text-zinc-400">—</span>;
  const lower = sourceName.toLowerCase();
  let bg = "bg-zinc-100 text-zinc-700 border-zinc-200";
  let icon = "🌐";
  if (lower.includes("facebook") || lower.includes("meta")) {
    bg = "bg-info/10 text-info border-info/20 font-semibold";
    icon = "🟦";
  } else if (lower.includes("instagram")) {
    bg = "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 font-semibold";
    icon = "📸";
  } else if (lower.includes("telegram")) {
    bg = "bg-info/10 text-info border-info/20 font-semibold";
    icon = "✈️";
  } else if (lower.includes("referral")) {
    bg = "bg-success/10 text-success border-success/20 font-semibold";
    icon = "🤝";
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${bg}`}
    >
      <span>{icon}</span>
      <span>{sourceName}</span>
    </span>
  );
}

export function LeadsView() {
  const { t } = useTranslation();
  const toast = useToast();
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState<"ALL" | "DIASPORA" | "LOCAL">("ALL");
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
  const [editingLead, setEditingLead] = useState<ApiLead | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

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
      setIsForbidden(false);
      const [leadData, sourceData] = await Promise.all([
        apiFetch<ApiLead[]>("/leads"),
        apiFetch<LeadSource[]>("/leads/sources"),
      ]);
      setLeads(leadData);
      setSources(sourceData);
    } catch (err) {
      if (err instanceof ApiError && err.isForbidden) {
        setIsForbidden(true);
      }
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
      if (originFilter === "DIASPORA" && !lead.diasporaTag?.isDiaspora) return false;
      if (originFilter === "LOCAL" && lead.diasporaTag?.isDiaspora) return false;
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
        lead.diasporaTag?.originCountry ?? "",
        lead.source?.name ?? "",
        ownerName(lead),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [leads, search, originFilter, statusFilter, sourceFilter]);

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

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setCreating(true);
      await apiFetch<ApiLead>("/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Lead created successfully");
      setForm(emptyForm);
      setCreateOpen(false);
      await loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setCreating(false);
    }
  };

  const handleEditOpen = (lead: ApiLead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setEditForm({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      sourceId: lead.source?.id || "",
      status: (lead.status as LeadStatus) || "NEW",
    });
  };

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingLead) return;
    try {
      setBusy(true);
      await apiFetch(`/leads/${editingLead.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      toast.success("Lead updated successfully");
      setEditingLead(null);
      await loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Lead",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Lead",
      onConfirm: async () => {
        try {
          setBusy(true);
          await apiFetch(`/leads/${id}`, { method: "DELETE" });
          toast.success("Lead deleted successfully");
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          await loadLeads();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to delete lead",
          );
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selected.size === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete Selected Leads",
      message: `Are you sure you want to delete ${selected.size} selected leads?`,
      confirmText: `Delete ${selected.size} Leads`,
      onConfirm: async () => {
        try {
          setBusy(true);
          const ids = Array.from(selected);
          await Promise.all(
            ids.map((id) => apiFetch(`/leads/${id}`, { method: "DELETE" })),
          );
          toast.success(`${ids.length} leads deleted`);
          setSelected(new Set());
          await loadLeads();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to delete leads",
          );
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const activeFilterCount =
    (originFilter !== "ALL" ? 1 : 0) + statusFilter.size + sourceFilter.size;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-zinc-200 bg-white px-4 py-3 h-[60px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOriginFilter("ALL")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors border",
              originFilter === "ALL"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50",
            )}
          >
            All Leads
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter("DIASPORA")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors border flex items-center gap-1",
              originFilter === "DIASPORA"
                ? "bg-warning/10 text-warning border-warning/30 font-bold"
                : "bg-warning/10/60 text-warning border-warning/20 hover:bg-warning/10/70",
            )}
          >
            <span>🌍</span> Diaspora Leads
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter("LOCAL")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors border flex items-center gap-1",
              originFilter === "LOCAL"
                ? "bg-success/10 text-success border-success/30 font-bold"
                : "bg-success/10/60 text-success border-success/20 hover:bg-success/10/70",
            )}
          >
            <span>🇪🇹</span> Local Leads
          </button>
          <button
            type="button"
            onClick={() => setShowSocialDrawer((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors border ml-1",
              showSocialDrawer
                ? "bg-info text-white border-info shadow-sm"
                : "bg-info/10 text-info border-info/20 hover:bg-info/10",
            )}
          >
            <Webhook className="size-3.5" />
            Social Webhooks
          </button>
          <div className="mx-1 h-5 w-px bg-zinc-200" />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-zinc-100 transition-colors font-medium",
              showFilters ? "text-primary bg-primary/10" : "text-zinc-600",
            )}
          >
            <FilterIcon className="size-4" />
            Filter
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-primary px-1.5 text-xs text-white font-bold">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setOriginFilter("ALL");
              setStatusFilter(new Set());
              setSourceFilter(new Set());
            }}
            className="text-xs text-zinc-400 hover:text-zinc-600 px-1"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={busy}
              className="h-9 gap-1.5"
            >
              <Trash2 className="size-4" />
              Delete ({selected.size})
            </Button>
          ) : null}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-9 gap-1.5 font-semibold"
          >
            <Plus className="size-4" />
            Create Lead
          </Button>
        </div>
      </div>

      {/* Social Webhook Lead Gen Drawer Banner */}
      {showSocialDrawer ? (
        <div className="rounded-lg border border-info/20 bg-gradient-to-r from-info via-primary/10 to-info p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-info text-white text-xs font-bold">
                  ⚡
                </span>
                <h3 className="text-sm font-bold text-info">
                  Ethio-Real Estate Social Lead Automation Endpoint
                </h3>
              </div>
              <p className="text-xs text-zinc-600 max-w-2xl">
                Automatically ingest leads from Meta Ads (Facebook & Instagram), Telegram Channels, or custom webhooks directly into your sales pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://crm.betflow.app/api/webhooks/social-leads`,
                  );
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-md border border-info/20 bg-white px-3 py-1.5 text-xs font-semibold text-info hover:bg-info/10 shadow-2xs transition-colors"
              >
                {copiedUrl ? (
                  <>
                    <Check className="size-3.5 text-success" />
                    <span>Copied Webhook URL</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Webhook URL</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSocialDrawer(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Filters + Table */}
      <div className="flex gap-4">
        {/* Filter Panel */}
        {showFilters ? (
          <div className="w-56 shrink-0 rounded-lg border border-zinc-200 bg-white p-3 space-y-4 shadow-xs">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
                <span>Lead Status</span>
                {statusFilter.size > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStatusFilter(new Set())}
                    className="text-[10px] text-primary hover:underline font-normal normal-case"
                  >
                    Clear
                  </button>
                ) : null}
              </h4>
              <div className="space-y-1.5">
                {LEAD_STATUSES.map((status) => {
                  const active = statusFilter.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleSet(setStatusFilter, status)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-zinc-600 hover:bg-zinc-50",
                      )}
                    >
                      <span>{titleCase(status)}</span>
                      {active ? (
                        <span className="size-1.5 rounded-full bg-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
                <span>Acquisition Source</span>
                {sourceFilter.size > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSourceFilter(new Set())}
                    className="text-[10px] text-primary hover:underline font-normal normal-case"
                  >
                    Clear
                  </button>
                ) : null}
              </h4>
              <div className="space-y-1.5">
                {sources.map((src) => {
                  const active = sourceFilter.has(src.id);
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => toggleSet(setSourceFilter, src.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left truncate",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-zinc-600 hover:bg-zinc-50",
                      )}
                    >
                      <span className="truncate">{src.name}</span>
                      {active ? (
                        <span className="size-1.5 rounded-full bg-primary shrink-0 ml-1" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* Table Panel */}
        <div className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
          {error ? (
            isForbidden || error.toLowerCase().includes("permission") || error.toLowerCase().includes("forbidden") ? (
              <div className="p-6">
                <AccessRestricted requiredPermission="leads.manage" />
              </div>
            ) : (
              <div className="p-4 text-xs font-medium text-destructive bg-destructive/10 border-b border-destructive/20">
                {error}
              </div>
            )
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-semibold">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            for (const lead of pageRows) next.add(lead.id);
                            return next;
                          });
                        } else {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            for (const lead of pageRows) next.delete(lead.id);
                            return next;
                          });
                        }
                      }}
                      className="rounded border-zinc-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th
                    onClick={() => toggleSort("name")}
                    className="cursor-pointer px-3 py-3 hover:text-zinc-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Lead Name</span>
                      {sort.key === "name" ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : (
                          <ArrowDown className="size-3 text-primary" />
                        )
                      ) : null}
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("company")}
                    className="cursor-pointer px-3 py-3 hover:text-zinc-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Company / Organization</span>
                      {sort.key === "company" ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : (
                          <ArrowDown className="size-3 text-primary" />
                        )
                      ) : null}
                    </div>
                  </th>
                  <th className="px-3 py-3">Origin / Region</th>
                  <th
                    onClick={() => toggleSort("source")}
                    className="cursor-pointer px-3 py-3 hover:text-zinc-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Channel Source</span>
                      {sort.key === "source" ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : (
                          <ArrowDown className="size-3 text-primary" />
                        )
                      ) : null}
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("status")}
                    className="cursor-pointer px-3 py-3 hover:text-zinc-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status Stage</span>
                      {sort.key === "status" ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : (
                          <ArrowDown className="size-3 text-primary" />
                        )
                      ) : null}
                    </div>
                  </th>
                  <th className="px-3 py-3">AI Score & Action</th>
                  <th
                    onClick={() => toggleSort("owner")}
                    className="cursor-pointer px-3 py-3 hover:text-zinc-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Assignee</span>
                      {sort.key === "owner" ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3 text-primary" />
                        ) : (
                          <ArrowDown className="size-3 text-primary" />
                        )
                      ) : null}
                    </div>
                  </th>
                  <th className="w-20 px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      Loading demand pipeline...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      No leads match the active filters or search criteria.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((lead) => {
                    const isSelected = selected.has(lead.id);
                    const isDiaspora = lead.diasporaTag?.isDiaspora;

                    return (
                      <tr
                        key={lead.id}
                        className={cn(
                          "transition-colors hover:bg-zinc-50/80 group",
                          isSelected && "bg-primary/5",
                        )}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSet(setSelected, lead.id)}
                            className="rounded border-zinc-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-3 font-semibold text-zinc-900">
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-extrabold shrink-0">
                              {initials(fullName(lead))}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-zinc-900">
                                {fullName(lead)}
                              </p>
                              {lead.email || lead.phone ? (
                                <p className="truncate text-[11px] text-zinc-400 font-normal">
                                  {[lead.phone, lead.email].filter(Boolean).join(" · ")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-zinc-600 font-medium">
                          {lead.company || "—"}
                        </td>
                        <td className="px-3 py-3">
                          {isDiaspora ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-bold text-warning border border-warning/20">
                              <span>{lead.diasporaTag?.flag || "🌍"}</span>
                              <span>{lead.diasporaTag?.originCountry}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success border border-success/20/60">
                              <span>🇪🇹</span> Local Ethiopia
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <SocialSourceBadge sourceName={lead.source?.name} />
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-block rounded-md px-2 py-0.5 text-xs font-bold border border-current/20",
                              statusClass[lead.status] || "bg-zinc-100 text-zinc-700",
                            )}
                          >
                            {titleCase(lead.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {lead.aiScore ? (
                            <button
                              type="button"
                              onClick={() => setAiInsightLead(lead)}
                              className="group/ai flex items-center gap-1.5 text-left hover:opacity-90"
                            >
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[11px] font-extrabold text-white",
                                  lead.aiScore.intent === "HOT" && "bg-destructive",
                                  lead.aiScore.intent === "WARM" && "bg-warning",
                                  lead.aiScore.intent === "COLD" && "bg-info",
                                )}
                              >
                                {lead.aiScore.score}
                              </span>
                              <span className="text-[11px] font-semibold text-info underline underline-offset-2 decoration-purple-300 group-hover/ai:decoration-purple-600">
                                {lead.aiScore.intent}
                              </span>
                            </button>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 font-medium">
                          {ownerName(lead)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!lead.convertedCustomerId ? (
                              <button
                                type="button"
                                title="Convert to Customer"
                                onClick={() => setConvertLead(lead)}
                                className="rounded p-1 text-success hover:bg-success/10 hover:text-success transition-colors"
                              >
                                <UserRoundCheck className="size-4" />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              title="Edit Lead"
                              onClick={(e) => handleEditOpen(lead, e)}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              title="Delete Lead"
                              onClick={() => handleDelete(lead.id, fullName(lead))}
                              className="rounded p-1 text-zinc-400 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-4 py-3 text-xs text-zinc-600">
            <p>
              Showing {sorted.length === 0 ? 0 : currentPage * PAGE_SIZE + 1} to{" "}
              {Math.min((currentPage + 1) * PAGE_SIZE, sorted.length)} of{" "}
              <span className="font-semibold text-zinc-900">{sorted.length}</span> leads
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="h-8 size-8 p-0"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-2 font-medium text-zinc-700">
                Page {currentPage + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={currentPage >= pageCount - 1}
                className="h-8 size-8 p-0"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Lead Modal */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Plus className="size-5 text-primary" />
                Add New Demand Lead
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Abebe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Bikila"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="abebe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="+251 91 123 4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Bole Real Estate Group"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Lead Source Channel
                  </label>
                  <select
                    value={form.sourceId}
                    onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Select source...</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Initial Status Stage
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as LeadStatus })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {titleCase(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="font-semibold"
                >
                  {creating ? "Creating..." : "Save Lead"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Lead Modal */}
      {editingLead ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Pencil className="size-4 text-primary" />
                Edit Lead: {fullName(editingLead)}
              </h2>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) =>
                    setEditForm({ ...editForm, company: e.target.value })
                  }
                  className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={editForm.sourceId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sourceId: e.target.value })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Select source...</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Status Stage
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as LeadStatus,
                      })
                    }
                    className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {titleCase(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLead(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={busy}
                  className="font-semibold"
                >
                  {busy ? "Saving..." : "Update Lead"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Convert Lead to Customer Modal */}
      {convertLead ? (
        <LeadConvertModal
          lead={convertLead}
          onClose={() => setConvertLead(null)}
          onConverted={async () => {
            setConvertLead(null);
            await loadLeads();
          }}
        />
      ) : null}

      {/* AI Intent Insights Drawer */}
      {aiInsightLead ? (
        <AiScoringDrawer
          lead={aiInsightLead}
          onClose={() => setAiInsightLead(null)}
        />
      ) : null}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={async () => {
          await confirmModal.onConfirm();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

function LeadConvertModal({
  lead,
  onClose,
  onConverted,
}: {
  lead: ApiLead;
  onClose: () => void;
  onConverted: () => void;
}) {
  const toast = useToast();
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    try {
      setConverting(true);
      await apiFetch(`/leads/${lead.id}/convert`, { method: "POST" });
      toast.success(
        `Successfully converted "${lead.firstName} ${lead.lastName}" to a Customer contact!`,
      );
      onConverted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to convert lead",
      );
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <UserRoundCheck className="size-5 text-success" />
            Convert Lead to Customer
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Converting <strong className="text-zinc-900">{fullName(lead)}</strong> will automatically create a new active Customer profile, copy all contact information, and update the lead status to <strong className="text-success font-semibold">WON</strong>.
        </p>
        <div className="rounded-lg bg-success/10 p-3 text-xs text-success border border-success/20">
          <p className="font-bold mb-1">Target Customer Details:</p>
          <ul className="space-y-0.5 text-[11px] text-success">
            <li>• Name: {fullName(lead)}</li>
            <li>• Email: {lead.email || "N/A"}</li>
            <li>• Phone: {lead.phone || "N/A"}</li>
            <li>• Organization: {lead.company || "Individual"}</li>
          </ul>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConvert}
            disabled={converting}
            className="font-semibold"
          >
            {converting ? "Converting..." : "Confirm & Convert"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AiScoringDrawer({
  lead,
  onClose,
}: {
  lead: ApiLead;
  onClose: () => void;
}) {
  const score = lead.aiScore;
  if (!score) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-zinc-200 bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
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
      <div className="my-5 flex items-center justify-between rounded-lg bg-info/10/70 p-4 border border-info">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-info">
            Lead Score
          </p>
          <p className="text-3xl font-extrabold text-info mt-0.5">
            {score.score}{" "}
            <span className="text-sm font-normal text-info">/ 100</span>
          </p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              score.intent === "HOT" && "bg-destructive text-white",
              score.intent === "WARM" && "bg-warning text-white",
              score.intent === "COLD" && "bg-info text-white",
            )}
          >
            {score.intent} Intent
          </span>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Priority:{" "}
            <span className="text-zinc-900 font-semibold">
              {score.recommendedPriority}
            </span>
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
              <span className="size-1.5 rounded-full bg-info shrink-0" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Next Action */}
      <div className="mb-5 rounded-lg bg-warning/10 p-3.5 border border-warning/20/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warning mb-1 flex items-center gap-1.5">
          <span>💡</span> Recommended Smart Action
        </h3>
        <p className="text-xs leading-relaxed text-warning/90 font-medium">
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
  );
}
