"use client";

import { useState, useEffect, useMemo } from "react";
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
  Trash2,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { StatCard, StatRow } from "@/components/ui/stat-card";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
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
  deleteDripStepApi,
  deleteDripCampaignApi,
  enrollLeadApi,
  fetchRulesApi,
  updateRuleApi,
  fetchSmsTemplatesApi,
  broadcastConstructionApi,
  fetchSiteVisitsForSms,
  fetchReservationsForSms,
  fetchPaymentSchedulesForSms,
  type LocalizedTemplate,
  type SiteVisitOption,
  type ReservationOption,
  type PaymentScheduleOption,
} from "@/lib/sms";
import { interpolateTemplate } from "@/lib/sms-template";
import { SmsCampaignModal } from "@/features/automation/sms-campaign-modal";
import { cn } from "@/lib/utils";

export function SmsAutomationView() {
  const { success } = useToast();
  // Active Tab: "rules" | "drip" | "outbox" | "templates"
  const [activeTab, setActiveTab] = useState<
    "rules" | "drip" | "outbox" | "templates"
  >("rules");

  // Localized Templates & Broadcast State
  const [templates, setTemplates] = useState<LocalizedTemplate[]>([]);
  const [templateLang, setTemplateLang] = useState<"am" | "en">("am");
  const [broadcastState, setBroadcastState] = useState({
    projectId: "",
    stageName: "STRUCTURE_CONCRETE_SLAB",
    language: "am" as "am" | "en",
    loading: false,
  });

  // Loading & Refresh State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // System Stats State
  const [stats, setStats] = useState<SmsStats>({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    deliveryRate: 0,
    totalCostBirr: 0,
    gatewayProvider: "Ethio Telecom Shortcode Gateway (Syncing...)",
    shortcode: "8844",
    isLive: false,
    activeCampaignsCount: 0,
  });

  // Contacts from CRM Database
  const [contacts, setContacts] = useState<SmsContact[]>([]);

  // Section Error State
  const [sectionErrors, setSectionErrors] = useState<{
    stats?: boolean;
    contacts?: boolean;
    logs?: boolean;
    drip?: boolean;
    rules?: boolean;
    templates?: boolean;
  }>({});

  // Automated Trigger Rules State
  const [rules, setRules] = useState<TriggerRulesMap>({
    siteVisit: {
      enabled: true,
      timing: "2 Hours Prior",
      template: DEFAULT_SMS_TEMPLATES.SITE_VISIT_REMINDER,
    },
    holdExpiry: {
      enabled: true,
      timing: "48h & 24h Prior",
      template: DEFAULT_SMS_TEMPLATES.HOLD_EXPIRY_ALERT,
    },
    paymentDue: {
      enabled: true,
      timing: "3 Days Prior",
      template: DEFAULT_SMS_TEMPLATES.PAYMENT_DUE_ALERT,
    },
  });

  // Drip Campaigns State
  const [dripCampaigns, setDripCampaigns] = useState<DripCampaign[]>([]);

  // Outbox Logs State
  const [logs, setLogs] = useState<SmsLog[]>([]);

  // Outbox Search & Filters
  const [outboxSearch, setOutboxSearch] = useState("");
  const [outboxStatusFilter, setOutboxStatusFilter] = useState<string>("ALL");

  // Modals visibility state
  const [showComposer, setShowComposer] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState<string | null>(null);
  const [editingRuleKey, setEditingRuleKey] = useState<
    "siteVisit" | "holdExpiry" | "paymentDue" | null
  >(null);

  // Record lists for template pickers
  const [siteVisitsList, setSiteVisitsList] = useState<SiteVisitOption[]>([]);
  const [reservationsList, setReservationsList] = useState<ReservationOption[]>(
    [],
  );
  const [paymentSchedulesList, setPaymentSchedulesList] = useState<
    PaymentScheduleOption[]
  >([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Form States
  const [composerForm, setComposerForm] = useState({
    selectedContactId: "",
    recipientName: "",
    recipientPhone: "",
    templateKey: "CUSTOM",
    body: "",
  });

  const [newCampaignForm, setNewCampaignForm] = useState({
    name: "",
    description: "",
    targetSegment: "COLD_LEADS" as DripCampaign["targetSegment"],
  });

  const [addStepForm, setAddStepForm] = useState({
    dayOffset: 1,
    timeOfDay: "09:00",
    templateKey: "WELCOME_SEQUENCE",
    body: "",
  });

  const [enrollForm, setEnrollForm] = useState({
    selectedContactId: "",
    name: "",
    phone: "",
  });

  const [ruleEditForm, setRuleEditForm] = useState({
    enabled: true,
    timing: "",
    template: "",
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    success(msg);
  };

  const { charCount, segmentCount } = useMemo(
    () => calculateSmsSegments(composerForm.body),
    [composerForm.body],
  );

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const results = await Promise.allSettled([
      fetchSmsStats(),
      fetchSmsContacts(),
      fetchOutboxLogs(),
      fetchDripCampaigns(),
      fetchRulesApi(),
      fetchSmsTemplatesApi(),
      fetchSiteVisitsForSms(),
      fetchReservationsForSms(),
      fetchPaymentSchedulesForSms(),
    ]);

    const errors: typeof sectionErrors = {};

    if (results[0].status === "fulfilled") setStats(results[0].value);
    else errors.stats = true;

    if (results[1].status === "fulfilled") setContacts(results[1].value);
    else errors.contacts = true;

    if (results[2].status === "fulfilled") setLogs(results[2].value);
    else errors.logs = true;

    if (results[3].status === "fulfilled") setDripCampaigns(results[3].value);
    else errors.drip = true;

    if (results[4].status === "fulfilled") setRules(results[4].value);
    else errors.rules = true;

    if (results[5].status === "fulfilled") setTemplates(results[5].value);
    else errors.templates = true;

    if (results[6].status === "fulfilled") setSiteVisitsList(results[6].value);
    if (results[7].status === "fulfilled") setReservationsList(results[7].value);
    if (results[8].status === "fulfilled")
      setPaymentSchedulesList(results[8].value);

    setSectionErrors(errors);
    if (isRefresh) showToast("SMS & Drip Gateway synced with Ethio Telecom");

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setComposerForm((prev) => ({
        ...prev,
        selectedContactId: contactId,
        recipientName: contact.name,
        recipientPhone: contact.phone || "",
      }));
    } else {
      setComposerForm((prev) => ({
        ...prev,
        selectedContactId: "",
      }));
    }
  };

  const handleEnrollContactSelect = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setEnrollForm({
        selectedContactId: contactId,
        name: contact.name,
        phone: contact.phone || "",
      });
    } else {
      setEnrollForm((prev) => ({ ...prev, selectedContactId: "" }));
    }
  };

  const handleTemplateSelect = (key: string) => {
    setSelectedRecordId("");
    let rawTemplate = "";
    if (key === "SITE_VISIT_REMINDER") rawTemplate = rules.siteVisit.template;
    else if (key === "HOLD_EXPIRY_ALERT")
      rawTemplate = rules.holdExpiry.template;
    else if (key === "PAYMENT_DUE_ALERT")
      rawTemplate = rules.paymentDue.template;

    if (key === "CUSTOM") {
      setComposerForm((prev) => ({
        ...prev,
        templateKey: key,
        body: "",
      }));
      setMissingFields([]);
    } else {
      const { missing } = interpolateTemplate(rawTemplate, {});
      setComposerForm((prev) => ({
        ...prev,
        templateKey: key,
        body: rawTemplate,
      }));
      setMissingFields(missing);
    }
  };

  const handleSiteVisitSelect = (visitId: string) => {
    setSelectedRecordId(visitId);
    const visit = siteVisitsList.find((v) => v.id === visitId);
    if (!visit) {
      const { missing } = interpolateTemplate(rules.siteVisit.template, {});
      setComposerForm((prev) => ({
        ...prev,
        body: rules.siteVisit.template,
      }));
      setMissingFields(missing);
      return;
    }

    const { body, missing } = interpolateTemplate(rules.siteVisit.template, {
      clientName: visit.clientName,
      projectName: visit.projectName,
      visitDate: visit.visitDate,
      visitTime: visit.visitTime,
      agentName: visit.agentName,
      agentPhone: visit.agentPhone,
    });

    setComposerForm((prev) => ({
      ...prev,
      selectedContactId: visit.id,
      recipientName: visit.clientName,
      recipientPhone: visit.phone,
      body,
    }));
    setMissingFields(missing);
  };

  const handleReservationSelect = (resId: string) => {
    setSelectedRecordId(resId);
    const res = reservationsList.find((r) => r.id === resId);
    if (!res) {
      const { missing } = interpolateTemplate(rules.holdExpiry.template, {});
      setComposerForm((prev) => ({
        ...prev,
        body: rules.holdExpiry.template,
      }));
      setMissingFields(missing);
      return;
    }

    const { body, missing } = interpolateTemplate(rules.holdExpiry.template, {
      clientName: res.clientName,
      unitNumber: res.unitNumber,
      projectName: res.projectName,
      hoursLeft: res.hoursLeft,
    });

    setComposerForm((prev) => ({
      ...prev,
      selectedContactId: res.id,
      recipientName: res.clientName,
      recipientPhone: res.phone,
      body,
    }));
    setMissingFields(missing);
  };

  const handlePaymentScheduleSelect = (schedId: string) => {
    setSelectedRecordId(schedId);
    const sched = paymentSchedulesList.find((s) => s.id === schedId);
    if (!sched) {
      const { missing } = interpolateTemplate(rules.paymentDue.template, {});
      setComposerForm((prev) => ({
        ...prev,
        body: rules.paymentDue.template,
      }));
      setMissingFields(missing);
      return;
    }

    const { body, missing } = interpolateTemplate(rules.paymentDue.template, {
      clientName: sched.clientName,
      milestoneName: sched.milestoneName,
      amount: sched.amount,
      dueDate: sched.dueDate,
      unitNumber: sched.unitNumber,
      projectName: sched.projectName,
    });

    setComposerForm((prev) => ({
      ...prev,
      selectedContactId: sched.id,
      recipientName: sched.clientName,
      recipientPhone: sched.phone,
      body,
    }));
    setMissingFields(missing);
  };

  const handleBodyChange = (newBody: string) => {
    setComposerForm((prev) => ({ ...prev, body: newBody }));
    const rawMatches = Array.from(
      new Set(
        (newBody.match(/\{([a-zA-Z0-9_]+)\}/g) || []).map((m) =>
          m.slice(1, -1),
        ),
      ),
    );
    setMissingFields(rawMatches);
  };

  const [sendingSms, setSendingSms] = useState(false);

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !composerForm.recipientPhone ||
      !composerForm.body.trim() ||
      sendingSms
    )
      return;

    setSendingSms(true);
    try {
      const newLog = await sendSmsApi({
        recipientName: composerForm.recipientName.trim() || "Recipient",
        recipientPhone: composerForm.recipientPhone,
        body: composerForm.body.trim(),
        triggerType:
          composerForm.templateKey !== "CUSTOM"
            ? composerForm.templateKey
            : "MANUAL_BROADCAST",
      });

      setLogs((prev) => [newLog, ...prev]);

      if (newLog.status === "FAILED") {
        showToast(
          `SMS dispatch failed on gateway. Please verify the phone number (+${formatEthioPhone(composerForm.recipientPhone)}) or AfroMessage credit.`,
        );
      } else {
        showToast(
          `SMS successfully sent to +${formatEthioPhone(composerForm.recipientPhone)}!`,
        );
      }

      void loadData(false);
      setShowComposer(false);
      setComposerForm({
        selectedContactId: "",
        recipientName: "",
        recipientPhone: "",
        templateKey: "CUSTOM",
        body: "",
      });
      setSelectedRecordId("");
      setMissingFields([]);
    } catch (err: any) {
      showToast(`Failed to send SMS: ${err.message || "Network error"}`);
    } finally {
      setSendingSms(false);
    }
  };

  const toggleCampaign = async (id: string) => {
    const updated = await toggleDripCampaignApi(id);
    setDripCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast(
      `Drip Campaign sequence '${updated.name}' set to ${updated.status}`,
    );
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete sequence '${name}'?`)) return;
    await deleteDripCampaignApi(id);
    setDripCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast(`Drip sequence '${name}' deleted.`);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignForm.name.trim()) return;

    const created = await createDripCampaignApi({
      name: newCampaignForm.name.trim(),
      targetSegment: newCampaignForm.targetSegment,
    });

    setDripCampaigns((prev) => [...prev, created]);
    setShowNewCampaignModal(false);
    setNewCampaignForm({
      name: "",
      description: "",
      targetSegment: "COLD_LEADS",
    });
    showToast(`Drip campaign '${created.name}' created!`);
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddStepModal || !addStepForm.body.trim()) return;

    const updated = await addDripStepApi(showAddStepModal, {
      delayDays: Number(addStepForm.dayOffset) || 1,
      title: `Step (Day ${addStepForm.dayOffset})`,
      smsTemplate: addStepForm.body.trim(),
    });

    setDripCampaigns((prev) =>
      prev.map((c) => (c.id === showAddStepModal ? updated : c)),
    );
    setShowAddStepModal(null);
    setAddStepForm({
      dayOffset: 1,
      timeOfDay: "09:00",
      templateKey: "WELCOME_SEQUENCE",
      body: "",
    });
    showToast(`New drip step added successfully!`);
  };

  const handleDeleteStep = async (campaignId: string, stepId: string) => {
    const updated = await deleteDripStepApi(campaignId, stepId);
    setDripCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? updated : c)),
    );
    showToast(`Drip step removed.`);
  };

  const handleEnrollLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEnrollModal || !enrollForm.phone.trim()) return;

    const res = await enrollLeadApi(showEnrollModal, {
      clientName: enrollForm.name.trim() || "Lead",
      clientPhone: enrollForm.phone.trim(),
    });

    if (res.campaign) {
      const updated = res.campaign;
      setDripCampaigns((prev) =>
        prev.map((c) => (c.id === showEnrollModal ? updated : c)),
      );
    } else {
      setDripCampaigns((prev) =>
        prev.map((c) =>
          c.id === showEnrollModal
            ? { ...c, enrolledCount: c.enrolledCount + 1 }
            : c,
        ),
      );
    }

    setShowEnrollModal(null);
    setEnrollForm({ selectedContactId: "", name: "", phone: "" });
    showToast(
      `Enrolled +${formatEthioPhone(enrollForm.phone)} into drip sequence!`,
    );
  };

  const handleToggleRule = async (
    key: "siteVisit" | "holdExpiry" | "paymentDue",
  ) => {
    const target = rules[key];
    const updatedRule = await updateRuleApi(key, { enabled: !target.enabled });
    setRules((prev) => ({ ...prev, [key]: updatedRule }));
    showToast(
      `Rule '${key}' ${updatedRule.enabled ? "Enabled" : "Disabled"}`,
    );
  };

  const openEditRuleModal = (
    key: "siteVisit" | "holdExpiry" | "paymentDue",
  ) => {
    const target = rules[key];
    setRuleEditForm({
      enabled: target.enabled,
      timing: target.timing,
      template: target.template,
    });
    setEditingRuleKey(key);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRuleKey) return;

    const updated = await updateRuleApi(editingRuleKey, {
      enabled: ruleEditForm.enabled,
      timing: ruleEditForm.timing,
      template: ruleEditForm.template,
    });

    setRules((prev) => ({ ...prev, [editingRuleKey]: updated }));
    setEditingRuleKey(null);
    showToast(`Automated trigger rule updated successfully!`);
  };

  const insertVariableTag = (
    tag: string,
    setter: (fn: (prev: string) => string) => void,
  ) => {
    setter((prev) => `${prev} ${tag}`);
  };

  const handleBroadcastConstruction = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await broadcastConstructionApi({
        projectId: broadcastState.projectId,
        stageName: broadcastState.stageName,
        language: broadcastState.language,
      });

      showToast(
        `Construction update broadcast sent to ${res.recipientsCount} buyers!`,
      );
      await loadData(true);
    } catch (err: any) {
      showToast(`Broadcast failed: ${err.message}`);
    } finally {
      setBroadcastState((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredLogs = logs.filter((l) => {
    const term = outboxSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      l.recipientName.toLowerCase().includes(term) ||
      l.recipientPhone.includes(term) ||
      l.body.toLowerCase().includes(term) ||
      l.triggerType.toLowerCase().includes(term);

    const matchesStatus =
      outboxStatusFilter === "ALL" || l.status === outboxStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-6">
          <CardSkeleton count={4} />
          <CardSkeleton count={3} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Section Header & Actions */}
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  <h2 className="text-base font-bold text-slate-900">
                    Ethio Telecom Bulk SMS & Drip Engine
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success border border-success/20">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    SHORTCODE {stats.shortcode}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {stats.gatewayProvider} · Connected to {contacts.length} CRM
                  database contacts.
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
                  <RefreshCw
                    className={cn(
                      "size-3.5 mr-1.5 text-slate-500",
                      refreshing && "animate-spin",
                    )}
                  />
                  Refresh
                </Button>

                <Button
                  type="button"
                  onClick={() => setShowComposer(true)}
                  className="font-medium text-xs h-9 px-4 shadow-xs flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Compose Quick SMS</span>
                </Button>
              </div>
            </div>
          </section>

          {/* Metric Stat Cards */}
          <StatRow>
            <StatCard
              label="Total SMS Dispatched"
              value={stats.totalSent.toString()}
              detail={stats.gatewayProvider}
              icon={Send}
              color="navy"
              trend={stats.isLive ? "up" : "down"}
              trendLabel={stats.isLive ? "Active Gateway" : "Inactive"}
            />
            <StatCard
              label="Delivery Success Rate"
              value={`${stats.deliveryRate}%`}
              detail={`${stats.delivered} delivered / ${stats.failed} failed`}
              icon={CheckCircle2}
              color={stats.deliveryRate >= 90 ? "emerald" : "amber"}
              trend={stats.deliveryRate >= 90 ? "up" : "down"}
              trendLabel={stats.deliveryRate >= 90 ? "Verified Delivery" : "Pending Callback"}
            />
            <StatCard
              label={
                stats.accountBalanceBirr !== undefined && stats.accountBalanceBirr !== null
                  ? "AfroMessage Balance"
                  : "Total Outbox Cost"
              }
              value={
                stats.accountBalanceBirr !== undefined && stats.accountBalanceBirr !== null
                  ? `ETB ${stats.accountBalanceBirr.toFixed(2)}`
                  : `ETB ${stats.totalCostBirr.toFixed(2)}`
              }
              detail={
                stats.accountBalanceBirr !== undefined && stats.accountBalanceBirr !== null
                  ? "Real-Time Gateway Credit"
                  : "Estimated Outbox Expenditure"
              }
              icon={Coins}
              color="amber"
            />
            <StatCard
              label="Active Drip Sequences"
              value={(stats.activeCampaignsCount ?? dripCampaigns.length).toString()}
              detail={`${dripCampaigns.reduce((acc, c) => acc + c.enrolledCount, 0)} enrolled buyers`}
              icon={Layers}
              color="indigo"
              trend="up"
              trendLabel="Automated"
            />
          </StatRow>

          {/* Tab Navigation */}
          {sectionErrors.stats && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs font-semibold text-warning flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Couldn't load live gateway stats from server.</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all shrink-0 cursor-pointer",
                  activeTab === "rules"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900",
                )}
              >
                <Zap className="size-4" />
                Automated Trigger Rules (3)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("drip")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all shrink-0 cursor-pointer",
                  activeTab === "drip"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900",
                )}
              >
                <Layers className="size-4" />
                Drip Sequences ({dripCampaigns.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all shrink-0 cursor-pointer",
                  activeTab === "templates"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900",
                )}
              >
                <Sparkles className="size-4" />
                Localized Templates ({templates.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("outbox")}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all shrink-0 cursor-pointer",
                  activeTab === "outbox"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900",
                )}
              >
                <Clock className="size-4" />
                Live Outbox Logs ({logs.length})
              </button>
            </div>
          </div>

          {/* TAB 1: AUTOMATED TRIGGER RULES */}
          {activeTab === "rules" && (
            <div className="space-y-6">
              {sectionErrors.rules && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs font-semibold text-warning flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Couldn't load live trigger rules from server.</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Rule 1: Site Visit Reminder */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-primary/30">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-info/10 text-info">
                        <Calendar className="size-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleRule("siteVisit")}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          rules.siteVisit.enabled
                            ? "bg-success"
                            : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            rules.siteVisit.enabled
                              ? "translate-x-4"
                              : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                      1. Site Visit Confirmation & Reminder
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Triggers automated SMS 2 hours prior to scheduled property tour.
                    </p>

                    <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200/80 font-mono text-[11px] text-slate-700 leading-relaxed">
                      "{rules.siteVisit.template}"
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500">
                      Timing: {rules.siteVisit.timing}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditRuleModal("siteVisit")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="size-3" /> Edit Rule
                    </button>
                  </div>
                </div>

                {/* Rule 2: Hold Expiry Warning */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-primary/30">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
                        <Clock className="size-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleRule("holdExpiry")}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          rules.holdExpiry.enabled
                            ? "bg-success"
                            : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            rules.holdExpiry.enabled
                              ? "translate-x-4"
                              : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                      2. 14-Day Unit Hold Expiration Alert
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Alerts buyer 48h and 24h before unit inventory auto-release.
                    </p>

                    <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200/80 font-mono text-[11px] text-slate-700 leading-relaxed">
                      "{rules.holdExpiry.template}"
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500">
                      Timing: {rules.holdExpiry.timing}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditRuleModal("holdExpiry")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="size-3" /> Edit Rule
                    </button>
                  </div>
                </div>

                {/* Rule 3: Payment Milestone Due */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-primary/30">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
                        <Coins className="size-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleRule("paymentDue")}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          rules.paymentDue.enabled
                            ? "bg-success"
                            : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            rules.paymentDue.enabled
                              ? "translate-x-4"
                              : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                      3. Construction Installment Due Notice
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Reminds buyers 3 days prior to milestone payment due date.
                    </p>

                    <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200/80 font-mono text-[11px] text-slate-700 leading-relaxed">
                      "{rules.paymentDue.template}"
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500">
                      Timing: {rules.paymentDue.timing}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditRuleModal("paymentDue")}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="size-3" /> Edit Rule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DRIP SEQUENCES */}
          {activeTab === "drip" && (
            <div className="space-y-6">
              {sectionErrors.drip && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs font-semibold text-warning flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Couldn't load live drip sequences from server.</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Automated Buyer Nurture Drip Sequences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Multi-touch SMS campaigns dispatched over specified day intervals.
                  </p>
                </div>
                <Button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="text-xs font-bold h-8.5 px-3.5"
                >
                  <Plus className="size-3.5 mr-1" /> New Drip Sequence
                </Button>
              </div>

              <div className="space-y-4">
                {dripCampaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {camp.name}
                          </h4>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border",
                              camp.status === "ACTIVE"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-slate-100 text-slate-600 border-slate-200",
                            )}
                          >
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Automated drip sequence · Segment:{" "}
                          <span className="font-semibold text-slate-700">
                            {camp.targetSegment}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => toggleCampaign(camp.id)}
                          className="h-8 text-xs font-semibold"
                        >
                          {camp.status === "ACTIVE" ? (
                            <>
                              <Pause className="size-3 mr-1 text-warning" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="size-3 mr-1 text-success" /> Activate
                            </>
                          )}
                        </Button>

                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setShowEnrollModal(camp.id)}
                          className="h-8 text-xs font-semibold text-primary border-primary/20 bg-primary/10 hover:bg-primary/20"
                        >
                          <UserPlus className="size-3 mr-1" /> Enroll Buyer ({camp.enrolledCount})
                        </Button>

                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            handleDeleteCampaign(camp.id, camp.name)
                          }
                          className="h-8 text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Steps list */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Sequence Steps ({camp.steps.length})
                      </p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {camp.steps.map((st, idx) => (
                          <div
                            key={st.id}
                            className="relative rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                              <span>Step {st.stepNumber || idx + 1}: Day {st.delayDays}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteStep(camp.id, st.id)}
                                className="text-slate-400 hover:text-destructive cursor-pointer"
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                            <p className="font-mono text-[11px] text-slate-700 line-clamp-3">
                              "{st.smsTemplate}"
                            </p>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => setShowAddStepModal(camp.id)}
                          className="flex min-h-[90px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        >
                          <Plus className="size-4 mb-1" />
                          Add Step
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOCALIZED TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Ethio Telecom Approved SMS Templates (Amharic & English)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standardized templates for site visits, pro-forma deadlines, and construction milestones.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Language:</span>
                    <button
                      type="button"
                      onClick={() => setTemplateLang("am")}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                        templateLang === "am"
                          ? "bg-primary text-primary-foreground"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      አማርኛ (Amharic)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateLang("en")}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer",
                        templateLang === "en"
                          ? "bg-primary text-primary-foreground"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.category}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary text-xs">
                          {tpl.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {tpl.category}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-800 leading-relaxed bg-white p-3 rounded border border-slate-200">
                        {templateLang === "am" ? tpl.am : tpl.en}
                      </p>
                      <div className="flex justify-end pt-1">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const text =
                              templateLang === "am" ? tpl.am : tpl.en;
                            setComposerForm((prev) => ({
                              ...prev,
                              body: text,
                            }));
                            setShowComposer(true);
                          }}
                          className="h-7 text-[11px] font-semibold text-primary"
                        >
                          Use Template in Composer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OUTBOX LOGS */}
          {activeTab === "outbox" && (
            <div className="space-y-4">
              {sectionErrors.logs && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs font-semibold text-warning flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Couldn't load live outbox logs from server.</span>
                </div>
              )}
              {/* Outbox Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recipient name, phone, or message body…"
                    value={outboxSearch}
                    onChange={(e) => setOutboxSearch(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <select
                    value={outboxStatusFilter}
                    onChange={(e) => setOutboxStatusFilter(e.target.value)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-primary"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Recipient</th>
                        <th className="px-4 py-3">Phone Number</th>
                        <th className="px-4 py-3">Message Body</th>
                        <th className="px-4 py-3">Trigger Type</th>
                        <th className="px-4 py-3">Date Dispatched</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {log.recipientName}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            +{formatEthioPhone(log.recipientPhone)}
                          </td>
                          <td className="px-4 py-3 max-w-xs font-mono text-[11px] text-slate-800 truncate">
                            {log.body}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-semibold">
                            {log.triggerType}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border",
                                log.status === "DELIVERED"
                                  ? "bg-success/10 text-success border-success/20"
                                  : log.status === "FAILED"
                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                    : "bg-warning/10 text-warning border-warning/20",
                              )}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quick SMS Composer Modal */}
          {showComposer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="size-5 text-primary" />
                    <h3 className="text-base font-bold text-slate-900">
                      Ethio Telecom Direct SMS Composer
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowComposer(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleSendSms} className="space-y-4">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SMS Template Preset
                    </label>
                    <select
                      value={composerForm.templateKey}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary bg-white"
                    >
                      <option value="CUSTOM">Custom Free-Text Message</option>
                      <option value="SITE_VISIT_REMINDER">
                        Site Visit Reminder ({rules.siteVisit.timing})
                      </option>
                      <option value="HOLD_EXPIRY_ALERT">
                        14-Day Hold Expiry Alert ({rules.holdExpiry.timing})
                      </option>
                      <option value="PAYMENT_DUE_ALERT">
                        Payment Milestone Due Alert ({rules.paymentDue.timing})
                      </option>
                    </select>
                  </div>

                  {/* Dynamic Record Picker */}
                  {composerForm.templateKey === "CUSTOM" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Contact from CRM Database
                      </label>
                      <select
                        value={composerForm.selectedContactId}
                        onChange={(e) => handleContactSelect(e.target.value)}
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                      >
                        <option value="">Custom Manual Phone Entry…</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone || "No Phone"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {composerForm.templateKey === "SITE_VISIT_REMINDER" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Scheduled Site Visit *
                      </label>
                      <select
                        required
                        value={selectedRecordId}
                        onChange={(e) => handleSiteVisitSelect(e.target.value)}
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary bg-white"
                      >
                        <option value="">Choose a scheduled site visit…</option>
                        {siteVisitsList.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.clientName} — {v.projectName} ({v.visitDate}{" "}
                            {v.visitTime})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {composerForm.templateKey === "HOLD_EXPIRY_ALERT" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Active Hold Reservation *
                      </label>
                      <select
                        required
                        value={selectedRecordId}
                        onChange={(e) =>
                          handleReservationSelect(e.target.value)
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary bg-white"
                      >
                        <option value="">Choose an active reservation…</option>
                        {reservationsList.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.clientName} — Unit {r.unitNumber} (
                            {r.projectName}) · {r.hoursLeft}h left
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {composerForm.templateKey === "PAYMENT_DUE_ALERT" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Due Payment Schedule *
                      </label>
                      <select
                        required
                        value={selectedRecordId}
                        onChange={(e) =>
                          handlePaymentScheduleSelect(e.target.value)
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary bg-white"
                      >
                        <option value="">
                          Choose a due payment schedule…
                        </option>
                        {paymentSchedulesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.clientName} — {s.milestoneName}: ETB {s.amount}{" "}
                            (Due {s.dueDate})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Recipient Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={composerForm.recipientName}
                        onChange={(e) =>
                          setComposerForm({
                            ...composerForm,
                            recipientName: e.target.value,
                          })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone (2519... or 09...) *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="0911223344"
                        value={composerForm.recipientPhone}
                        onChange={(e) =>
                          setComposerForm({
                            ...composerForm,
                            recipientPhone: e.target.value,
                          })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Body *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={composerForm.body}
                      onChange={(e) => handleBodyChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-primary font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>
                        {charCount} characters · {segmentCount} SMS Segment(s)
                      </span>
                      <span>ETB {(segmentCount * 0.35).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Missing variables alert */}
                  {missingFields.length > 0 && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          Unfilled template placeholder(s) detected:
                        </p>
                        <p className="mt-0.5 text-[11px] text-amber-800">
                          Missing values for:{" "}
                          <span className="font-mono font-bold text-amber-950">
                            {missingFields.map((f) => `{${f}}`).join(", ")}
                          </span>
                          . Please select a record with complete data or fill in
                          the placeholders before sending.
                        </p>
                      </div>
                    </div>
                  )}

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
                      disabled={
                        sendingSms ||
                        missingFields.length > 0 ||
                        !composerForm.recipientPhone ||
                        !composerForm.body.trim()
                      }
                      className="font-bold text-xs px-5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingSms ? "Sending..." : "Send SMS (ETB 0.35)"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* New Drip Campaign Modal */}
          {showNewCampaignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Create New Buyer Drip Sequence
                  </h3>
                  <button
                    onClick={() => setShowNewCampaignModal(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sequence Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Diaspora Buyer Onboarding Drip"
                      value={newCampaignForm.name}
                      onChange={(e) =>
                        setNewCampaignForm({
                          ...newCampaignForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Audience Segment *
                    </label>
                    <select
                      value={newCampaignForm.targetSegment}
                      onChange={(e) =>
                        setNewCampaignForm({
                          ...newCampaignForm,
                          targetSegment: e.target
                            .value as DripCampaign["targetSegment"],
                        })
                      }
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                    >
                      <option value="COLD_LEADS">Cold Leads (New Inquiries)</option>
                      <option value="WARM_LEADS">Warm Leads (Active Prospects)</option>
                      <option value="SITE_VISITORS">Site Visitors (Tour Completed)</option>
                      <option value="RESERVATION_CLIENTS">Reservation Clients (Deposit Paid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description & Goal
                    </label>
                    <textarea
                      rows={2}
                      value={newCampaignForm.description}
                      onChange={(e) =>
                        setNewCampaignForm({
                          ...newCampaignForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief overview of campaign objective..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCampaignModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="font-bold text-xs px-5 shadow-xs"
                    >
                      Save Drip Campaign
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Drip Step Modal */}
          {showAddStepModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Add Sequence Step
                  </h3>
                  <button
                    onClick={() => setShowAddStepModal(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleAddStep} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Day Offset (Days after trigger) *
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={addStepForm.dayOffset}
                        onChange={(e) =>
                          setAddStepForm({
                            ...addStepForm,
                            dayOffset: Number(e.target.value),
                          })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Time of Day *
                      </label>
                      <input
                        required
                        type="time"
                        value={addStepForm.timeOfDay}
                        onChange={(e) =>
                          setAddStepForm({
                            ...addStepForm,
                            timeOfDay: e.target.value,
                          })
                        }
                        className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Step SMS Body *
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Available dynamic placeholders:{" "}
                      <span className="font-mono font-semibold text-primary">
                        {`{clientName}`}
                      </span>
                      ,{" "}
                      <span className="font-mono font-semibold text-primary">
                        {`{projectName}`}
                      </span>
                      ,{" "}
                      <span className="font-mono font-semibold text-primary">
                        {`{agentPhone}`}
                      </span>
                      ,{" "}
                      <span className="font-mono font-semibold text-primary">
                        {`{unitNumber}`}
                      </span>
                    </p>
                    <textarea
                      required
                      rows={3}
                      value={addStepForm.body}
                      onChange={(e) =>
                        setAddStepForm({
                          ...addStepForm,
                          body: e.target.value,
                        })
                      }
                      placeholder="e.g. Selam {clientName}! Thank you for inquiring about {projectName}..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddStepModal(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="font-bold text-xs px-5 shadow-xs"
                    >
                      Add Step to Sequence
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Enroll Lead Modal */}
          {showEnrollModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Enroll Buyer into Drip Sequence
                  </h3>
                  <button
                    onClick={() => setShowEnrollModal(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleEnrollLead} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Contact from CRM Database
                    </label>
                    <select
                      value={enrollForm.selectedContactId}
                      onChange={(e) =>
                        handleEnrollContactSelect(e.target.value)
                      }
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                    >
                      <option value="">Manual Entry…</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone || "No Phone"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Buyer Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={enrollForm.name}
                      onChange={(e) =>
                        setEnrollForm({ ...enrollForm, name: e.target.value })
                      }
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="0911223344"
                      value={enrollForm.phone}
                      onChange={(e) =>
                        setEnrollForm({ ...enrollForm, phone: e.target.value })
                      }
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEnrollModal(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="font-bold text-xs px-5 shadow-xs"
                    >
                      Enroll Buyer Now
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Rule Modal */}
          {editingRuleKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Trigger Rule: {editingRuleKey}
                  </h3>
                  <button
                    onClick={() => setEditingRuleKey(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveRule} className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      Enable Automated Rule Trigger
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRuleEditForm({
                          ...ruleEditForm,
                          enabled: !ruleEditForm.enabled,
                        })
                      }
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        ruleEditForm.enabled ? "bg-success" : "bg-slate-300",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          ruleEditForm.enabled
                            ? "translate-x-4"
                            : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dispatch Timing Offset
                    </label>
                    <input
                      type="text"
                      value={ruleEditForm.timing}
                      onChange={(e) =>
                        setRuleEditForm({
                          ...ruleEditForm,
                          timing: e.target.value,
                        })
                      }
                      className="w-full h-9.5 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Template Body (with placeholders)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[
                          "{firstName}",
                          "{unitNumber}",
                          "{projectName}",
                          "{date}",
                          "{amount}",
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              insertVariableTag(tag, (val) =>
                                setRuleEditForm((prev) => ({
                                  ...prev,
                                  template:
                                    typeof val === "function"
                                      ? val(prev.template)
                                      : val,
                                })),
                              )
                            }
                            className="text-[10px] text-info hover:underline font-mono"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      value={ruleEditForm.template}
                      onChange={(e) =>
                        setRuleEditForm({
                          ...ruleEditForm,
                          template: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-primary font-mono leading-relaxed"
                      required
                    />
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
                      className="h-9 px-5 font-bold text-xs"
                    >
                      Save Rule Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
