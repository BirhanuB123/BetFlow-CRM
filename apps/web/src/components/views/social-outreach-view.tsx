"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Send,
  Share2,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
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
import { useTranslation } from "@/lib/i18n/language-context";

type BroadcastCampaign = {
  id: string;
  title: string;
  channel: "TELEGRAM" | "FACEBOOK" | "SMS" | "WHATSAPP";
  segment: string;
  recipients: number;
  sentAt: string;
  clicks: number;
  status: "SENT" | "SCHEDULED" | "DRAFT" | "FAILED";
  messagePreview?: string;
};



const BROADCAST_TEMPLATES = [
  {
    id: "launch",
    label: "🏢 Project Launch",
    title: "Kera Luxury Residences Launch Announcement",
    message: `🏢 <b>Kera Luxury Residences — Exclusive Units Now Selling!</b>

✨ Experience premium modern living in the heart of Addis Ababa with unmatched panoramic city views.

📍 <b>Location:</b> Kera / Bole Corridor, Addis Ababa
🛏️ <b>Units Available:</b> 1, 2, & 3 Bedroom Contemporary Apartments
💰 <b>Payment Terms:</b> 15% Downpayment with 24-Month Milestone Schedule
🏊 <b>Amenities:</b> Modern Fitness Center, Underground Parking, 24/7 Power Backup & Security

📞 <b>Contact Sales Desk:</b> +251 911 234 567 / +251 922 345 678
🌐 <b>Explore Floor Plans & Reserve:</b> https://betflow.et`,
  },
  {
    id: "promo",
    label: "🔥 10% Discount Offer",
    title: "Limited Time 10% Downpayment Discount Promotion",
    message: `🔥 <b>SPECIAL PROMOTION: 10% Off Advance Downpayments!</b>

Take advantage of our exclusive seasonal investor discount available for the next 10 buyers only.

📍 <b>Site Location:</b> Kera Luxury Residences
🔑 <b>Estimated Delivery:</b> 2026
💵 <b>Starting Price:</b> Special diaspora & local investor rates available on request

📲 <b>Lock in Your Discount Today:</b>
📞 +251 911 234 567
🌐 https://betflow.et`,
  },
  {
    id: "visit",
    label: "📍 Site Visit Walkthrough",
    title: "Exclusive Weekend Property Walkthrough Invitation",
    message: `📍 <b>INVITATION: Exclusive Weekend Site Walkthrough!</b>

Join our property consultants this Saturday & Sunday for an in-person walkthrough of our ongoing construction and show units.

📅 <b>Schedule:</b> Saturday & Sunday | 9:00 AM – 4:00 PM
📍 <b>Venue:</b> Kera Main Project Site Office
☕ <i>Complimentary refreshments & 1-on-1 financing advisory provided.</i>

👉 <b>Confirm Your Attendance:</b> Call +251 911 234 567 or reply directly!`,
  },
  {
    id: "amharic",
    label: "🇪🇹 አማርኛ የቤት ሽያጭ",
    title: "በቄራ ሳይት የተዘጋጁ ዘመናዊ አፓርታማዎች ሽያጭ",
    message: `🇪🇹 <b>ለተከበራችሁ ደንበኞቻችን — በቄራ ሳይት የቀረቡ ዘመናዊ አፓርታማዎች!</b>

በተመጣጣኝ ዋጋ እና ምቹ የክፍያ አማራጭ በከተማው ማዕከል የራስዎን ቤት ባለቤት ይሁኑ።

📍 <b>አድራሻ:</b> ቄራ ሳይት፣ አዲስ አበባ
🏷️ <b>የክፍል ብዛት:</b> 1፣ 2 እና 3 መኝታ ቤቶች
💳 <b>የክፍያ ሁኔታ:</b> እስከ 2 ዓመት የተራዘመ ምቹ የክፍያ ስምምነት
⚡ <b>አገልግሎቶች:</b> የከርሰ ምድር መኪና ማቆሚያ፣ 24/7 አስተማማኝ ጀነሬተር እና ዘመናዊ ሊፍት

ለበለጠ መረጃ እና ለቦታ ምዝገባ በስልክ ይደውሉልን፡
📞 0911 234 567 / 0922 345 678
🌐 https://betflow.et`,
  },
];

