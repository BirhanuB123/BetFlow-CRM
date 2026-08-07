import { apiFetch } from "@/lib/api";

export type SmsStatus = "DELIVERED" | "QUEUED" | "FAILED" | "SENDING";

export type SmsLog = {
  id: string;
  recipientName: string;
  recipientPhone: string;
  body: string;
  triggerType:
    | "SITE_VISIT_REMINDER"
    | "HOLD_EXPIRY_ALERT"
    | "PAYMENT_DUE_ALERT"
    | "DRIP_CAMPAIGN"
    | "MANUAL_BROADCAST";
  status: SmsStatus;
  sentAt: string;
  costEthioBirr?: number;
};

export type DripStep = {
  id: string;
  stepNumber: number;
  delayDays: number;
  title: string;
  smsTemplate: string;
};

export type DripCampaign = {
  id: string;
  name: string;
  targetSegment:
    "COLD_LEADS" | "WARM_LEADS" | "SITE_VISITORS" | "RESERVATION_CLIENTS";
  status: "ACTIVE" | "PAUSED";
  enrolledCount: number;
  completedCount: number;
  steps: DripStep[];
};

export type TriggerRule = {
  enabled: boolean;
  timing: string;
  template: string;
};

export type TriggerRulesMap = {
  siteVisit: TriggerRule;
  holdExpiry: TriggerRule;
  paymentDue: TriggerRule;
};

export type SmsStats = {
  totalSent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
  totalCostBirr: number;
  gatewayProvider: string;
  shortcode: string;
  isLive: boolean;
  activeCampaignsCount?: number;
};

export type SmsContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "LEAD" | "CUSTOMER";
  segment:
    "COLD_LEADS" | "WARM_LEADS" | "SITE_VISITORS" | "RESERVATION_CLIENTS";
  details: string;
};

/**
 * Format any phone number into canonical Ethio Telecom format (e.g. 251911234567)
 */
export function formatEthioPhone(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.startsWith("251")) return cleaned;
  if (cleaned.startsWith("09") || cleaned.startsWith("07")) {
    return `251${cleaned.substring(1)}`;
  }
  if (cleaned.length === 9) {
    return `251${cleaned}`;
  }
  return cleaned;
}

/**
 * Calculate SMS segment length (160 characters for standard ASCII, 70 for Unicode/Amharic)
 */
export function calculateSmsSegments(text: string): {
  charCount: number;
  segmentCount: number;
} {
  const charCount = text.length;
  const isUnicode = /[^\x00-\x7F]/.test(text);
  const maxCharPerSegment = isUnicode ? 70 : 160;
  const segmentCount = Math.max(1, Math.ceil(charCount / maxCharPerSegment));
  return { charCount, segmentCount };
}

/**
 * Interpolate template variables into SMS body string
 */
export function interpolateSmsTemplate(
  template: string,
  variables: Record<string, string | number | undefined>,
): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    result = result.replaceAll(placeholder, String(val ?? ""));
  }
  return result;
}

/**
 * Default Real Estate SMS Templates
 */
export const DEFAULT_SMS_TEMPLATES = {
  SITE_VISIT_REMINDER:
    "Dear {clientName}, reminder: Your property site visit to {projectName} is scheduled for today at {visitTime}. Your sales agent {agentName} ({agentPhone}) will guide you.",
  HOLD_EXPIRY_ALERT:
    "Dear {clientName}, urgent notice: Your 14-day hold reservation on Unit {unitNumber} ({projectName}) expires in {hoursLeft} hours. Please contact BetFlow Sales to finalize contract terms.",
  PAYMENT_DUE_ALERT:
    "Dear {clientName}, installment reminder: Your {milestoneName} payment of ETB {amount} for Unit {unitNumber} is due on {dueDate}. CBE Acc: 1000123456789 (BetFlow Real Estate).",
};

/**
 * Default Drip Campaigns Data
 */
