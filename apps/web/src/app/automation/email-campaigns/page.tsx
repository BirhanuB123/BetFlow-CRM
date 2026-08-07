"use client";

import { useState } from "react";
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
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";

type BroadcastCampaign = {
  id: string;
  title: string;
  channel: "TELEGRAM" | "FACEBOOK" | "SMS" | "WHATSAPP";
  segment: string;
  recipients: number;
  sentAt: string;
  clicks: number;
  status: "SENT" | "SCHEDULED" | "DRAFT";
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
  },
];

export default function SocialBroadcastsPage() {
  const [campaigns, setCampaigns] =
    useState<BroadcastCampaign[]>(INITIAL_CAMPAIGNS);
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: "",
    channel: "TELEGRAM" as BroadcastCampaign["channel"],
    segment: "All Telegram Channel Subscribers",
    message: "",
  });

  const handleLaunchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      const newCamp: BroadcastCampaign = {
        id: `bc-00${campaigns.length + 1}`,
        title: form.title,
        channel: form.channel,
        segment: form.segment,
        recipients: form.channel === "TELEGRAM" ? 2450 : 420,
        sentAt: new Date().toISOString(),
        clicks: 0,
        status: "SENT",
      };
      setCampaigns([newCamp, ...campaigns]);
      setForm({
        title: "",
        channel: "TELEGRAM",
        segment: "All Telegram Channel Subscribers",
        message: "",
      });
      setShowComposer(false);
      setSending(false);
    }, 600);
  };

  return (
    <DashboardShell
      title="Social Outreach & Channel Broadcasts (የሶሻል ሚዲያ መገናኛ)"
      description="Connect real estate Telegram channels, Meta Lead Ads, and launch broadcast updates directly to property buyers."
      active="Social Outreach"
    >
      <div className="space-y-6">
        {/* Uniform Section Header */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="size-5 text-[#233b66]" />
                <h2 className="text-base font-bold text-slate-900">
                  Telegram & Social Outreach Engine
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Broadcast construction progress, new floor plan launches, and
                pro-forma invoice guides to Ethiopian property buyers.
              </p>
            </div>
            <Button
              onClick={() => setShowComposer((v) => !v)}
              className="bg-[#233b66] hover:bg-[#1d3257] text-white font-medium text-xs h-9 px-4 shadow-xs flex items-center gap-1.5"
            >
              {showComposer ? (
                <X className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
              {showComposer ? "Cancel Broadcast" : "New Telegram Broadcast"}
            </Button>
          </div>

          {/* Broadcast Composer Form */}
          {showComposer && (
            <form
              onSubmit={handleLaunchBroadcast}
              className="mt-5 rounded-xl border border-sky-200 bg-sky-50/40 p-5 shadow-xs"
            >
              <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-sky-600" />
                Compose Social Outreach & Channel Broadcast
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
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
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66]"
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
                        channel: e.target.value as BroadcastCampaign["channel"],
                      })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66]"
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

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Buyer Segment
                  </label>
                  <select
                    value={form.segment}
                    onChange={(e) =>
                      setForm({ ...form, segment: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66]"
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

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message Body (Amharic & English)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. 🏢 Bole Penthouse Units Now Open! 📍 Prime location in Bole Medhanialem. 30% Downpayment with 24 months interest-free installment plan."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-[#233b66] focus:outline-none focus:ring-1 focus:ring-[#233b66] font-mono leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-sky-200/60 pt-3">
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
                  className="bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs h-9 px-5"
                >
                  {sending ? "Broadcasting…" : "Send Social Broadcast"}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Broadcast History Table */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Broadcast Outreach Log
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Broadcast Title</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Target Segment</th>
                  <th className="px-4 py-3">Recipients</th>
                  <th className="px-4 py-3">Date Sent</th>
                  <th className="px-4 py-3">Clicks & Engagements</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.title}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                        {c.channel === "TELEGRAM" && (
                          <Send className="size-3 text-sky-600" />
                        )}
                        {c.channel}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600">{c.segment}</td>

                    <td className="px-4 py-3 font-bold text-slate-900">
                      {c.recipients.toLocaleString()} buyers
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-600 font-mono">
                      {new Date(c.sentAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {c.clicks} clicks (
                      {Math.round((c.clicks / Math.max(1, c.recipients)) * 100)}
                      %)
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="size-3" /> {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
