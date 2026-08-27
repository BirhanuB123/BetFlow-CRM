import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PrismaService } from '../database/prisma.service';
import { InMemoryService } from '../database/in-memory.service';
import { interpolateTemplate } from './sms-template.util';

export class SmsSendDto {
  @IsString()
  @IsNotEmpty({ message: 'Recipient phone is required' })
  recipientPhone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Recipient name is required' })
  recipientName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Message body is required' })
  body!: string;

  @IsString()
  @IsOptional()
  triggerType?:
    | 'SITE_VISIT_REMINDER'
    | 'HOLD_EXPIRY_ALERT'
    | 'PAYMENT_DUE_ALERT'
    | 'DRIP_CAMPAIGN'
    | 'MANUAL_BROADCAST';

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

export class CreateDripStepDto {
  @IsNumber()
  @IsNotEmpty()
  delayDays!: number;

  @IsString()
  @IsNotEmpty({ message: 'Step title is required' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'SMS template is required' })
  smsTemplate!: string;
}

export class CreateDripCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'Campaign name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Target segment is required' })
  targetSegment!:
    'COLD_LEADS' | 'WARM_LEADS' | 'SITE_VISITORS' | 'RESERVATION_CLIENTS';

  @IsOptional()
  steps?: CreateDripStepDto[];
}

export class EnrollLeadDto {
  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Client name is required' })
  clientName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Client phone is required' })
  clientPhone!: string;
}

export class UpdateRuleDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  timing?: string;

  @IsString()
  @IsOptional()
  template?: string;
}

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
    'COLD_LEADS' | 'WARM_LEADS' | 'SITE_VISITORS' | 'RESERVATION_CLIENTS';
  status: 'ACTIVE' | 'PAUSED';
  enrolledCount: number;
  completedCount: number;
  steps: DripStep[];
};

export type SmsTemplateCategory =
  | 'paymentMilestone'
  | 'paymentReceipt'
  | 'siteVisitConfirm'
  | 'siteVisitFollowup'
  | 'constructionUpdate';

export type LocalizedTemplate = {
  category: SmsTemplateCategory;
  title: string;
  en: string;
  am: string;
  variables: string[];
};

export const LOCALIZED_TEMPLATES: Record<
  SmsTemplateCategory,
  LocalizedTemplate
> = {
  paymentMilestone: {
    category: 'paymentMilestone',
    title: 'Payment Milestone Due Date',
    en: 'Dear {clientName}, payment reminder: Your milestone "{milestoneName}" of ETB {amount} for Unit {unitNumber} ({projectName}) is due on {dueDate}. CBE Acc: 1000123456789 (BetFlow Real Estate).',
    am: 'ውድ {clientName}፣ የክፍያ ማሳሰቢያ፡ ለቤት ቁጥር {unitNumber} ({projectName}) የደረጃ "{milestoneName}" ክፍያ ETB {amount} በ{dueDate} መክፈል እንዳለብዎት እናሳስባለን። CBE: 1000123456789።',
    variables: [
      'clientName',
      'milestoneName',
      'amount',
      'unitNumber',
      'projectName',
      'dueDate',
    ],
  },
  paymentReceipt: {
    category: 'paymentReceipt',
    title: 'Payment Receipt Confirmation',
    en: 'Dear {clientName}, payment received! ETB {amount} received on {paymentDate} for Unit {unitNumber}. Receipt #{receiptNumber}. Remaining balance: ETB {remainingBalance}.',
    am: 'ውድ {clientName}፣ የክፍያ ደረሰኝ፡ ለቤት ቁጥር {unitNumber} ETB {amount} በ{paymentDate} ገቢ ሆኗል። የደረሰኝ ቁጥር #{receiptNumber}። ቀሪ ክፍያ፡ ETB {remainingBalance}።',
    variables: [
      'clientName',
      'amount',
      'paymentDate',
      'unitNumber',
      'receiptNumber',
      'remainingBalance',
    ],
  },
  siteVisitConfirm: {
    category: 'siteVisitConfirm',
    title: 'Site Visit Confirmation',
    en: 'Dear {clientName}, site visit confirmed! Your tour of {projectName} is scheduled for {visitDate} at {visitTime}. Your sales agent is {agentName} ({agentPhone}).',
    am: 'ውድ {clientName}፣ የሳይት ጉብኝት ተረጋግጧል! የ{projectName} ፕሮጀክት ጉብኝት በ{visitDate} በ{visitTime} ተይዟል። መሪ አሸኛችሁ፡ {agentName} ({agentPhone})።',
    variables: [
      'clientName',
      'projectName',
      'visitDate',
      'visitTime',
      'agentName',
      'agentPhone',
    ],
  },
  siteVisitFollowup: {
    category: 'siteVisitFollowup',
    title: 'Post-Site-Visit Follow-Up',
    en: 'Selam {clientName}! Thank you for visiting {projectName} today. Unit {unitNumber} is available with custom finishing options. Contact {agentName} ({agentPhone}) to reserve.',
    am: 'ሰላም {clientName}! ዛሬ {projectName} ስላስጎበኘንዎ እናመሰግናለን። ለቤት ቁጥር {unitNumber} ምርጫዎን ለማረጋገጥ ለ{agentName} ({agentPhone}) ይደውሉ።',
    variables: [
      'clientName',
      'projectName',
      'unitNumber',
      'agentName',
      'agentPhone',
    ],
  },
  constructionUpdate: {
    category: 'constructionUpdate',
    title: 'Construction Milestone Progress Update',
    en: 'BetFlow Construction Update: {projectName} has reached milestone "{stageName}"! Work is progressing as scheduled. Track live progress at betflow.et/portal.',
    am: 'ቤተፍሎው የግንባታ ዜና፡ የ{projectName} ፕሮጀክት ግንባታ ደረጃ "{stageName}" ደርሷል! ኮንስትራክሽን ሂደቱን በbetflow.et/portal ላይ ይከታተሉ።',
    variables: ['projectName', 'stageName'],
  },
};

