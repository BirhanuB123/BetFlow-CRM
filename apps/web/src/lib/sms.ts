export type SmsStatus = "DELIVERED" | "QUEUED" | "FAILED" | "SENDING";

export type SmsLog = {
  id: string;
  recipientName: string;
  recipientPhone: string;
  body: string;
  triggerType: "SITE_VISIT_REMINDER" | "HOLD_EXPIRY_ALERT" | "PAYMENT_DUE_ALERT" | "DRIP_CAMPAIGN" | "MANUAL_BROADCAST";
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
  targetSegment: "COLD_LEADS" | "WARM_LEADS" | "SITE_VISITORS" | "RESERVATION_CLIENTS";
  status: "ACTIVE" | "PAUSED";
  enrolledCount: number;
  completedCount: number;
  steps: DripStep[];
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
export function calculateSmsSegments(text: string): { charCount: number; segmentCount: number } {
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
  variables: Record<string, string | number | undefined>
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