function formatTelegramPreview(text: string) {
  if (!text) return "";
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  formatted = formatted
    .replace(/&lt;b&gt;/gi, "<b>")
    .replace(/&lt;\/b&gt;/gi, "</b>")
    .replace(/&lt;i&gt;/gi, "<i>")
    .replace(/&lt;\/i&gt;/gi, "</i>")
    .replace(/&lt;u&gt;/gi, "<u>")
    .replace(/&lt;\/u&gt;/gi, "</u>")
    .replace(/&lt;code&gt;/gi, "<code class='bg-slate-800 text-amber-300 px-1 rounded text-[11px]'>")
    .replace(/&lt;\/code&gt;/gi, "</code>");

  formatted = formatted.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline hover:text-sky-300">$1</a>',
  );

  return formatted;
}

const channelConfig: Record<
  BroadcastCampaign["channel"],
  { label: string; badge: string; icon: typeof Send; connected: boolean }
> = {
  TELEGRAM: {
    label: "Telegram Channel",
    badge: "bg-info/10 text-info border-info/20 font-bold",
    icon: Send,
    connected: true,
  },
  SMS: {
    label: "SMS Direct Alert",
    badge: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
    icon: Smartphone,
    connected: false,
  },
  FACEBOOK: {
    label: "Meta Lead Broadcast",
    badge: "bg-slate-100 text-slate-500 border-slate-200 font-medium",
    icon: Share2,
    connected: false,
  },
  WHATSAPP: {
    label: "WhatsApp Business Bot",
    badge: "bg-slate-100 text-slate-500 border-slate-200 font-medium",
    icon: MessageSquare,
    connected: false,
  },
};