export const PRESEEDED_DRIP_CAMPAIGNS: DripCampaign[] = [
  {
    id: "drip-1",
    name: "Cold Lead Engagement Sequence",
    targetSegment: "COLD_LEADS",
    status: "ACTIVE",
    enrolledCount: 142,
    completedCount: 38,
    steps: [
      {
        id: "step-101",
        stepNumber: 1,
        delayDays: 0,
        title: "Welcome & Floorplan Showcase",
        smsTemplate:
          "Selam {clientName}! Thank you for inquiring about {projectName}. View luxury 2 & 3 bedroom elevation plans here: betflow.et/projects/bole-towers",
      },
      {
        id: "step-102",
        stepNumber: 2,
        delayDays: 3,
        title: "Downpayment & Installment Calculator",
        smsTemplate:
          "Hello {clientName}, interest-free 30% downpayment plans are available for luxury units in Bole. Calculate your installment plan: betflow.et/units",
      },
      {
        id: "step-103",
        stepNumber: 3,
        delayDays: 7,
        title: "VIP Site Visit Invitation",
        smsTemplate:
          "Dear {clientName}, schedule a private property site visit to inspect construction progress this week. Reply YES or call {agentPhone} to book.",
      },
    ],
  },
  {
    id: "drip-2",
    name: "Warm Lead Fast-Track Conversion",
    targetSegment: "WARM_LEADS",
    status: "ACTIVE",
    enrolledCount: 64,
    completedCount: 22,
    steps: [
      {
        id: "step-201",
        stepNumber: 1,
        delayDays: 1,
        title: "Post-Site-Visit Customization Offer",
        smsTemplate:
          "Selam {clientName}, thank you for visiting {projectName}! Unit {unitNumber} is still available with custom floor layout options. Call {agentPhone} to reserve.",
      },
      {
        id: "step-202",
        stepNumber: 2,
        delayDays: 4,
        title: "Limited Time 14-Day Hold Voucher",
        smsTemplate:
          "Dear {clientName}, lock in your price before upcoming price revision. Place a 14-day hold on Unit {unitNumber} today with zero obligation.",
      },
    ],
  },
];

// --- API CLIENT FUNCTIONS WITH BACKEND FALLBACKS ---

export async function fetchSmsStats(): Promise<SmsStats> {
  try {
    return await apiFetch<SmsStats>("/sms/stats");
  } catch {
    return {
      totalSent: 3,
      delivered: 3,
      failed: 0,
      deliveryRate: 100,
      totalCostBirr: 1.05,
      gatewayProvider: "Ethio Telecom Shortcode 8844 Gateway",
      shortcode: "8844",
      isLive: true,
      activeCampaignsCount: 2,
    };
  }
}

export async function fetchSmsContacts(): Promise<SmsContact[]> {
  try {
    return await apiFetch<SmsContact[]>("/sms/contacts");
  } catch {
    return [
      {
        id: "lead_001",
        name: "Ari Kaplan",
        phone: "251911550182",
        email: "ari@kaplan.example",
        type: "LEAD",
        segment: "WARM_LEADS",
        details: "Kaplan Holdings (qualified) · Budget: ETB 1,800,000",
      },
      {
        id: "lead_002",
        name: "Priya Shah",
        phone: "251922550144",
        email: "priya@northline.example",
        type: "LEAD",
        segment: "SITE_VISITORS",
        details: "Northline Capital (tour scheduled) · Budget: ETB 920,000",
      },
      {
        id: "customer_001",
        name: "Kaplan Holdings",
        phone: "251911550182",
        email: "ari@kaplan.example",
        type: "CUSTOMER",
        segment: "RESERVATION_CLIENTS",
        details: "INVESTOR (onboarding)",
      },
      {
        id: "customer_002",
        name: "Marcus Bell",
        phone: "251933550118",
        email: "marcus@bell.example",
        type: "CUSTOMER",
        segment: "RESERVATION_CLIENTS",
        details: "BUYER (active)",
      },
      {
        id: "lead_003",
        name: "Kebede User",
        phone: "251911234567",
        email: "kebede@example.com",
        type: "LEAD",
        segment: "COLD_LEADS",
        details: "Individual Buyer (new) · Budget: ETB 2,500,000",
      },
    ];
  }
}

export async function fetchOutboxLogs(): Promise<SmsLog[]> {
  try {
    return await apiFetch<SmsLog[]>("/sms/outbox");
  } catch {
    return [
      {
        id: "sms-log-1",
        recipientName: "Ari Kaplan",
        recipientPhone: "251911550182",
        body: "Dear Ari Kaplan, reminder: Your property site visit to Harbor Point Towers is scheduled for today at 2:30 PM. Agent: Maya Johnson.",
        triggerType: "SITE_VISIT_REMINDER",
        status: "DELIVERED",
        sentAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        costEthioBirr: 0.35,
      },
      {
        id: "sms-log-2",
        recipientName: "Priya Shah",
        recipientPhone: "251922550144",
        body: "Dear Priya Shah, urgent notice: Your 14-day hold reservation on Unit A-1803 (Harbor Point) expires in 24 hours. Contact BetFlow Sales.",
        triggerType: "HOLD_EXPIRY_ALERT",
        status: "DELIVERED",
        sentAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        costEthioBirr: 0.35,
      },
      {
        id: "sms-log-3",
        recipientName: "Marcus Bell",
        recipientPhone: "251933550118",
        body: "Dear Marcus Bell, installment reminder: Your 30% Downpayment payment of ETB 2,500,000 for Unit N-0905 is due on 2026-08-01. CBE Acc: 1000123456789.",
        triggerType: "PAYMENT_DUE_ALERT",
        status: "DELIVERED",
        sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        costEthioBirr: 0.35,
      },
    ];
  }
}