export type SmsContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'LEAD' | 'CUSTOMER';
  segment:
    'COLD_LEADS' | 'WARM_LEADS' | 'SITE_VISITORS' | 'RESERVATION_CLIENTS';
  details: string;
};

@Injectable()
export class EthioTelecomSmsService {
  private readonly logger = new Logger(EthioTelecomSmsService.name);



  // In-memory Automated Trigger Rules
  private rules = {
    siteVisit: {
      enabled: true,
      timing: '2 Hours Prior',
      template:
        'Dear {clientName}, reminder: Your property site visit to {projectName} is scheduled for today at {visitTime}. Your sales agent {agentName} ({agentPhone}) will guide you.',
    },
    holdExpiry: {
      enabled: true,
      timing: '48h & 24h Prior',
      template:
        'Dear {clientName}, urgent notice: Your 14-day hold reservation on Unit {unitNumber} ({projectName}) expires in {hoursLeft} hours. Please contact BetFlow Sales to finalize contract terms.',
    },
    paymentDue: {
      enabled: true,
      timing: '3 Days Prior',
      template:
        'Dear {clientName}, installment reminder: Your {milestoneName} payment of ETB {amount} for Unit {unitNumber} is due on {dueDate}. CBE Acc: 1000123456789 (BetFlow Real Estate).',
    },
  };

