"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Play,
  Pause,
  Copy,
  Check,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Building2,
  Coins,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  SmsLog,
  DripCampaign,
  formatEthioPhone,
  calculateSmsSegments,
  DEFAULT_SMS_TEMPLATES,
  PRESEEDED_DRIP_CAMPAIGNS,
} from "@/lib/sms";
import { cn } from "@/lib/utils";

export default function SmsAutomationPage() {
  // Active Tab: "rules" | "drip" | "outbox"
  const [activeTab, setActiveTab] = useState<"rules" | "drip" | "outbox">("rules");

  // Automated Trigger Rules State
  const [rules, setRules] = useState({
    siteVisit: { enabled: true, hoursBefore: 2, template: DEFAULT_SMS_TEMPLATES.SITE_VISIT_REMINDER },
    holdExpiry: { enabled: true, hoursBefore: 48, template: DEFAULT_SMS_TEMPLATES.HOLD_EXPIRY_ALERT },
    paymentDue: { enabled: true, daysBefore: 3, template: DEFAULT_SMS_TEMPLATES.PAYMENT_DUE_ALERT },
  });

  // Drip Campaigns State
  const [dripCampaigns, setDripCampaigns] = useState<DripCampaign[]>(PRESEEDED_DRIP_CAMPAIGNS);

  // Outbox Logs State
  const [logs, setLogs] = useState<SmsLog[]>([
    {
      id: "sms-log-1",
      recipientName: "Kebede User",
      recipientPhone: "251911234567",
      body: "Dear Kebede User, reminder: Your property site visit to Harbor Point Towers is scheduled for today at 2:30 PM. Agent: Birhanu B. (0911223344).",
      triggerType: "SITE_VISIT_REMINDER",
      status: "DELIVERED",
      sentAt: "2026-07-28T01:30:00Z",
      costEthioBirr: 0.35,
    },
    {
      id: "sms-log-2",
      recipientName: "Tigist Alemu",
      recipientPhone: "251922345678",
      body: "Dear Tigist Alemu, urgent notice: Your 14-day hold reservation on Unit 1202 (Harbor Point) expires in 24 hours. Contact BetFlow Sales.",
      triggerType: "HOLD_EXPIRY_ALERT",
      status: "DELIVERED",
      sentAt: "2026-07-27T18:15:00Z",
      costEthioBirr: 0.35,
    },
    {
      id: "sms-log-3",
      recipientName: "Dawit Haile",
      recipientPhone: "251933456789",
      body: "Dear Dawit Haile, installment reminder: Your 30% Downpayment payment of ETB 2,500,000 for Unit 1103 is due on 2026-08-01. CBE Acc: 1000123456789.",
      triggerType: "PAYMENT_DUE_ALERT",
      status: "DELIVERED",
      sentAt: "2026-07-27T09:00:00Z",
      costEthioBirr: 0.35,
    },
  ]);

  // Composer Modal State
  const [showComposer, setShowComposer] = useState(false);
  const [composerForm, setComposerForm] = useState({
    recipientName: "",
    recipientPhone: "",
    templateKey: "CUSTOM",
    body: "",
  });
  const [sendingSms, setSendingSms] = useState(false);
  const [outboxSearch, setOutboxSearch] = useState("");

  const handleTemplateSelect = (key: string) => {
    let body = "";
    if (key === "SITE_VISIT_REMINDER") body = DEFAULT_SMS_TEMPLATES.SITE_VISIT_REMINDER;
    else if (key === "HOLD_EXPIRY_ALERT") body = DEFAULT_SMS_TEMPLATES.HOLD_EXPIRY_ALERT;
    else if (key === "PAYMENT_DUE_ALERT") body = DEFAULT_SMS_TEMPLATES.PAYMENT_DUE_ALERT;

    setComposerForm((prev) => ({
      ...prev,
      templateKey: key,
      body: body || prev.body,
    }));
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerForm.recipientPhone || !composerForm.body.trim()) return;

    setSendingSms(true);
    setTimeout(() => {
      const newLog: SmsLog = {
        id: `sms-log-${Date.now()}`,
        recipientName: composerForm.recipientName.trim() || "Recipient",
        recipientPhone: formatEthioPhone(composerForm.recipientPhone),
        body: composerForm.body.trim(),
        triggerType: "MANUAL_BROADCAST",
        status: "DELIVERED",
        sentAt: new Date().toISOString(),
        costEthioBirr: 0.35,
      };

      setLogs((prev) => [newLog, ...prev]);
      setSendingSms(false);
      setShowComposer(false);
      setComposerForm({ recipientName: "", recipientPhone: "", templateKey: "CUSTOM", body: "" });
    }, 600);
  };

  const toggleCampaign = (id: string) => {
    setDripCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : c))
    );
  };

  const { charCount, segmentCount } = calculateSmsSegments(composerForm.body);

  const filteredLogs = logs.filter((l) => {
    const term = outboxSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      l.recipientName.toLowerCase().includes(term) ||
      l.recipientPhone.includes(term) ||
      l.body.toLowerCase().includes(term) ||
      l.triggerType.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardShell
      title="Ethio Telecom Bulk SMS & Automated Reminders (ኢትዮ ቴሌኮም SMS መገናኛ)"
      description="Configure automated site visit reminders, 14-day hold expiration alerts, installment due notices, and multi-step SMS drip sequences."
      active="SMS & Drip Automation"
    >
      <div className="space-y-6">
        {/* Header Actions & Gateway Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-700/50 bg-gradient-to-r from-[#233b66] via-[#1d3257] to-[#162744] p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20 backdrop-blur-md">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">Ethio Telecom SMS Gateway</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SHORTCODE 8844 READY
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-200">
                Direct integration with Ethio Telecom SMS API for instant customer notifications across Ethiopia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setShowComposer(true)}
              className="bg-[#233b66] hover:bg-[#1d3257] text-white border border-white/20 font-bold text-xs h-10 px-5 shadow-lg flex items-center gap-2"
            >
              <Send className="size-4" />
              <span>Compose Quick SMS</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all",
                activeTab === "rules"
                  ? "border-[#233b66] text-[#233b66]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Clock className="size-4" />
              <span>Automated Reminders Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("drip")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all",
                activeTab === "drip"
                  ? "border-[#233b66] text-[#233b66]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Layers className="size-4" />
              <span>Multi-Step Drip Sequences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("outbox")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all",
                activeTab === "outbox"
                  ? "border-[#233b66] text-[#233b66]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Send className="size-4" />
              <span>SMS Delivery Outbox ({logs.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: AUTOMATED REMINDERS RULES */}
        {activeTab === "rules" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Rule 1: Site Visit Reminders */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 border border-sky-200">
                    <Calendar className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    2 Hours Prior
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">Site Visit Reminders</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Sends an automated SMS 2 hours before a scheduled property site visit with location details and assigned agent phone.
                </p>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">SMS Template:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{rules.siteVisit.template}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-600">Status: <strong className="text-emerald-600">Active</strong></span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComposer(true)}
                  className="h-8 text-xs font-bold text-[#233b66] border-[#233b66]/30 hover:bg-[#233b66]/10"
                >
                  Test Rule
                </Button>
              </div>
            </div>

            {/* Rule 2: 14-Day Hold Countdown Expiry Alerts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                    <AlertTriangle className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    48h & 24h Prior
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">14-Day Hold Expiry Alerts</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Triggers urgent SMS alerts 48 hours and 24 hours prior to unit hold voucher expiration to drive contract completion.
                </p>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">SMS Template:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{rules.holdExpiry.template}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-600">Status: <strong className="text-emerald-600">Active</strong></span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComposer(true)}
                  className="h-8 text-xs font-bold text-[#233b66] border-[#233b66]/30 hover:bg-[#233b66]/10"
                >
                  Test Rule
                </Button>
              </div>
            </div>

            {/* Rule 3: Payment Installment Due Alerts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                    <Coins className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    3 Days Prior
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">Installment Due Notices</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Reminds property buyers 3 days prior to milestone payment due dates (*30/20/20/20/10*) with CBE Bank account numbers.
                </p>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">SMS Template:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{rules.paymentDue.template}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-600">Status: <strong className="text-emerald-600">Active</strong></span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComposer(true)}
                  className="h-8 text-xs font-bold text-[#233b66] border-[#233b66]/30 hover:bg-[#233b66]/10"
                >
                  Test Rule
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-STEP DRIP SEQUENCES */}
        {activeTab === "drip" && (
          <div className="space-y-6">
            {dripCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{campaign.name}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                          campaign.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Segment: <strong className="text-slate-700">{campaign.targetSegment}</strong> · Enrolled:{" "}
                      <strong className="text-[#233b66] font-bold">{campaign.enrolledCount} buyers</strong>
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCampaign(campaign.id)}
                      className="h-9 px-4 text-xs font-bold text-slate-700 border-slate-300"
                    >
                      {campaign.status === "ACTIVE" ? (
                        <>
                          <Pause className="size-3.5 mr-1 text-slate-500" /> Pause Sequence
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5 mr-1 text-emerald-600" /> Activate Sequence
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Steps Visual Timeline */}
                <div className="space-y-4">
                  {campaign.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#233b66] text-white font-extrabold text-xs shadow-md">
                        {step.stepNumber}
                      </div>

                      <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                          <span className="text-[11px] font-semibold text-[#233b66] bg-[#233b66]/10 px-2 py-0.5 rounded border border-[#233b66]/20">
                            {step.delayDays === 0 ? "Immediately on Intake" : `Day ${step.delayDays} Delay`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono leading-relaxed">{step.smsTemplate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SMS DELIVERY OUTBOX LOGS */}
        {activeTab === "outbox" && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SMS logs by name, phone, or content..."
                  value={outboxSearch}
                  onChange={(e) => setOutboxSearch(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-[#233b66]"
                />
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Total Cost: <strong className="text-slate-900">ETB {(logs.length * 0.35).toFixed(2)}</strong>
              </div>
            </div>

            {/* Logs Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Ethio Phone</th>
                    <th className="px-4 py-3">SMS Message Content</th>
                    <th className="px-4 py-3">Trigger Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Sent Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{log.recipientName}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">+{log.recipientPhone}</td>
                      <td className="px-4 py-3.5 max-w-md text-slate-700 font-mono text-[11px] truncate">
                        {log.body}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {log.triggerType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                            log.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 font-mono">
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUICK SMS COMPOSER MODAL */}
        {showComposer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="size-4 text-[#233b66]" />
                  Compose Ethio Telecom SMS Alert
                </h3>
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendSms} className="space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kebede User"
                      value={composerForm.recipientName}
                      onChange={(e) => setComposerForm({ ...composerForm, recipientName: e.target.value })}
                      className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#233b66]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ethio Phone Number</label>
                    <input
                      type="text"
                      placeholder="0911234567 or +251911..."
                      value={composerForm.recipientPhone}
                      onChange={(e) => setComposerForm({ ...composerForm, recipientPhone: e.target.value })}
                      className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#233b66] font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Template Preset</label>
                  <select
                    value={composerForm.templateKey}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#233b66] bg-white"
                  >
                    <option value="CUSTOM">Custom Message Text</option>
                    <option value="SITE_VISIT_REMINDER">Site Visit Reminder (2h Prior)</option>
                    <option value="HOLD_EXPIRY_ALERT">14-Day Hold Expiry Alert (24h/48h Prior)</option>
                    <option value="PAYMENT_DUE_ALERT">Installment Due Alert (3 Days Prior)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">SMS Body Text</label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {charCount} chars · <strong className="text-[#233b66]">{segmentCount} segment(s)</strong>
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Type your SMS alert message..."
                    value={composerForm.body}
                    onChange={(e) => setComposerForm({ ...composerForm, body: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#233b66] font-mono"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowComposer(false)}
                    className="h-9 px-4 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={sendingSms}
                    className="h-9 px-5 bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs"
                  >
                    {sendingSms ? "Dispatching..." : "Send via Ethio Telecom Shortcode 8844"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
