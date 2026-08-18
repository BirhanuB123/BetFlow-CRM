"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Send,
  Share2,
  Sparkles,
  Users,
  MessageSquare,
  Radio,
  CheckCircle2,
  Plus,
  X,
  ExternalLink,
  Eye,
  Megaphone,
  Search,
  Filter,
  Copy,
  Building2,
  Clock,
  Flame,
  Check,
  Smartphone,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

type BroadcastCampaign = {
  id: string;
  title: string;
  channel: "TELEGRAM" | "FACEBOOK" | "SMS" | "WHATSAPP";
  segment: string;
  recipients: number;
  sentAt: string;
  clicks: number;
  status: "SENT" | "SCHEDULED" | "DRAFT";
  messagePreview?: string;
};

const INITIAL_CAMPAIGNS: BroadcastCampaign[] = [
  {
    id: "bc-001",
    title: "Bole Tower Site Progress & 80% Completion Milestone Update",
    channel: "TELEGRAM",
    segment: "All Telegram Channel Subscribers (2,450)",
    recipients: 2450,
    sentAt: "2026-07-20T10:30:00Z",
    clicks: 680,
    status: "SENT",
    messagePreview:
      "🏢 Bole Tower Construction Update: We have officially reached 80% structural completion! Roofing and window fitting are currently underway. 3-Bed corner units now available for reservation.",
  },
  {
    id: "bc-002",
    title: "Exclusive Launch: 3-Bedroom Penthouse Units in Kazanchis",
    channel: "TELEGRAM",
    segment: "Qualified Diaspora Buyers (420)",
    recipients: 420,
    sentAt: "2026-07-15T14:00:00Z",
    clicks: 195,
    status: "SENT",
    messagePreview:
      "🔥 Exclusive Diaspora Launch: Luxury 3-Bedroom Penthouses in Kazanchis with panoramic Addis views. 30% Downpayment, USD / EUR payment support, 24 months interest-free installments.",
  },
  {
    id: "bc-003",
    title: "CBE 30/70 Mortgage Pro-Forma Application Guidance",
    channel: "SMS",
    segment: "Active Reservation Clients (88)",
    recipients: 88,
    sentAt: "2026-07-10T09:15:00Z",
    clicks: 64,
    status: "SENT",
    messagePreview:
      "🏦 BetFlow Reminder: Final deadline to submit CBE 30/70 bank mortgage pro-forma paperwork for your reserved unit is next Friday. Tap link for step-by-step checklist.",
  },
];

const channelConfig: Record<
  BroadcastCampaign["channel"],
  { label: string; badge: string; icon: typeof Send }
> = {
  TELEGRAM: {
    label: "Telegram Channel",
    badge: "bg-sky-50 text-sky-700 border-sky-200 font-bold",
    icon: Send,
  },
  SMS: {
    label: "SMS Direct Alert",
    badge: "bg-purple-50 text-purple-700 border-purple-200 font-medium",
    icon: Smartphone,
  },
  FACEBOOK: {
    label: "Meta Lead Broadcast",
    badge: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
    icon: Share2,
  },
  WHATSAPP: {
    label: "WhatsApp Business Bot",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
    icon: MessageSquare,
  },
};