  // In-memory Drip Campaigns Store
  private dripCampaigns: DripCampaign[] = [
    {
      id: 'drip-1',
      name: 'Cold Lead Engagement Sequence',
      targetSegment: 'COLD_LEADS',
      status: 'ACTIVE',
      enrolledCount: 142,
      completedCount: 38,
      steps: [
        {
          id: 'step-101',
          stepNumber: 1,
          delayDays: 0,
          title: 'Welcome & Floorplan Showcase',
          smsTemplate:
            'Selam {clientName}! Thank you for inquiring about {projectName}. View luxury 2 & 3 bedroom elevation plans here: betflow.et/projects/bole-towers',
        },
        {
          id: 'step-102',
          stepNumber: 2,
          delayDays: 3,
          title: 'Downpayment & Installment Calculator',
          smsTemplate:
            'Hello {clientName}, interest-free 30% downpayment plans are available for luxury units in Bole. Calculate your installment plan: betflow.et/units',
        },
        {
          id: 'step-103',
          stepNumber: 3,
          delayDays: 7,
          title: 'VIP Site Visit Invitation',
          smsTemplate:
            'Dear {clientName}, schedule a private property site visit to inspect construction progress this week. Reply YES or call {agentPhone} to book.',
        },
      ],
    },
    {
      id: 'drip-2',
      name: 'Warm Lead Fast-Track Conversion',
      targetSegment: 'WARM_LEADS',
      status: 'ACTIVE',
      enrolledCount: 64,
      completedCount: 22,
      steps: [
        {
          id: 'step-201',
          stepNumber: 1,
          delayDays: 1,
          title: 'Post-Site-Visit Customization Offer',
          smsTemplate:
            'Selam {clientName}, thank you for visiting {projectName}! Unit {unitNumber} is still available with custom floor layout options. Call {agentPhone} to reserve.',
        },
        {
          id: 'step-202',
          stepNumber: 2,
          delayDays: 4,
          title: 'Limited Time 14-Day Hold Voucher',
          smsTemplate:
            'Dear {clientName}, lock in your price before upcoming price revision. Place a 14-day hold on Unit {unitNumber} today with zero obligation.',
        },
      ],
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly inMemory: InMemoryService,
  ) {}

  /**
   * Format any phone number into canonical Ethio Telecom format (e.g. 251911234567)
   */
  formatEthioPhone(raw: string): string {
    if (!raw) return '';
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) return '';
    if (cleaned.startsWith('251')) return cleaned;
    if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
      return `251${cleaned.substring(1)}`;
    }
    if (cleaned.length === 9) {
      return `251${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Get real CRM system database contacts (Leads + Customers) from Prisma
   */
  async getSmsContacts(): Promise<SmsContact[]> {
    const leads = await this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const customers = await this.prisma.customer.findMany({
      include: {
        account: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const leadContacts: SmsContact[] = leads.map((l) => {
      let segment: SmsContact['segment'] = 'COLD_LEADS';
      const statusLower = (l.status || '').toLowerCase();
      if (statusLower.includes('tour') || statusLower.includes('visit')) {
        segment = 'SITE_VISITORS';
      } else if (
        statusLower.includes('proposal') ||
        statusLower.includes('qualified') ||
        statusLower.includes('warm')
      ) {
        segment = 'WARM_LEADS';
      }

      const fullName =
        [l.firstName, l.lastName].filter(Boolean).join(' ') || 'Unnamed Lead';

      return {
        id: l.id,
        name: fullName,
        phone: this.formatEthioPhone(l.phone || ''),
        email: l.email || '',
        type: 'LEAD',
        segment,
        details: `${l.company || 'Individual'} (${(l.status || 'NEW').replace('_', ' ')})`,
      };
    });

    const customerContacts: SmsContact[] = customers.map((c) => {
      const fullName =
        [c.firstName, c.lastName].filter(Boolean).join(' ') ||
        'Unnamed Customer';

      return {
        id: c.id,
        name: fullName,
        phone: this.formatEthioPhone(c.phone || ''),
        email: c.email || '',
        type: 'CUSTOMER',
        segment: 'RESERVATION_CLIENTS',
        details: `${c.account?.name || 'Individual Customer'} (ACTIVE)`,
      };
    });

    return [...leadContacts, ...customerContacts];
  }

  /**
   * Get localized (Amharic & English) drip and transactional templates
   */
  getTemplates() {
    return Object.values(LOCALIZED_TEMPLATES);
  }

  /**
   * Broadcast Construction Progress Update to all buyers of a project in Amharic or English
   */
  async broadcastConstructionProgress(
    projectId: string,
    stageName: string,
    lang: 'en' | 'am' = 'am',
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    const projectName = project?.name || 'BetFlow Real Estate';

    const activeContracts = await this.prisma.contract.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXECUTED', 'SIGNED'] },
        unit: { floor: { building: { projectId } } },
      },
      include: {
        customer: true,
      },
    });

    const recipientsMap = new Map<string, { name: string; phone: string }>();

    for (const contract of activeContracts) {
      const cust = (contract as any).customer;
      if (cust && cust.phone) {
        recipientsMap.set(cust.id, {
          name: `${cust.firstName} ${cust.lastName}`,
          phone: cust.phone,
        });
      }
    }

    const templateObj = LOCALIZED_TEMPLATES.constructionUpdate;
    const rawTemplate = lang === 'am' ? templateObj.am : templateObj.en;

    const dispatchedLogs = [];

    for (const recipient of Array.from(recipientsMap.values())) {
      const { body } = interpolateTemplate(rawTemplate, {
        projectName,
        stageName: stageName.replace(/_/g, ' '),
      });

      const log = await this.sendSms({
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        body,
        triggerType: 'MANUAL_BROADCAST',
      });

      dispatchedLogs.push(log);
    }

    return {
      projectId,
      projectName,
      stageName,
      language: lang,
      recipientsCount: recipientsMap.size,
      dispatchedLogs,
    };
  }

  /**
   * Calculate Amharic Unicode vs GSM-7 Character Count & Multi-Part Segments
   */
  getSmsMetadata(body: string) {
    const isUnicode = /[\u1200-\u137F]/.test(body);
    const charCount = body ? body.length : 0;
    let segmentCount = 1;

    if (isUnicode) {
      segmentCount = charCount <= 70 ? 1 : Math.ceil(charCount / 67);
    } else {
      segmentCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
    }

    return {
      charCount,
      isUnicode,
      encoding: isUnicode ? 'UTF-8 (Amharic/Unicode)' : 'GSM-7 (English)',
      segmentCount,
    };
  }

  /**
   * Retry wrapper with exponential backoff for transient gateway failures
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 2,
    baseDelayMs = 300,
  ): Promise<Response> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.ok || attempt === maxRetries) {
          return response;
        }
        if (response.status >= 500) {
          this.logger.warn(
            `Gateway HTTP ${response.status} on attempt ${attempt}/${maxRetries}. Retrying...`,
          );
        } else {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `Gateway network fetch attempt ${attempt}/${maxRetries} failed: ${err?.message || err}`,
        );
      }
      await new Promise((res) =>
        setTimeout(res, baseDelayMs * Math.pow(2, attempt - 1)),
      );
    }
    throw lastError || new Error('Gateway request failed after retries');
  }

  /**
   * Send an SMS alert via AfroMessage or Ethio Telecom API Gateway with Dual-Gateway Failover
   */
  async sendSms(dto: SmsSendDto, actorUserId?: string) {
    const formattedPhone = this.formatEthioPhone(dto.recipientPhone);
    const triggerType = dto.triggerType || 'MANUAL_BROADCAST';
    const metadata = this.getSmsMetadata(dto.body);

    this.logger.log(
      `[SMS Gateway Dispatch] Sending to ${formattedPhone} (${dto.recipientName}) [${metadata.encoding}, ${metadata.segmentCount} segment(s)]: "${dto.body.substring(0, 40)}..."`,
    );

    let status: 'DELIVERED' | 'QUEUED' | 'FAILED' = 'FAILED';
    let gatewayUsed = 'Sandbox Mode (Dev)';
    let attemptsCount = 0;

    // Helper: AfroMessage Gateway
    const tryAfroMessage = async (): Promise<boolean> => {
      if (!process.env.AFROMESSAGE_API_KEY) return false;
      const apiKey = process.env.AFROMESSAGE_API_KEY.trim();
      const senderName = process.env.AFROMESSAGE_SENDER_ID?.trim() || '';
      const identifier = process.env.AFROMESSAGE_IDENTIFIER?.trim() || '';
      const baseUrl =
        process.env.API_BASE_URL ||
        process.env.APP_BASE_URL ||
        '';

      this.logger.log(
        `[Gateway Dispatch] Primary attempt via AfroMessage to +${formattedPhone}...`,
      );
      attemptsCount++;

      const params = new URLSearchParams();
      params.set('to', formattedPhone);
      params.set('message', dto.body);
      if (senderName) {
        params.set('sender', senderName);
      }
      if (identifier) {
        params.set('from', identifier);
      }
      if (baseUrl && baseUrl.startsWith('https://')) {
        params.set('callback', `${baseUrl}/sms/afromessage/callback`);
      }

      const primaryUrl = `https://api.afromessage.com/api/send?${params.toString()}`;

      try {
        let response = await this.fetchWithRetry(primaryUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        });

        let data = (await response.json().catch(() => null)) as any;

        // If primary attempt failed, retry with direct sender parameter
        if (
          !response.ok ||
          (data?.acknowledge !== 'success' &&
            data?.response?.code !== 200 &&
            data?.status !== 'success' &&
            !data?.response?.message_id)
        ) {
          this.logger.warn(
            `[AfroMessage Primary Request] HTTP ${response.status}: ${JSON.stringify(data)}. Retrying with direct sender parameter...`,
          );

          const fallbackParams = new URLSearchParams({
            to: formattedPhone,
            message: dto.body,
          });
          if (senderName) fallbackParams.set('sender', senderName);

          const cleanUrl = `https://api.afromessage.com/api/send?${fallbackParams.toString()}`;

          response = await this.fetchWithRetry(cleanUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: 'application/json',
            },
          });
          data = (await response.json().catch(() => null)) as any;
        }

        if (
          response.ok &&
          (data?.acknowledge === 'success' ||
            data?.response?.code === 200 ||
            data?.status === 'success' ||
            data?.success === true ||
            data?.response?.message_id ||
            data?.response?.status === 'sent' ||
            data?.response?.status === 'Send is in progress...')
        ) {
          this.logger.log(
            `[AfroMessage SMS Success] Delivered to +${formattedPhone} (Message ID: ${data?.response?.message_id || 'N/A'})`,
          );
          gatewayUsed = 'AfroMessage Live Gateway';
          return true;
        }

        this.logger.warn(
          `[AfroMessage SMS Final Status] HTTP ${response.status}: ${JSON.stringify(data)}`,
        );
      } catch (err: any) {
        this.logger.error(
          `AfroMessage API connection error: ${err?.message || err}`,
        );
      }
      return false;
    };

    // Helper: Ethio Telecom Direct Gateway
    const tryEthioTelecom = async (): Promise<boolean> => {
      if (!process.env.ETHIO_SMS_API_URL) return false;
      this.logger.log(
        `[Gateway Dispatch] Attempt via Ethio Telecom Shortcode to +${formattedPhone}...`,
      );
      attemptsCount++;

      try {
        const response = await this.fetchWithRetry(
          process.env.ETHIO_SMS_API_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.ETHIO_SMS_TOKEN || ''}`,
            },
            body: JSON.stringify({
              shortcode: process.env.ETHIO_SMS_SHORTCODE || '8844',
              to: formattedPhone,
              message: dto.body,
            }),
          },
        );

        if (response.ok) {
          this.logger.log(
            `[Ethio Telecom SMS Success] Delivered to +${formattedPhone}`,
          );
          gatewayUsed = 'Ethio Telecom Direct Shortcode (8844)';
          return true;
        }
        this.logger.warn(`Ethio Telecom HTTP Error: ${response.statusText}`);
      } catch (err: any) {
        this.logger.error(
          `Ethio Telecom API connection error: ${err?.message || err}`,
        );
      }
      return false;
    };

    // Dual-Gateway Failover Engine Pipeline
    let success = false;

    if (process.env.AFROMESSAGE_API_KEY) {
      success = await tryAfroMessage();
      if (!success && process.env.ETHIO_SMS_API_URL) {
        this.logger.warn(
          `[Dual-Gateway Failover] AfroMessage failed. Automatically failing over to Ethio Telecom...`,
        );
        success = await tryEthioTelecom();
      }
    } else if (process.env.ETHIO_SMS_API_URL) {
      success = await tryEthioTelecom();
      if (!success && process.env.AFROMESSAGE_API_KEY) {
        this.logger.warn(
          `[Dual-Gateway Failover] Ethio Telecom failed. Automatically failing over to AfroMessage...`,
        );
        success = await tryAfroMessage();
      }
    }

    if (success) {
      status = 'DELIVERED';
    } else if (
      !process.env.AFROMESSAGE_API_KEY &&
      !process.env.ETHIO_SMS_API_URL
    ) {
      status = 'DELIVERED';
      gatewayUsed = 'Ethio Telecom Gateway Sandbox';
      attemptsCount = 1;
    } else {
      status = 'FAILED';
    }

    const createdLog = await this.prisma.smsOutbox.create({
      data: {
        recipientName: dto.recipientName,
        phone: formattedPhone,
        body: dto.body,
        channel: 'SMS',
        triggerType,
        status,
        costEthioBirr: 0.35 * metadata.segmentCount,
        gatewayUsed,
        attemptsCount,
        encoding: metadata.encoding,
        segmentCount: metadata.segmentCount,
        sentAt: new Date(),
        deliveredAt: status === 'DELIVERED' ? new Date() : null,
      },
    });

    // Record activity in CRM system database audit log
    try {
      this.inMemory.recordActivity({
        actorUserId: actorUserId || 'user_001',
        action: `Dispatched SMS (${triggerType}) to ${dto.recipientName} (+${formattedPhone}) [${metadata.encoding}, ${gatewayUsed}]`,
        target: formattedPhone,
        type: 'call',
      });
    } catch {
      // Activity logging optional
    }

    return {
      id: createdLog.id,
      recipientName: createdLog.recipientName,
      recipientPhone: createdLog.phone,
      body: createdLog.body,
      triggerType: createdLog.triggerType as any,
      status: createdLog.status as any,
      sentAt: createdLog.sentAt.toISOString(),
      costEthioBirr: Number(createdLog.costEthioBirr || 0),
      gatewayUsed: createdLog.gatewayUsed || undefined,
      attemptsCount: createdLog.attemptsCount,
      encoding: createdLog.encoding || undefined,
      segmentCount: createdLog.segmentCount,
    };
  }

  /**
   * Handle AfroMessage delivery callback updates
   */
  async handleAfroMessageCallback(payload: {
    id?: string;
    message_id?: string;
    messageId?: string;
    to?: string;
    status?: string;
    reason?: string;
  }) {
    const messageId = payload.message_id || payload.messageId || payload.id;
    const rawStatus = String(payload.status || '').toUpperCase();
    const phone = payload.to ? this.formatEthioPhone(payload.to) : undefined;

    this.logger.log(
      `[AfroMessage Delivery Callback Received] ID: ${messageId || 'N/A'}, Status: ${rawStatus || 'UNKNOWN'}, Phone: ${phone || 'N/A'}`,
    );

    let status: 'DELIVERED' | 'QUEUED' | 'FAILED' = 'DELIVERED';
    if (
      rawStatus.includes('FAIL') ||
      rawStatus.includes('REJECT') ||
      rawStatus.includes('UNDELIV') ||
      rawStatus.includes('EXPIRE')
    ) {
      status = 'FAILED';
    } else if (
      rawStatus.includes('PENDING') ||
      rawStatus.includes('SENT') ||
      rawStatus.includes('QUEUE')
    ) {
      status = 'QUEUED';
    } else {
      status = 'DELIVERED';
    }

    let targetId = messageId;
    if (!targetId && phone) {
      const recent = await this.prisma.smsOutbox.findFirst({
        where: { phone },
        orderBy: { sentAt: 'desc' },
      });
      if (recent) targetId = recent.id;
    }

    if (targetId) {
      await this.prisma.smsOutbox.updateMany({
        where: { id: targetId },
        data: {
          status,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        },
      });
      this.logger.log(
        `Updated SMS log ${targetId} status to ${status} via AfroMessage delivery callback`,
      );
    }

    return {
      acknowledged: true,
      messageId: targetId,
      updatedStatus: status,
    };
  }

  /**
   * Get all SMS Outbox Logs
   */
  async getOutboxLogs() {
    const logs = await this.prisma.smsOutbox.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
    });

    return logs.map((l) => ({
      id: l.id,
      recipientName: l.recipientName,
      recipientPhone: l.phone,
      body: l.body,
      triggerType: l.triggerType as any,
      status: l.status as any,
      sentAt: l.sentAt.toISOString(),
      costEthioBirr: Number(l.costEthioBirr || 0),
      gatewayUsed: l.gatewayUsed || undefined,
      attemptsCount: l.attemptsCount,
      encoding: l.encoding || undefined,
      segmentCount: l.segmentCount,
    }));
  }

  /**
   * Fetch real remaining account balance from AfroMessage API
   */
  async getAfroMessageBalance(): Promise<{ balance: number | null; isReal: boolean }> {
    if (!process.env.AFROMESSAGE_API_KEY) {
      return { balance: null, isReal: false };
    }

    try {
      const apiKey = process.env.AFROMESSAGE_API_KEY.trim();
      const response = await fetch('https://api.afromessage.com/api/balance', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(`AfroMessage balance API query HTTP ${response.status}`);
        return { balance: null, isReal: false };
      }

      const data = (await response.json().catch(() => null)) as any;
      const balanceNum =
        typeof data?.balance === 'number'
          ? data.balance
          : typeof data?.response?.balance === 'number'
            ? data.response.balance
            : typeof data?.data?.balance === 'number'
              ? data.data.balance
              : null;

      if (balanceNum !== null) {
        return { balance: balanceNum, isReal: true };
      }
    } catch (err: any) {
      this.logger.error(`Error querying AfroMessage balance: ${err?.message || err}`);
    }

    return { balance: null, isReal: false };
  }

  /**
   * Get SMS Gateway Analytics & System Status
   */
  async getSmsStats() {
    const totalSent = await this.prisma.smsOutbox.count();
    const delivered = await this.prisma.smsOutbox.count({
      where: { status: 'DELIVERED' },
    });
    const failed = await this.prisma.smsOutbox.count({
      where: { status: 'FAILED' },
    });

    const aggregateCost = await this.prisma.smsOutbox.aggregate({
      _sum: { costEthioBirr: true, segmentCount: true },
    });

    const totalCostBirr = Number(aggregateCost._sum.costEthioBirr || 0);
    const totalSegments = Number(aggregateCost._sum.segmentCount || 0);

    const unicodeCount = await this.prisma.smsOutbox.count({
      where: { encoding: { contains: 'Amharic' } },
    });

    const lastLog = await this.prisma.smsOutbox.findFirst({
      orderBy: { sentAt: 'desc' },
      select: { gatewayUsed: true },
    });

    const balanceInfo = await this.getAfroMessageBalance();

    let gatewayProvider = 'Ethio Telecom Gateway Sandbox';
    if (lastLog?.gatewayUsed) {
      gatewayProvider = lastLog.gatewayUsed;
    } else if (process.env.AFROMESSAGE_API_KEY && process.env.ETHIO_SMS_API_URL) {
      gatewayProvider = 'Dual Gateway (AfroMessage + Ethio Telecom Direct)';
    } else if (process.env.AFROMESSAGE_API_KEY) {
      gatewayProvider = 'AfroMessage Live Gateway (Ethiopia)';
    } else if (process.env.ETHIO_SMS_API_URL) {
      gatewayProvider = 'Ethio Telecom Live Shortcode';
    }

    return {
      totalSent,
      delivered,
      failed,
      totalSegments,
      unicodeCount,
      deliveryRate:
        totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 100,
      totalCostBirr: Math.round(totalCostBirr * 100) / 100,
      accountBalanceBirr: balanceInfo.balance,
      gatewayProvider,
      shortcode: process.env.ETHIO_SMS_SHORTCODE || '8844',
      isLive: !!(
        process.env.AFROMESSAGE_API_KEY || process.env.ETHIO_SMS_API_URL
      ),
      activeCampaignsCount: this.dripCampaigns.filter(
        (c) => c.status === 'ACTIVE',
      ).length,
    };
  }

  // --- TRIGGER RULES METHODS ---

  async getRules() {
    return this.rules;
  }

  async updateRule(
    ruleKey: 'siteVisit' | 'holdExpiry' | 'paymentDue',
    dto: UpdateRuleDto,
  ) {
    if (!this.rules[ruleKey]) {
      throw new NotFoundException(`Rule with key '${ruleKey}' not found.`);
    }

    this.rules[ruleKey] = {
      ...this.rules[ruleKey],
      ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
      ...(dto.timing ? { timing: dto.timing } : {}),
      ...(dto.template ? { template: dto.template } : {}),
    };

    return this.rules[ruleKey];
  }

  // --- DRIP CAMPAIGN METHODS ---

  async getDripCampaigns(): Promise<DripCampaign[]> {
    return this.dripCampaigns;
  }

  async createDripCampaign(dto: CreateDripCampaignDto): Promise<DripCampaign> {
    const newId = `drip-${Date.now()}`;
    const formattedSteps: DripStep[] = (dto.steps || []).map((step, idx) => ({
      id: `step-${Date.now()}-${idx + 1}`,
      stepNumber: idx + 1,
      delayDays: Number(step.delayDays) || 0,
      title: step.title || `Step ${idx + 1}`,
      smsTemplate: step.smsTemplate || '',
    }));

    const campaign: DripCampaign = {
      id: newId,
      name: dto.name,
      targetSegment: dto.targetSegment,
      status: 'ACTIVE',
      enrolledCount: 0,
      completedCount: 0,
      steps: formattedSteps,
    };

    this.dripCampaigns.unshift(campaign);
    this.logger.log(
      `Created new SMS Drip Campaign: ${campaign.name} (${campaign.id})`,
    );
    return campaign;
  }

  async toggleDripCampaign(id: string): Promise<DripCampaign> {
    const campaign = this.dripCampaigns.find((c) => c.id === id);
    if (!campaign) throw new NotFoundException(`Drip Campaign ${id} not found`);

    campaign.status = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    this.logger.log(`Toggled campaign ${id} status to ${campaign.status}`);
    return campaign;
  }

  async addDripStep(
    campaignId: string,
    dto: CreateDripStepDto,
  ): Promise<DripCampaign> {
    const campaign = this.dripCampaigns.find((c) => c.id === campaignId);
    if (!campaign)
      throw new NotFoundException(`Drip Campaign ${campaignId} not found`);

    const newStepNumber = campaign.steps.length + 1;
    const newStep: DripStep = {
      id: `step-${Date.now()}-${newStepNumber}`,
      stepNumber: newStepNumber,
      delayDays: Number(dto.delayDays) || 0,
      title: dto.title || `Step ${newStepNumber}`,
      smsTemplate: dto.smsTemplate || '',
    };

    campaign.steps.push(newStep);
    return campaign;
  }

  async enrollLead(
    campaignId: string,
    dto: EnrollLeadDto,
    actorUserId?: string,
  ): Promise<{ success: boolean; message: string; campaign: DripCampaign }> {
    const campaign = this.dripCampaigns.find((c) => c.id === campaignId);
    if (!campaign)
      throw new NotFoundException(`Drip Campaign ${campaignId} not found`);

    campaign.enrolledCount += 1;

    // Record activity log in system database
    try {
      this.inMemory.recordActivity({
        actorUserId: actorUserId || 'user_001',
        action: `Enrolled ${dto.clientName} (+${this.formatEthioPhone(dto.clientPhone)}) into '${campaign.name}' sequence`,
        target: campaign.id,
        type: 'assignment',
      });
    } catch {
      // Activity logging optional
    }

    // Immediately dispatch step 1 SMS if step 1 delay is 0
    const step1 = campaign.steps.find((s) => s.stepNumber === 1);
    if (step1 && step1.delayDays === 0) {
      let agentPhone = process.env.AFROMESSAGE_SENDER_ID || '0911223344';
      let projectName = 'BetFlow Luxury Properties';
      let unitNumber = 'N/A';

      const { body, missing } = interpolateTemplate(step1.smsTemplate, {
        clientName: dto.clientName,
        projectName,
        agentPhone,
        unitNumber,
      });

      if (missing.length === 0) {
        await this.sendSms(
          {
            recipientName: dto.clientName,
            recipientPhone: dto.clientPhone,
            body,
            triggerType: 'DRIP_CAMPAIGN',
          },
          actorUserId,
        );
      } else {
        this.logger.warn(
          `Skipped immediate drip send for ${dto.clientName}: missing placeholder(s) ${missing.join(', ')}`,
        );
      }
    }

    return {
      success: true,
      message: `Enrolled ${dto.clientName} (+${this.formatEthioPhone(dto.clientPhone)}) into '${campaign.name}' sequence.`,
      campaign,
    };
  }
}

export { EthioTelecomSmsService as SmsService };
