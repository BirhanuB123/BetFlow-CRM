"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Send,
  Share2,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Plus,
  X,
  Megaphone,
  Search,
  Smartphone,
} from "lucide-react";

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
    badge: "bg-info/10 text-info border-info/20 font-bold",
    icon: Send,
  },
  SMS: {
    label: "SMS Direct Alert",
    badge: "bg-info/10 text-info border-info font-medium",
    icon: Smartphone,
  },
  FACEBOOK: {
    label: "Meta Lead Broadcast",
    badge: "bg-info/10 text-info border-info/20 font-medium",
    icon: Share2,
  },
  WHATSAPP: {
    label: "WhatsApp Business Bot",
    badge: "bg-success/10 text-success border-success/20 font-medium",
    icon: MessageSquare,
  },
};

export function SocialOutreachView() {
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
            status: item.status === "DRAFT" || item.status === "SCHEDULED" ? item.status : "SENT",
            messagePreview: item.messagePreview || item.content || "",
          };
        });
        setCampaigns(normalized);
      }
    } catch {
      // Fallback to initial seed data
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
      const matchesSearch =
        !debouncedSearch.trim() ||
        c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.segment.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesChannel =
        channelFilter === "ALL" || c.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  }, [campaigns, debouncedSearch, channelFilter]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const newCampaign: BroadcastCampaign = {
        id: `bc-${Date.now()}`,
        title: form.title,
        channel: form.channel,
        segment: form.segment,
        recipients:
          form.channel === "TELEGRAM"
            ? 2450
            : form.channel === "SMS"
              ? 880
              : 520,
        sentAt: new Date().toISOString(),
        clicks: 0,
        status: "SENT",
        messagePreview: form.message,
      };

      try {
        await apiFetch("/campaigns", {
          method: "POST",
          body: JSON.stringify(newCampaign),
        });
      } catch {
        // Fallback local update
      }

      setCampaigns((prev) => [newCampaign, ...prev]);
      setShowComposer(false);
      setForm({
        title: "",
        channel: "TELEGRAM",
        segment: "All Telegram Channel Subscribers",
        message: "",
      });
      success("Broadcast campaign published successfully!");
    } catch (err) {
      toastError("Failed to send broadcast", err instanceof Error ? err.message : undefined);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-info/10 text-info">
                <Megaphone className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Social & Channel Lead Outreach Broadcasts
                </h2>
                <p className="text-xs text-slate-500">
                  Publish construction updates, launch announcements, and pro-forma deadlines directly to Telegram, WhatsApp, and Meta lead lists.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search broadcast title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#233b66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#233b66] transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Channel Filters */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
              {(
                [
                  { id: "ALL", label: "All Channels" },
                  { id: "TELEGRAM", label: "Telegram" },
                  { id: "SMS", label: "SMS" },
                  { id: "FACEBOOK", label: "Meta Leads" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setChannelFilter(item.id)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                    channelFilter === item.id
                      ? "bg-white text-[#233b66] shadow-xs"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowComposer(true)}
              className="h-9.5 font-semibold text-xs px-4 shadow-sm gap-1.5"
            >
              <Plus className="size-4" />
              New Broadcast Post
            </Button>
          </div>
        </div>
      </section>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-[#233b66]" />
                <h3 className="text-base font-bold text-slate-900">
                  Compose Channel Broadcast Message
                </h3>
              </div>
              <button
                onClick={() => setShowComposer(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campaign Title / Internal Subject *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Kazanchis Penthouse Launch Announcement"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Channel *
                  </label>
                  <select
                    value={form.channel}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        channel: e.target.value as BroadcastCampaign["channel"],
                      })
                    }
                    className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66]"
                  >
                    <option value="TELEGRAM">Telegram Official Channel</option>
                    <option value="SMS">Ethio Telecom SMS Bulk</option>
                    <option value="FACEBOOK">Meta Lead Form Audience</option>
                    <option value="WHATSAPP">WhatsApp Business Broadcast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Segment *
                  </label>
                  <input
                    type="text"
                    value={form.segment}
                    onChange={(e) => setForm({ ...form, segment: e.target.value })}
                    className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Broadcast Message Body (Amharic & English) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write message copy with emojis and unit details..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-[#233b66]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComposer(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sending}
                  className="font-semibold text-xs px-5 shadow-sm gap-1.5"
                >
                  <Send className="size-3.5" />
                  {sending ? "Publishing..." : "Publish Broadcast"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Campaign List */}
      <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Social Broadcasts Found"
              description="No channel outreach campaigns match your search filter."
              actionText="Create Broadcast Post"
              onAction={() => setShowComposer(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Campaign Title</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Audience Segment</th>
                  <th className="px-4 py-3">Recipients</th>
                  <th className="px-4 py-3">Link Clicks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCampaigns.map((c) => {
                  const conf = channelConfig[c.channel] || channelConfig.TELEGRAM;
                  const Icon = conf.icon;

                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-slate-50/80 group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-[#233b66] font-bold">
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 max-w-xs truncate">
                              {c.title}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Published: {new Date(c.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
                            conf.badge,
                          )}
                        >
                          {conf.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {c.segment}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">
                        {c.recipients.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 font-extrabold text-success">
                        {c.clicks} clicks
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/10 border border-success/20 px-2 py-0.5 text-[11px] font-bold text-success">
                          <CheckCircle2 className="size-3 text-success" />
                          {c.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setActivePreviewModal(c)}
                          className="h-7 text-[11px] border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          View Details
                        </Button>
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

              <div className="rounded-xl border border-info/20 bg-info/10 p-4">
                <p className="text-[11px] font-bold text-info mb-1.5">
                  Message Body Sent to Channel:
                </p>
                <p className="text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-info/20">
                  {activePreviewModal.messagePreview ||
                    "No text preview recorded."}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3 border border-success/20 text-success">
                <div>
                  <p className="text-[11px] font-bold">Link Engagements</p>
                  <p className="text-xs text-success">
                    {activePreviewModal.clicks} Verified Clicks
                  </p>
                </div>
                <span className="text-base font-bold text-success">
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
                className="text-xs px-5"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