export default function SocialBroadcastsPage() {
  const { success, error: toastError } = useToast();
  const [campaigns, setCampaigns] =
    useState<BroadcastCampaign[]>(INITIAL_CAMPAIGNS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState(false);
  const [activePreviewModal, setActivePreviewModal] =
    useState<BroadcastCampaign | null>(null);

  const [form, setForm] = useState({
    title: "",
    channel: "TELEGRAM" as BroadcastCampaign["channel"],
    segment: "All Telegram Channel Subscribers",
    message: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/campaigns");
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((item, idx): BroadcastCampaign => {
          const rawChannel = String(item.channel || item.type || "TELEGRAM").toUpperCase();
          const validChannel: BroadcastCampaign["channel"] = (
            ["TELEGRAM", "SMS", "FACEBOOK", "WHATSAPP"] as const
          ).includes(rawChannel as any)
            ? (rawChannel as BroadcastCampaign["channel"])
            : "TELEGRAM";

          return {
            id: item.id || `bc-api-${idx}`,
            title: item.title || item.name || "Untitled Broadcast",
            channel: validChannel,
            segment: item.segment || "All Subscribers",
            recipients: typeof item.recipients === "number" ? item.recipients : 0,
            sentAt: item.sentAt || item.createdAt || new Date().toISOString(),
            clicks: typeof item.clicks === "number" ? item.clicks : 0,
            status: item.status || "SENT",
            messagePreview: item.messagePreview || item.description || "",
          };
        });
        setCampaigns(normalized);
      }
    } catch {
      // Retain fallback campaigns if API is unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        !debouncedSearch.trim() ||
        c.title.toLowerCase().includes(debouncedSearch.trim().toLowerCase()) ||
        c.segment.toLowerCase().includes(debouncedSearch.trim().toLowerCase());

      const matchChannel =
        channelFilter === "ALL" || c.channel === channelFilter;

      return matchSearch && matchChannel;
    });
  }, [campaigns, debouncedSearch, channelFilter]);

  const handleLaunchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const created = await apiFetch<BroadcastCampaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          channel: form.channel,
          segment: form.segment,
          message: form.message,
        }),
      });

      setCampaigns([created, ...campaigns]);
      success(`Broadcast "${form.title}" launched successfully!`);
      setForm({
        title: "",
        channel: "TELEGRAM",
        segment: "All Telegram Channel Subscribers",
        message: "",
      });
      setShowComposer(false);
    } catch (err) {
      toastError("Failed to launch broadcast campaign");
    } finally {
      setSending(false);
    }
  };

  const handleApplyTemplate = (title: string, message: string) => {
    setForm((f) => ({
      ...f,
      title,
      message,
    }));
  };

  return (
    <DashboardShell
      title="Social Outreach Broadcasts"
      description="Connect real estate Telegram channels, Meta Lead Ads, and launch broadcast updates directly to property buyers."
      active="Social Outreach"
    >
      <div className="space-y-6">
        {/* Uniform Section Header & Toolbar */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#233b66]/10 text-[#233b66]">
                  <Megaphone className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Telegram & Social Outreach Engine
                  </h2>
                  <p className="text-xs text-slate-500">
                    Broadcast construction progress, new floor plan launches, and pro-forma invoice guides directly to Ethiopian property buyers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative min-w-[220px] flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search broadcasts…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#233b66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#233b66] transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Compose Button */}
              <Button
                onClick={() => setShowComposer((v) => !v)}
                className="bg-[#233b66] hover:bg-[#1d3257] text-white font-medium text-xs h-9.5 px-4 shadow-sm flex items-center gap-1.5 transition-all"
              >
                {showComposer ? (
                  <X className="size-4 mr-1" />
                ) : (
                  <Plus className="size-4 mr-1" />
                )}
                {showComposer ? "Cancel Broadcast" : "New Telegram Broadcast"}
              </Button>
            </div>
          </div>

          {/* Broadcast Composer Panel */}
          {showComposer && (
            <form
              onSubmit={handleLaunchBroadcast}
              className="mt-6 rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/60 via-indigo-50/20 to-slate-50/50 p-5 shadow-inner transition-all"
            >
              <div className="flex items-center justify-between border-b border-sky-200/60 pb-3 mb-4">
                <h3 className="text-xs font-bold text-[#233b66] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="size-4 text-sky-600" />
                  Compose Social Outreach & Channel Broadcast
                </h3>
                <span className="text-[11px] font-semibold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Target Reach: {form.channel === "TELEGRAM" ? "2,450 Telegram Channel Members" : "420 Buyers"}
                </span>
              </div>

              {/* Quick Template Chips */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  Quick Templates:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate(
                      "Bole Tower 85% Construction Milestone Update",
                      "🏢 Bole Tower Construction Update: Structural framing is 85% complete! Window installation underway. Reserve remaining 2 & 3 bedroom apartments now.",
                    )
                  }
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:border-[#233b66] hover:text-[#233b66] transition-colors shadow-2xs"
                >
                  🏢 Construction Milestone
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate(
                      "New Launch: Luxury Penthouses in Kazanchis",
                      "🔥 Exclusive Launch: Luxury 3-Bedroom Penthouse Units in Kazanchis. 30% Downpayment with flexible 24-month interest-free installment schedule.",
                    )
                  }
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:border-[#233b66] hover:text-[#233b66] transition-colors shadow-2xs"
                >
                  🔥 Penthouse Launch
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate(
                      "CBE 30/70 Mortgage Pro-Forma Document Checklist",
                      "🏦 CBE 30/70 Bank Mortgage Guidance: Download our updated step-by-step document checklist to get bank pre-approval within 14 days.",
                    )
                  }
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:border-[#233b66] hover:text-[#233b66] transition-colors shadow-2xs"
                >
                  🏦 CBE Mortgage Guide
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Broadcast Headline / Project Title *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Bole Tower 80% Construction Milestone & New 2-Bed Unit Availability"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Broadcast Channel
                      </label>
                      <select
                        value={form.channel}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            channel: e.target
                              .value as BroadcastCampaign["channel"],
                          })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs font-medium"
                      >
                        <option value="TELEGRAM">
                          Telegram Channel (@BetFlowRealEstate)
                        </option>
                        <option value="SMS">SMS Direct Alerts</option>
                        <option value="FACEBOOK">
                          Facebook & Instagram Lead Broadcast
                        </option>
                        <option value="WHATSAPP">
                          WhatsApp Business Bot Broadcast
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Buyer Segment
                      </label>
                      <select
                        value={form.segment}
                        onChange={(e) =>
                          setForm({ ...form, segment: e.target.value })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] shadow-2xs font-medium"
                      >
                        <option value="All Telegram Channel Subscribers">
                          All Telegram Subscribers (2,450 Buyers)
                        </option>
                        <option value="Qualified Diaspora Buyers">
                          Qualified Diaspora Buyers (420 Buyers)
                        </option>
                        <option value="Active Reservation Clients">
                          Active Reservation Clients (88 Buyers)
                        </option>
                        <option value="Unassigned Web Leads">
                          Unassigned Web Inquiries (610 Leads)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message Body (Amharic & English Supported)
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="e.g. 🏢 Bole Penthouse Units Now Open! 📍 Prime location in Bole Medhanialem. 30% Downpayment with 24 months interest-free installment plan."
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] font-mono leading-relaxed shadow-2xs"
                    />
                  </div>
                </div>

                {/* Live Channel Post Preview Mockup */}
                <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
                      <div className="flex size-7 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-[10px]">
                        BF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          BetFlow Real Estate Ethiopia
                        </p>
                        <p className="text-[10px] text-sky-600 font-medium">
                          @BetFlowRealEstate · 2,450 channel members
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-sky-50/60 p-3 text-xs text-slate-800 font-mono leading-relaxed border border-sky-100 min-h-[140px]">
                      {form.title ? (
                        <>
                          <p className="font-bold text-slate-900 mb-1">
                            {form.title}
                          </p>
                          <p className="whitespace-pre-line text-slate-700">
                            {form.message ||
                              "Compose message above to see live preview…"}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic">
                          Live Telegram Post Preview will render here as you type…
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    <span>📢 Channel Broadcast</span>
                    <span>Just now</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-sky-200/80 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowComposer(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sending}
                  className="bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs h-9 px-6 shadow-sm gap-1.5"
                >
                  <Send className="size-3.5" />
                  {sending ? "Broadcasting…" : "Send Social Broadcast"}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Broadcast History Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {/* Table Toolbar & Channel Filters */}
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setChannelFilter("ALL")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  channelFilter === "ALL"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <Filter className="size-3.5" />
                All Channels ({campaigns.length})
              </button>

              <button
                onClick={() => setChannelFilter("TELEGRAM")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  channelFilter === "TELEGRAM"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <Send className="size-3.5 text-sky-500" />
                Telegram (
                {campaigns.filter((c) => c.channel === "TELEGRAM").length})
              </button>

              <button
                onClick={() => setChannelFilter("SMS")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5",
                  channelFilter === "SMS"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70",
                )}
              >
                <Smartphone className="size-3.5 text-purple-500" />
                SMS Direct (
                {campaigns.filter((c) => c.channel === "SMS").length})
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredCampaigns.length}</span> of {campaigns.length} broadcasts
            </div>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No social broadcasts found"
                description={
                  search
                    ? `No broadcasts match "${search}". Try adjusting your search term.`
                    : "Click 'New Telegram Broadcast' to compose and send updates to your prospective property buyers."
                }
                actionText={search ? "Clear Search" : "New Telegram Broadcast"}
                onAction={() => (search ? setSearch("") : setShowComposer(true))}
                icon={Megaphone}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Broadcast Title</th>
                    <th className="px-5 py-3.5">Channel</th>
                    <th className="px-5 py-3.5">Target Segment</th>
                    <th className="px-5 py-3.5">Recipients</th>
                    <th className="px-5 py-3.5">Engagements & CTR</th>
                    <th className="px-5 py-3.5">Date Sent</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map((c) => {
                    const channelCfg =
                      channelConfig[c.channel] || channelConfig.TELEGRAM;
                    const ChannelIcon = channelCfg.icon;
                    const ctrPercent = Math.round(
                      ((c.clicks || 0) / Math.max(1, c.recipients || 0)) * 100,
                    );

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="max-w-md">
                            <p className="font-bold text-slate-900 text-xs truncate">
                              {c.title}
                            </p>
                            {c.messagePreview && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {c.messagePreview}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] border shadow-2xs",
                              channelCfg.badge,
                            )}
                          >
                            <ChannelIcon className="size-3.5 shrink-0" />
                            {c.channel || "TELEGRAM"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                          {c.segment}
                        </td>

                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {c.recipients.toLocaleString()} buyers
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                              <span>{c.clicks} clicks</span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {ctrPercent}% CTR
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, ctrPercent * 2)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-medium text-slate-600 font-mono text-xs">
                          {new Date(c.sentAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" />{" "}
                            {c.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActivePreviewModal(c)}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-[#233b66] hover:text-white transition-colors"
                              title="Preview Broadcast Message"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setForm({
                                  title: `Re: ${c.title}`,
                                  channel: c.channel,
                                  segment: c.segment,
                                  message: c.messagePreview ?? "",
                                });
                                setShowComposer(true);
                                success("Broadcast copied into composer!");
                              }}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-[#233b66] hover:text-white transition-colors"
                              title="Duplicate Broadcast"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Broadcast Preview Modal */}
        {activePreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-5 text-[#233b66]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Broadcast Post Details
                  </h3>
                </div>
                <button
                  onClick={() => setActivePreviewModal(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Broadcast Title
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {activePreviewModal.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Channel
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {activePreviewModal.channel}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Audience
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {activePreviewModal.recipients.toLocaleString()} Buyers
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
                  <p className="text-[11px] font-bold text-sky-900 mb-1.5">
                    Message Body Sent to Channel:
                  </p>
                  <p className="text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-sky-100">
                    {activePreviewModal.messagePreview ||
                      "No text preview recorded."}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-200 text-emerald-900">
                  <div>
                    <p className="text-[11px] font-bold">Link Engagements</p>
                    <p className="text-xs text-emerald-700">
                      {activePreviewModal.clicks} Verified Clicks
                    </p>
                  </div>
                  <span className="text-base font-bold text-emerald-700">
                    {Math.round(
                      (activePreviewModal.clicks /
                        Math.max(1, activePreviewModal.recipients)) *
                        100,
                    )}
                    % CTR
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setActivePreviewModal(null)}
                  className="bg-[#233b66] hover:bg-[#1a2d50] text-white text-xs px-5"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
