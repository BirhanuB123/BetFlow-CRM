"use client";

import { useState, useEffect } from "react";
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
  Edit3,
  UserPlus,
  Activity,
  Zap,
  UserCheck,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  SmsLog,
  DripCampaign,
  SmsStats,
  TriggerRulesMap,
  SmsContact,
  formatEthioPhone,
  calculateSmsSegments,
  DEFAULT_SMS_TEMPLATES,
  PRESEEDED_DRIP_CAMPAIGNS,
  fetchSmsStats,
  fetchSmsContacts,
  fetchOutboxLogs,
  sendSmsApi,
  fetchDripCampaigns,
  createDripCampaignApi,
  toggleDripCampaignApi,
  addDripStepApi,
  enrollLeadApi,
  fetchRulesApi,
  updateRuleApi,
} from "@/lib/sms";
import { cn } from "@/lib/utils";

export default function SmsAutomationPage() {
  // Active Tab: "rules" | "drip" | "outbox"
  const [activeTab, setActiveTab] = useState<"rules" | "drip" | "outbox">("rules");

  // Loading & Refresh State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Stats State
  const [stats, setStats] = useState<SmsStats>({
    totalSent: 3,
    delivered: 3,
    failed: 0,
    deliveryRate: 100,
    totalCostBirr: 1.05,
    gatewayProvider: "Ethio Telecom Shortcode 8844 Gateway",
    shortcode: "8844",
    isLive: true,
    activeCampaignsCount: 2,
  });

  // Contacts from CRM Database
  const [contacts, setContacts] = useState<SmsContact[]>([]);

  // Automated Trigger Rules State
  const [rules, setRules] = useState<TriggerRulesMap>({
    siteVisit: { enabled: true, timing: "2 Hours Prior", template: DEFAULT_SMS_TEMPLATES.SITE_VISIT_REMINDER },
    holdExpiry: { enabled: true, timing: "48h & 24h Prior", template: DEFAULT_SMS_TEMPLATES.HOLD_EXPIRY_ALERT },
    paymentDue: { enabled: true, timing: "3 Days Prior", template: DEFAULT_SMS_TEMPLATES.PAYMENT_DUE_ALERT },
  });

  // Drip Campaigns State
  const [dripCampaigns, setDripCampaigns] = useState<DripCampaign[]>(PRESEEDED_DRIP_CAMPAIGNS);

  // Outbox Logs State
  const [logs, setLogs] = useState<SmsLog[]>([]);

  // Search Filter
  const [outboxSearch, setOutboxSearch] = useState("");

  // Modals visibility state
  const [showComposer, setShowComposer] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState<string | null>(null);
  const [editingRuleKey, setEditingRuleKey] = useState<"siteVisit" | "holdExpiry" | "paymentDue" | null>(null);

  // Form States
  const [composerForm, setComposerForm] = useState({
    selectedContactId: "",
    recipientName: "",
    recipientPhone: "",
    templateKey: "CUSTOM",
    body: "",
  });
  const [sendingSms, setSendingSms] = useState(false);

  const [newCampaignForm, setNewCampaignForm] = useState({
    name: "",
    targetSegment: "COLD_LEADS" as DripCampaign["targetSegment"],
    step1Title: "Welcome & Introduction",
    step1Delay: 0,
    step1Template: "Selam {clientName}! Thank you for inquiring about {projectName}. View elevation plans: betflow.et/units",
  });

  const [addStepForm, setAddStepForm] = useState({
    title: "",
    delayDays: 3,
    smsTemplate: "",
  });

  const [enrollForm, setEnrollForm] = useState({
    selectedContactId: "",
    clientName: "",
    clientPhone: "",
  });

  const [ruleEditForm, setRuleEditForm] = useState({
    enabled: true,
    timing: "",
    template: "",
  });

  // Load Data from API / Database Services
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [statsRes, contactsRes, logsRes, dripRes, rulesRes] = await Promise.all([
        fetchSmsStats(),
        fetchSmsContacts(),
        fetchOutboxLogs(),
        fetchDripCampaigns(),
        fetchRulesApi(),
      ]);
      setStats(statsRes);
      setContacts(contactsRes);
      setLogs(logsRes);
      setDripCampaigns(dripRes);
      setRules(rulesRes);
    } catch {
      // Fallback state already loaded in lib
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleSelectContactForComposer = (contactId: string) => {
    const found = contacts.find((c) => c.id === contactId);
    if (found) {
      setComposerForm((prev) => ({
        ...prev,
        selectedContactId: contactId,
        recipientName: found.name,
        recipientPhone: found.phone,
      }));
    } else {
      setComposerForm((prev) => ({ ...prev, selectedContactId: "" }));
    }
  };

  const handleSelectContactForEnroll = (contactId: string) => {
    const found = contacts.find((c) => c.id === contactId);
    if (found) {
      setEnrollForm({
        selectedContactId: contactId,
        clientName: found.name,
        clientPhone: found.phone,
      });
    } else {
      setEnrollForm((prev) => ({ ...prev, selectedContactId: "" }));
    }
  };

  const handleTemplateSelect = (key: string) => {
    let body = "";
    if (key === "SITE_VISIT_REMINDER") body = rules.siteVisit.template;
    else if (key === "HOLD_EXPIRY_ALERT") body = rules.holdExpiry.template;
    else if (key === "PAYMENT_DUE_ALERT") body = rules.paymentDue.template;

    setComposerForm((prev) => ({
      ...prev,
      templateKey: key,
      body: body || prev.body,
    }));
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerForm.recipientPhone || !composerForm.body.trim()) return;

    setSendingSms(true);
    try {
      const newLog = await sendSmsApi({
        recipientName: composerForm.recipientName.trim() || "Recipient",
        recipientPhone: composerForm.recipientPhone,
        body: composerForm.body.trim(),
        triggerType: composerForm.templateKey !== "CUSTOM" ? composerForm.templateKey : "MANUAL_BROADCAST",
      });

      setLogs((prev) => [newLog, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        delivered: prev.delivered + 1,
        totalCostBirr: Math.round((prev.totalCostBirr + 0.35) * 100) / 100,
      }));

      showToast(`SMS sent to +${formatEthioPhone(composerForm.recipientPhone)} via Shortcode 8844!`);
      setShowComposer(false);
      setComposerForm({ selectedContactId: "", recipientName: "", recipientPhone: "", templateKey: "CUSTOM", body: "" });
    } catch (err: any) {
      showToast(`Failed to send SMS: ${err.message}`);
    } finally {
      setSendingSms(false);
    }
  };

  const toggleCampaign = async (id: string) => {
    const updated = await toggleDripCampaignApi(id);
    setDripCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast(`Drip Campaign sequence '${updated.name}' set to ${updated.status}`);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignForm.name.trim()) return;

    const created = await createDripCampaignApi({
      name: newCampaignForm.name.trim(),
      targetSegment: newCampaignForm.targetSegment,
      steps: [
        {
          title: newCampaignForm.step1Title,
          delayDays: newCampaignForm.step1Delay,
          smsTemplate: newCampaignForm.step1Template,
        },
      ],
    });

    setDripCampaigns((prev) => [created, ...prev]);
    setShowNewCampaignModal(false);
    showToast(`Multi-step Drip Sequence '${created.name}' created!`);
    setNewCampaignForm({
      name: "",
      targetSegment: "COLD_LEADS",
      step1Title: "Welcome & Introduction",
      step1Delay: 0,
      step1Template: "Selam {clientName}! Thank you for inquiring about {projectName}. View elevation plans: betflow.et/units",
    });
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddStepModal || !addStepForm.title.trim() || !addStepForm.smsTemplate.trim()) return;

    const updated = await addDripStepApi(showAddStepModal, addStepForm);
    setDripCampaigns((prev) => prev.map((c) => (c.id === showAddStepModal ? updated : c)));
    setShowAddStepModal(null);
    showToast(`New sequence step added to campaign!`);
    setAddStepForm({ title: "", delayDays: 3, smsTemplate: "" });
  };

  const handleEnrollLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEnrollModal || !enrollForm.clientName || !enrollForm.clientPhone) return;

    const res = await enrollLeadApi(showEnrollModal, enrollForm);
    if (res.campaign) {
      setDripCampaigns((prev) => prev.map((c) => (c.id === showEnrollModal ? res.campaign! : c)));
    }
    setShowEnrollModal(null);
    showToast(res.message || "Buyer enrolled into sequence successfully!");
    setEnrollForm({ selectedContactId: "", clientName: "", clientPhone: "" });
    loadData();
  };

  const handleOpenRuleEdit = (key: "siteVisit" | "holdExpiry" | "paymentDue") => {
    const rule = rules[key];
    setRuleEditForm({
      enabled: rule.enabled,
      timing: rule.timing,
      template: rule.template,
    });
    setEditingRuleKey(key);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRuleKey) return;

    const updated = await updateRuleApi(editingRuleKey, ruleEditForm);
    setRules((prev) => ({
      ...prev,
      [editingRuleKey]: updated,
    }));
    setEditingRuleKey(null);
    showToast(`Automated trigger rule updated successfully!`);
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
      title="SMS & Drip Automation (የኢትዮ ቴሌኮም SMS መገናኛ)"
      description="Configure automated site visit reminders, 14-day hold expiration alerts, installment due notices, and multi-step SMS drip sequences."
      active="SMS & Drip Automation"
    >
      <div className="space-y-6">
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-[#233b66] text-white px-5 py-3 shadow-xl border border-sky-400/30 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Standard Section Header & Top Actions Card (Uniform with BetFlow CRM Design System) */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-[#233b66]" />
                <h2 className="text-base font-bold text-slate-900">Ethio Telecom Bulk SMS & Drip Engine</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SHORTCODE {stats.shortcode}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {stats.gatewayProvider} · Automated notification engine connected to {contacts.length} CRM database leads & buyers.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="h-9 px-3 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={cn("size-3.5 mr-1.5 text-slate-500", refreshing && "animate-spin")} />
                Refresh
              </Button>

              <Button
                type="button"
                onClick={() => setShowComposer(true)}
                className="bg-[#233b66] hover:bg-[#1d3257] text-white font-medium text-xs h-9 px-4 shadow-xs flex items-center gap-1.5"
              >
                <Send className="size-3.5" />
                <span>Compose Quick SMS</span>
              </Button>
            </div>
          </div>
        </section>



        {/* Uniform Tab Navigation */}
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
              <span>Multi-Step Drip Sequences ({dripCampaigns.length})</span>
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

          {activeTab === "drip" && (
            <Button
              type="button"
              onClick={() => setShowNewCampaignModal(true)}
              className="bg-[#233b66] hover:bg-[#1d3257] text-white font-medium text-xs h-8 px-3 shadow-xs flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>New Drip Campaign</span>
            </Button>
          )}
        </div>

        {/* TAB 1: AUTOMATED REMINDERS RULES */}
        {activeTab === "rules" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Rule 1: Site Visit Reminders */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                    <Calendar className="size-4" />
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {rules.siteVisit.timing}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">Site Visit Reminders</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Sends an automated SMS before a scheduled property site visit with location details and assigned sales agent phone number.
                </p>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">SMS Template:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{rules.siteVisit.template}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-600">
                  Status:{" "}
                  <strong className={rules.siteVisit.enabled ? "text-emerald-600" : "text-amber-600"}>
                    {rules.siteVisit.enabled ? "Active" : "Disabled"}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRuleEdit("siteVisit")}
                    className="h-8 text-xs font-semibold text-[#233b66] border-slate-300 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit3 className="size-3" /> Edit Rule
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const firstContact = contacts[0];
                      setComposerForm({
                        selectedContactId: firstContact?.id || "",
                        recipientName: firstContact?.name || "Ari Kaplan",
                        recipientPhone: firstContact?.phone || "0911550182",
                        templateKey: "SITE_VISIT_REMINDER",
                        body: rules.siteVisit.template,
                      });
                      setShowComposer(true);
                    }}
                    className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>

            {/* Rule 2: 14-Day Hold Countdown Expiry Alerts */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="size-4" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {rules.holdExpiry.timing}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">14-Day Hold Expiry Alerts</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Triggers urgent SMS alerts prior to unit hold voucher expiration to convert warm holds into signed contracts.
                </p>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">SMS Template:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{rules.holdExpiry.template}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-600">
                  Status:{" "}
                  <strong className={rules.holdExpiry.enabled ? "text-emerald-600" : "text-amber-600"}>
                    {rules.holdExpiry.enabled ? "Active" : "Disabled"}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRuleEdit("holdExpiry")}
                    className="h-8 text-xs font-semibold text-[#233b66] border-slate-300 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit3 className="size-3" /> Edit Rule
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const found = contacts.find((c) => c.name.includes("Priya")) || contacts[1];
                      setComposerForm({
                        selectedContactId: found?.id || "",
                        recipientName: found?.name || "Priya Shah",
                        recipientPhone: found?.phone || "0922550144",
                        templateKey: "HOLD_EXPIRY_ALERT",
                        body: rules.holdExpiry.template,
                      });
                      setShowComposer(true);
                    }}
                    className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>

            {/* Rule 3: Payment Installment Due Alerts */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    <Coins className="size-4" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {rules.paymentDue.timing}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">Installment Due Notices</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Reminds property buyers prior to milestone payment due dates (*30/20/20/20/10*) with Commercial Bank of Ethiopia account details.
                </p>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">SMS Template:</span>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">{rules.paymentDue.template}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-600">
                  Status:{" "}
                  <strong className={rules.paymentDue.enabled ? "text-emerald-600" : "text-amber-600"}>
                    {rules.paymentDue.enabled ? "Active" : "Disabled"}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRuleEdit("paymentDue")}
                    className="h-8 text-xs font-semibold text-[#233b66] border-slate-300 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Edit3 className="size-3" /> Edit Rule
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const found = contacts.find((c) => c.name.includes("Marcus")) || contacts[2];
                      setComposerForm({
                        selectedContactId: found?.id || "",
                        recipientName: found?.name || "Marcus Bell",
                        recipientPhone: found?.phone || "0933550118",
                        templateKey: "PAYMENT_DUE_ALERT",
                        body: rules.paymentDue.template,
                      });
                      setShowComposer(true);
                    }}
                    className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-STEP DRIP SEQUENCES */}
        {activeTab === "drip" && (
          <div className="space-y-6">
            {dripCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-5 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{campaign.name}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold border",
                          campaign.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Target Segment: <strong className="text-slate-700">{campaign.targetSegment}</strong> · Enrolled:{" "}
                      <strong className="text-[#233b66] font-bold">{campaign.enrolledCount} buyers</strong> · Steps:{" "}
                      <strong className="text-slate-900 font-semibold">{campaign.steps.length} SMS touchpoints</strong>
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEnrollModal(campaign.id)}
                      className="h-8 px-3 text-xs font-semibold text-[#233b66] border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <UserPlus className="size-3.5 text-[#233b66]" /> Enroll Buyer
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddStepModal(campaign.id)}
                      className="h-8 px-3 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Plus className="size-3.5" /> Add Step
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCampaign(campaign.id)}
                      className="h-8 px-3 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50"
                    >
                      {campaign.status === "ACTIVE" ? (
                        <>
                          <Pause className="size-3.5 mr-1 text-amber-600" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5 mr-1 text-emerald-600" /> Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Steps Visual Timeline */}
                <div className="space-y-3">
                  {campaign.steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#233b66] text-white font-bold text-xs shadow-xs">
                        {step.stepNumber}
                      </div>

                      <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                        <div className="flex items-center justify-between mb-1">
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
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SMS outbox by recipient, phone, or content..."
                  value={outboxSearch}
                  onChange={(e) => setOutboxSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span>
                  Total Logs: <strong className="text-slate-900 font-bold">{filteredLogs.length}</strong>
                </span>
                <span>
                  Total Outbox Cost:{" "}
                  <strong className="text-[#233b66] font-bold">
                    ETB {(filteredLogs.length * 0.35).toFixed(2)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Logs Table (Uniform styling with rest of CRM) */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Recipient Name</th>
                    <th className="px-4 py-3">Ethio Phone</th>
                    <th className="px-4 py-3">SMS Message Content</th>
                    <th className="px-4 py-3">Trigger Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Sent Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No SMS delivery logs match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{log.recipientName}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">+{log.recipientPhone}</td>
                        <td className="px-4 py-3 max-w-md text-slate-700 font-mono text-[11px] truncate">
                          {log.body}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                            {log.triggerType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                              log.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 font-mono">
                          {new Date(log.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: QUICK SMS COMPOSER WITH REAL CRM CONTACT SELECTOR */}
        {showComposer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 relative">
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
                {/* Select CRM Contact */}
                <div>
                  <label className="font-bold text-[#233b66] block mb-1 flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-[#233b66]" />
                    Select CRM Lead / Customer (Real Database Contact)
                  </label>
                  <select
                    value={composerForm.selectedContactId}
                    onChange={(e) => handleSelectContactForComposer(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="">-- Choose from CRM Database --</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (+{c.phone}) - {c.details}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ari Kaplan"
                      value={composerForm.recipientName}
                      onChange={(e) => setComposerForm({ ...composerForm, recipientName: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ethio Phone Number</label>
                    <input
                      type="text"
                      placeholder="0911234567 or +251911..."
                      value={composerForm.recipientPhone}
                      onChange={(e) => setComposerForm({ ...composerForm, recipientPhone: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Template Preset</label>
                  <select
                    value={composerForm.templateKey}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] bg-white"
                  >
                    <option value="CUSTOM">Custom Message Text</option>
                    <option value="SITE_VISIT_REMINDER">Site Visit Reminder Preset</option>
                    <option value="HOLD_EXPIRY_ALERT">14-Day Hold Expiry Alert Preset</option>
                    <option value="PAYMENT_DUE_ALERT">Installment Due Alert Preset</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">SMS Body Text</label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {charCount} chars · <strong className="text-[#233b66]">{segmentCount} segment(s)</strong>
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Type your SMS alert message..."
                    value={composerForm.body}
                    onChange={(e) => setComposerForm({ ...composerForm, body: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono leading-relaxed"
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
                    {sendingSms ? "Dispatching..." : "Send via Shortcode 8844"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE NEW DRIP CAMPAIGN */}
        {showNewCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="size-4 text-[#233b66]" />
                  Create Multi-Step Drip Sequence
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Campaign Sequence Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury Apartment Buyer Nurturing"
                    value={newCampaignForm.name}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Lead Segment</label>
                  <select
                    value={newCampaignForm.targetSegment}
                    onChange={(e) =>
                      setNewCampaignForm({
                        ...newCampaignForm,
                        targetSegment: e.target.value as DripCampaign["targetSegment"],
                      })
                    }
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] bg-white font-semibold text-slate-700"
                  >
                    <option value="COLD_LEADS">COLD LEADS (New Inquiries)</option>
                    <option value="WARM_LEADS">WARM LEADS (Post-Site Visit)</option>
                    <option value="SITE_VISITORS">SITE VISITORS (Attended Tour)</option>
                    <option value="RESERVATION_CLIENTS">RESERVATION CLIENTS (Placed Hold)</option>
                  </select>
                </div>

                {/* Step 1 Configuration */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Initial Step #1 Configuration</span>
                    <span className="text-[10px] text-[#233b66] bg-[#233b66]/10 px-2 py-0.5 rounded font-semibold">
                      Immediate Intake
                    </span>
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Step Title</label>
                      <input
                        type="text"
                        value={newCampaignForm.step1Title}
                        onChange={(e) => setNewCampaignForm({ ...newCampaignForm, step1Title: e.target.value })}
                        className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-[#233b66]"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Delay (Days)</label>
                      <input
                        type="number"
                        min={0}
                        max={90}
                        value={newCampaignForm.step1Delay}
                        onChange={(e) =>
                          setNewCampaignForm({ ...newCampaignForm, step1Delay: Number(e.target.value) || 0 })
                        }
                        className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-[#233b66]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Step 1 SMS Template</label>
                    <textarea
                      rows={3}
                      value={newCampaignForm.step1Template}
                      onChange={(e) => setNewCampaignForm({ ...newCampaignForm, step1Template: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-[#233b66] font-mono leading-relaxed"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCampaignModal(false)}
                    className="h-9 px-4 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-9 px-5 bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs"
                  >
                    Create Sequence
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD STEP TO EXISTING CAMPAIGN */}
        {showAddStepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="size-4 text-[#233b66]" />
                  Add Step to Drip Sequence
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddStep} className="space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Step Title</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Site Visit Follow-up"
                      value={addStepForm.title}
                      onChange={(e) => setAddStepForm({ ...addStepForm, title: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Delay (Days)</label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={addStepForm.delayDays}
                      onChange={(e) => setAddStepForm({ ...addStepForm, delayDays: Number(e.target.value) || 0 })}
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMS Template Text</label>
                  <textarea
                    rows={4}
                    placeholder="Selam {clientName}! Remember to schedule your private tour..."
                    value={addStepForm.smsTemplate}
                    onChange={(e) => setAddStepForm({ ...addStepForm, smsTemplate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddStepModal(null)}
                    className="h-9 px-4 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-9 px-5 bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs"
                  >
                    Save Step
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: ENROLL BUYER INTO CAMPAIGN WITH REAL CRM CONTACT SELECTOR */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="size-4 text-[#233b66]" />
                  Enroll Buyer into Drip Sequence
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEnrollLead} className="space-y-4 text-xs">
                {/* Select CRM Contact */}
                <div>
                  <label className="font-bold text-[#233b66] block mb-1 flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-[#233b66]" />
                    Select CRM Lead / Customer (Real Database Contact)
                  </label>
                  <select
                    value={enrollForm.selectedContactId}
                    onChange={(e) => handleSelectContactForEnroll(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="">-- Choose from CRM Database --</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (+{c.phone}) - {c.details}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Buyer Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ari Kaplan"
                    value={enrollForm.clientName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, clientName: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ethio Phone Number</label>
                  <input
                    type="text"
                    placeholder="0911234567 or +251911..."
                    value={enrollForm.clientPhone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, clientPhone: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono"
                    required
                  />
                </div>

                <div className="rounded-lg bg-sky-50 p-3 text-sky-800 text-[11px] leading-relaxed border border-sky-200">
                  <strong>Notice:</strong> Enrolling this CRM lead will trigger multi-step SMS touchpoints according to the drip timeline sequence.
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEnrollModal(null)}
                    className="h-9 px-4 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-9 px-5 bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs"
                  >
                    Confirm Enrollment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: EDIT AUTOMATED RULE */}
        {editingRuleKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="size-4 text-[#233b66]" />
                  Configure Trigger Rule Template
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingRuleKey(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <span className="font-bold text-slate-900 block">Enable Automated Trigger</span>
                    <span className="text-[11px] text-slate-500">Automatically dispatch SMS when conditions match</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ruleEditForm.enabled}
                    onChange={(e) => setRuleEditForm({ ...ruleEditForm, enabled: e.target.checked })}
                    className="size-4 rounded border-slate-300 text-[#233b66] focus:ring-[#233b66]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trigger Timing</label>
                  <input
                    type="text"
                    value={ruleEditForm.timing}
                    onChange={(e) => setRuleEditForm({ ...ruleEditForm, timing: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SMS Template Text</label>
                  <textarea
                    rows={4}
                    value={ruleEditForm.template}
                    onChange={(e) => setRuleEditForm({ ...ruleEditForm, template: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-[#233b66] focus:ring-1 focus:ring-[#233b66] font-mono leading-relaxed"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Available variables: <code>{"{clientName}"}</code>, <code>{"{projectName}"}</code>, <code>{"{unitNumber}"}</code>, <code>{"{agentPhone}"}</code>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingRuleKey(null)}
                    className="h-9 px-4 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-9 px-5 bg-[#233b66] hover:bg-[#1d3257] text-white font-bold text-xs"
                  >
                    Save Rule Changes
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