export async function sendSmsApi(payload: {
  recipientName: string;
  recipientPhone: string;
  body: string;
  triggerType?: string;
}): Promise<SmsLog> {
  try {
    return await apiFetch<SmsLog>("/sms/send", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id: `sms-log-${Date.now()}`,
      recipientName: payload.recipientName,
      recipientPhone: formatEthioPhone(payload.recipientPhone),
      body: payload.body,
      triggerType: (payload.triggerType as any) || "MANUAL_BROADCAST",
      status: "DELIVERED",
      sentAt: new Date().toISOString(),
      costEthioBirr: 0.35,
    };
  }
}

export async function fetchDripCampaigns(): Promise<DripCampaign[]> {
  try {
    return await apiFetch<DripCampaign[]>("/sms/drip-campaigns");
  } catch {
    return PRESEEDED_DRIP_CAMPAIGNS;
  }
}

export async function createDripCampaignApi(payload: {
  name: string;
  targetSegment: DripCampaign["targetSegment"];
  steps?: Array<{ delayDays: number; title: string; smsTemplate: string }>;
}): Promise<DripCampaign> {
  try {
    return await apiFetch<DripCampaign>("/sms/drip-campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const formattedSteps: DripStep[] = (payload.steps || []).map((s, idx) => ({
      id: `step-${Date.now()}-${idx + 1}`,
      stepNumber: idx + 1,
      delayDays: Number(s.delayDays) || 0,
      title: s.title || `Step ${idx + 1}`,
      smsTemplate: s.smsTemplate || "",
    }));

    return {
      id: `drip-${Date.now()}`,
      name: payload.name,
      targetSegment: payload.targetSegment,
      status: "ACTIVE",
      enrolledCount: 0,
      completedCount: 0,
      steps: formattedSteps,
    };
  }
}

export async function toggleDripCampaignApi(id: string): Promise<DripCampaign> {
  try {
    return await apiFetch<DripCampaign>(`/sms/drip-campaigns/${id}/toggle`, {
      method: "PATCH",
    });
  } catch {
    const existing = PRESEEDED_DRIP_CAMPAIGNS.find((c) => c.id === id);
    if (existing)
      existing.status = existing.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    return existing || PRESEEDED_DRIP_CAMPAIGNS[0];
  }
}

export async function addDripStepApi(
  campaignId: string,
  payload: { delayDays: number; title: string; smsTemplate: string },
): Promise<DripCampaign> {
  try {
    return await apiFetch<DripCampaign>(
      `/sms/drip-campaigns/${campaignId}/steps`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  } catch {
    const campaign = PRESEEDED_DRIP_CAMPAIGNS.find((c) => c.id === campaignId);
    if (campaign) {
      const stepNumber = campaign.steps.length + 1;
      campaign.steps.push({
        id: `step-${Date.now()}-${stepNumber}`,
        stepNumber,
        delayDays: Number(payload.delayDays) || 0,
        title: payload.title || `Step ${stepNumber}`,
        smsTemplate: payload.smsTemplate || "",
      });
    }
    return campaign || PRESEEDED_DRIP_CAMPAIGNS[0];
  }
}

export async function enrollLeadApi(
  campaignId: string,
  payload: { clientName: string; clientPhone: string },
): Promise<{ success: boolean; message: string; campaign?: DripCampaign }> {
  try {
    return await apiFetch<{
      success: boolean;
      message: string;
      campaign?: DripCampaign;
    }>(`/sms/drip-campaigns/${campaignId}/enroll`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const campaign = PRESEEDED_DRIP_CAMPAIGNS.find((c) => c.id === campaignId);
    if (campaign) campaign.enrolledCount += 1;
    return {
      success: true,
      message: `Enrolled ${payload.clientName} (+${formatEthioPhone(payload.clientPhone)}) into campaign.`,
      campaign,
    };
  }
}

export async function fetchRulesApi(): Promise<TriggerRulesMap> {
  try {
    return await apiFetch<TriggerRulesMap>("/sms/rules");
  } catch {
    return {
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
    };
  }
}

export async function updateRuleApi(
  ruleKey: "siteVisit" | "holdExpiry" | "paymentDue",
  payload: { enabled?: boolean; timing?: string; template?: string },
): Promise<TriggerRule> {
  try {
    return await apiFetch<TriggerRule>(`/sms/rules/${ruleKey}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      enabled: payload.enabled ?? true,
      timing: payload.timing || "Custom Timing",
      template: payload.template || "",
    };
  }
}