export function SocialOutreachView() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
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
      if (Array.isArray(data)) {
        const normalized = data.map((item, idx): BroadcastCampaign => {
          const rawChannel = String(item.channel || item.type || "TELEGRAM").toUpperCase();
          const validChannel: BroadcastCampaign["channel"] = (
            ["TELEGRAM", "SMS", "FACEBOOK", "WHATSAPP"] as const
          ).includes(rawChannel as any)
            ? (rawChannel as BroadcastCampaign["channel"])
            : "TELEGRAM";

          const rawStatus = String(item.status || "SENT").toUpperCase();
          const validStatus: BroadcastCampaign["status"] = (
            ["SENT", "SCHEDULED", "DRAFT", "FAILED"] as const
          ).includes(rawStatus as any)
            ? (rawStatus as BroadcastCampaign["status"])
            : "SENT";

          return {
            id: item.id || `bc-api-${idx}`,
            title: item.title || item.name || "Untitled Broadcast",
            channel: validChannel,
            segment: item.segment || "All Subscribers",
            recipients: typeof item.recipients === "number" ? item.recipients : 0,
            sentAt: item.sentAt || item.createdAt || new Date().toISOString(),
            clicks: typeof item.clicks === "number" ? item.clicks : 0,
            status: validStatus,
            messagePreview: item.messagePreview || item.content || "",
          };
        });
        setCampaigns(normalized);
      } else {
        setCampaigns([]);
      }
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
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
      const payload = {
        title: form.title,
        channel: form.channel,
        segment: form.segment,
        message: form.message,
      };

      const res = await apiFetch<any>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const rawChannel = String(res?.channel || res?.type || form.channel).toUpperCase();
      const validChannel: BroadcastCampaign["channel"] = (
        ["TELEGRAM", "SMS", "FACEBOOK", "WHATSAPP"] as const
      ).includes(rawChannel as any)
        ? (rawChannel as BroadcastCampaign["channel"])
        : form.channel;

      const rawStatus = String(res?.status || "SENT").toUpperCase();
      const validStatus: BroadcastCampaign["status"] = (
        ["SENT", "SCHEDULED", "DRAFT", "FAILED"] as const
      ).includes(rawStatus as any)
        ? (rawStatus as BroadcastCampaign["status"])
        : "SENT";

      const created: BroadcastCampaign = {
        id: res?.id || `bc-${Date.now()}`,
        title: res?.title || res?.name || form.title,
        channel: validChannel,
        segment: res?.segment || form.segment,
        recipients: typeof res?.recipients === "number" ? res.recipients : 0,
        sentAt: res?.sentAt || new Date().toISOString(),
        clicks: typeof res?.clicks === "number" ? res.clicks : 0,
        status: validStatus,
        messagePreview: res?.messagePreview || form.message,
      };

      setCampaigns((prev) => [created, ...prev]);
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
      void load();
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
                  {t("socialOutreach.title")}
                </h2>
                <p className="text-xs text-slate-500">
                  {t("socialOutreach.subtitle")}
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
                placeholder={t("socialOutreach.searchBroadcasts")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-primary transition-all"
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
                  { id: "ALL", label: t("socialOutreach.allBroadcasts") },
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
                      ? "bg-white text-primary shadow-xs"
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
              {t("socialOutreach.newBroadcast")}
            </Button>
          </div>
        </div>
      </section>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl transition-all my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Compose Channel Broadcast Message
                  </h3>
                  <p className="text-xs text-slate-500">
                    Format with rich text, emojis, and live real estate templates for your Telegram channel.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComposer(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Template Selector Bar */}
            <div className="pt-3 pb-2 flex flex-wrap items-center gap-1.5 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Quick Templates:
              </span>
              {BROADCAST_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      title: tmpl.title,
                      message: tmpl.message,
                    });
                  }}
                  className="rounded-md border border-slate-200 bg-slate-50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 overflow-y-auto pr-1">
              {/* Form Input Column */}
              <form onSubmit={handleSendBroadcast} className="lg:col-span-7 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campaign Title / Internal Subject *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Kera Luxury Residences Launch"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target Channel *
                      </label>
                      <select
                        value={form.channel}
                        onChange={(e) => {
                          const newChan = e.target.value as BroadcastCampaign["channel"];
                          setForm({
                            ...form,
                            channel: newChan,
                            segment:
                              newChan === "TELEGRAM"
                                ? "All Telegram Channel Subscribers"
                                : newChan === "SMS"
                                  ? "All CRM Phone Contacts"
                                  : `${newChan} Audience (Not Connected)`,
                          });
                        }}
                        className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                      >
                        <option value="TELEGRAM">Telegram Official Channel (Active)</option>
                        <option value="SMS">Ethio Telecom SMS Broadcast (Active)</option>
                        <option value="FACEBOOK">Meta / Facebook Audience (Not Connected)</option>
                        <option value="WHATSAPP">WhatsApp Business Broadcast (Not Connected)</option>
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
                        className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {form.channel !== "TELEGRAM" && form.channel !== "SMS" && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Channel Integration Not Connected</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          {form.channel === "FACEBOOK"
                            ? "Meta / Facebook Marketing API is not configured yet."
                            : "WhatsApp Business Cloud API is not configured yet."}{" "}
                          Direct live broadcasting is currently active for Telegram Official Channel and Ethio Telecom SMS Gateway.
                        </p>
                      </div>
                    </div>
                  )}

                  {form.channel === "SMS" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-800 flex items-start gap-2">
                      <Sparkles className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-900">Ethio Telecom & AfroMessage SMS Gateway Active</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Broadcast SMS will be dispatched directly to your CRM phone contacts with live status logging in the SMS Outbox.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Broadcast Message Body (HTML & Emojis supported) *
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {form.message.length} chars
                      </span>
                    </div>

                    {/* Quick Emojis and Tag Inserters */}
                    <div className="flex flex-wrap items-center gap-1 mb-1.5 p-1 bg-slate-50 rounded-md border border-slate-200 text-[11px]">
                      <span className="text-[10px] text-slate-400 font-bold px-1 uppercase">Insert:</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, message: form.message + "<b>Bold Text</b>" })}
                        className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 font-bold text-slate-700"
                        title="Bold Text"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, message: form.message + "<i>Italic Text</i>" })}
                        className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 italic font-serif text-slate-700"
                        title="Italic Text"
                      >
                        I
                      </button>
                      {[
                        { icon: "🏢", label: "🏢 Project" },
                        { icon: "📍", label: "📍 Location" },
                        { icon: "💰", label: "💰 Price" },
                        { icon: "📞", label: "📞 Phone" },
                        { icon: "✨", label: "✨ Luxury" },
                        { icon: "🔥", label: "🔥 Promo" },
                        { icon: "🔑", label: "🔑 Keys" },
                        { icon: "🌐", label: "🌐 Link" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setForm({ ...form, message: form.message + " " + item.icon + " " })}
                          className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs"
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={8}
                      placeholder="Write message copy with emojis and details..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono leading-relaxed"
                    />
                  </div>
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
                    disabled={sending || form.channel !== "TELEGRAM"}
                    className="font-semibold text-xs px-5 shadow-sm gap-1.5"
                  >
                    <Send className="size-3.5" />
                    {sending
                      ? "Publishing to Telegram..."
                      : form.channel !== "TELEGRAM"
                        ? "Channel Not Connected"
                        : "Publish Broadcast"}
                  </Button>
                </div>
              </form>

              {/* Live Telegram Channel Preview */}
              <div className="lg:col-span-5 flex flex-col">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Live Telegram Channel Preview</span>
                  <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded font-medium">
                    WYSIWYG
                  </span>
                </label>

                {/* Telegram App Container */}
                <div className="flex-1 rounded-xl bg-[#0e1621] text-white p-3.5 flex flex-col justify-between border border-slate-800 shadow-inner min-h-[300px]">
                  <div>
                    {/* Telegram Header */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80 mb-3">
                      <div className="size-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                        UE
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100 flex items-center gap-1">
                          Ultima Real Estate
                          <CheckCircle2 className="size-3 text-sky-400 fill-sky-400" />
                        </p>
                        <p className="text-[10px] text-slate-400">channel · 3 subscribers</p>
                      </div>
                    </div>

                    {/* Telegram Post Bubble */}
                    <div className="bg-[#182533] rounded-xl p-3 text-xs leading-relaxed border border-slate-800 shadow-sm max-w-full">
                      {form.message ? (
                        <div
                          className="whitespace-pre-line text-slate-200 break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatTelegramPreview(form.message),
                          }}
                        />
                      ) : (
                        <p className="text-slate-500 italic text-xs">
                          Your formatted message will appear here in real-time...
                        </p>
                      )}

                      {/* Post Metadata Footer */}
                      <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          👁️ 1
                        </span>
                        <span>·</span>
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 text-[10px] text-slate-400 text-center border-t border-slate-800/80 mt-3">
                    Subscribers will receive instant push notifications for this post.
                  </div>
                </div>
              </div>
            </div>
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
                  <th className="px-4 py-3">{t("socialOutreach.campaignTitle")}</th>
                  <th className="px-4 py-3">{t("socialOutreach.channel")}</th>
                  <th className="px-4 py-3">{t("socialOutreach.audience")}</th>
                  <th className="px-4 py-3">{t("dashboard.client")}</th>
                  <th className="px-4 py-3">{t("socialOutreach.linkClicks")}</th>
                  <th className="px-4 py-3">{t("dashboard.status")}</th>
                  <th className="px-4 py-3 text-right">{t("actions.status")}</th>
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
                          <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-primary font-bold">
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
                        {c.channel === "TELEGRAM" || c.recipients > 0 ? (
                          c.recipients.toLocaleString()
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">— (Not Connected)</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-500">
                        {c.clicks > 0 ? `${c.clicks.toLocaleString()} Link Clicks` : "0 clicks"}
                      </td>

                      <td className="px-4 py-3">
                        {c.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-success/10 border border-success/20 px-2 py-0.5 text-[11px] font-bold text-success">
                            <CheckCircle2 className="size-3 text-success" />
                            SENT
                          </span>
                        ) : c.status === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-[11px] font-bold text-destructive">
                            <AlertCircle className="size-3 text-destructive" />
                            FAILED
                          </span>
                        ) : c.status === "SCHEDULED" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 border border-warning/20 px-2 py-0.5 text-[11px] font-bold text-warning">
                            <Clock className="size-3 text-warning" />
                            SCHEDULED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            DRAFT
                          </span>
                        )}
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
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="size-5 text-primary" />
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

              <div className="grid grid-cols-3 gap-3">
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
                    Audience
                  </p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {activePreviewModal.channel === "TELEGRAM" || activePreviewModal.recipients > 0
                      ? activePreviewModal.recipients.toLocaleString()
                      : "Not Connected (0)"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Outcome Status
                  </p>
                  <div className="mt-0.5">
                    {activePreviewModal.status === "SENT" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/10 border border-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success">
                        <CheckCircle2 className="size-3 text-success" />
                        SENT
                      </span>
                    ) : activePreviewModal.status === "FAILED" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                        <AlertCircle className="size-3 text-destructive" />
                        FAILED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {activePreviewModal.status}
                      </span>
                    )}
                  </div>
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

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-200/80 text-slate-700">
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Link Engagement</p>
                  <p className="text-xs text-slate-500">
                    {activePreviewModal.clicks > 0
                      ? `${activePreviewModal.clicks.toLocaleString()} Link Clicks`
                      : "0 link clicks recorded"}
                  </p>
                </div>
                {activePreviewModal.clicks > 0 && activePreviewModal.recipients > 0 && (
                  <span className="text-base font-bold text-slate-900">
                    {Math.round(
                      (activePreviewModal.clicks /
                        Math.max(1, activePreviewModal.recipients)) *
                        100,
                    )}
                    % CTR
                  </span>
                )}
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
