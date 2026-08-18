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

export const LOCALIZED_TEMPLATES: Record<SmsTemplateCategory, LocalizedTemplate> = {
  paymentMilestone: {
    category: 'paymentMilestone',
    title: 'Payment Milestone Due Date',
    en: 'Dear {clientName}, payment reminder: Your milestone "{milestoneName}" of ETB {amount} for Unit {unitNumber} ({projectName}) is due on {dueDate}. CBE Acc: 1000123456789 (BetFlow Real Estate).',
    am: 'ውድ {clientName}፣ የክፍያ ማሳሰቢያ፡ ለቤት ቁጥር {unitNumber} ({projectName}) የደረጃ "{milestoneName}" ክፍያ ETB {amount} በ{dueDate} መክፈል እንዳለብዎት እናሳስባለን። CBE: 1000123456789።',
    variables: ['clientName', 'milestoneName', 'amount', 'unitNumber', 'projectName', 'dueDate'],
  },
  paymentReceipt: {
    category: 'paymentReceipt',
    title: 'Payment Receipt Confirmation',
    en: 'Dear {clientName}, payment received! ETB {amount} received on {paymentDate} for Unit {unitNumber}. Receipt #{receiptNumber}. Remaining balance: ETB {remainingBalance}.',
    am: 'ውድ {clientName}፣ የክፍያ ደረሰኝ፡ ለቤት ቁጥር {unitNumber} ETB {amount} በ{paymentDate} ገቢ ሆኗል። የደረሰኝ ቁጥር #{receiptNumber}። ቀሪ ክፍያ፡ ETB {remainingBalance}።',
    variables: ['clientName', 'amount', 'paymentDate', 'unitNumber', 'receiptNumber', 'remainingBalance'],
  },
  siteVisitConfirm: {
    category: 'siteVisitConfirm',
    title: 'Site Visit Confirmation',
    en: 'Dear {clientName}, site visit confirmed! Your tour of {projectName} is scheduled for {visitDate} at {visitTime}. Your sales agent is {agentName} ({agentPhone}).',
    am: 'ውድ {clientName}፣ የሳይት ጉብኝት ተረጋግጧል! የ{projectName} ፕሮጀክት ጉብኝት በ{visitDate} በ{visitTime} ተይዟል። መሪ አሸኛችሁ፡ {agentName} ({agentPhone})።',
    variables: ['clientName', 'projectName', 'visitDate', 'visitTime', 'agentName', 'agentPhone'],
  },
  siteVisitFollowup: {
    category: 'siteVisitFollowup',
    title: 'Post-Site-Visit Follow-Up',
    en: 'Selam {clientName}! Thank you for visiting {projectName} today. Unit {unitNumber} is available with custom finishing options. Contact {agentName} ({agentPhone}) to reserve.',
    am: 'ሰላም {clientName}! ዛሬ {projectName} ስላስጎበኘንዎ እናመሰግናለን። ለቤት ቁጥር {unitNumber} ምርጫዎን ለማረጋገጥ ለ{agentName} ({agentPhone}) ይደውሉ።',
    variables: ['clientName', 'projectName', 'unitNumber', 'agentName', 'agentPhone'],
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

  // In-memory SMS outbox logs store for API delivery reports
  private smsOutboxLogs: Array<{
    id: string;
    recipientName: string;
    recipientPhone: string;
    body: string;
    triggerType: string;
    status: 'DELIVERED' | 'QUEUED' | 'FAILED';
    sentAt: string;
    costEthioBirr: number;
  }> = [
    {
      id: 'sms-log-1',
      recipientName: 'Ari Kaplan',
      recipientPhone: '251911550182',
      body: 'Dear Ari Kaplan, reminder: Your property site visit to Harbor Point Towers is scheduled for today at 2:30 PM. Agent: Maya Johnson.',
      triggerType: 'SITE_VISIT_REMINDER',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      costEthioBirr: 0.35,
    },
    {
      id: 'sms-log-2',
      recipientName: 'Priya Shah',
      recipientPhone: '251922550144',
      body: 'Dear Priya Shah, urgent notice: Your 14-day hold reservation on Unit A-1803 (Harbor Point) expires in 24 hours. Contact BetFlow Sales.',
      triggerType: 'HOLD_EXPIRY_ALERT',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      costEthioBirr: 0.35,
    },
    {
      id: 'sms-log-3',
      recipientName: 'Marcus Bell',
      recipientPhone: '251933550118',
      body: 'Dear Marcus Bell, installment reminder: Your 30% Downpayment payment of ETB 2,500,000 for Unit N-0905 is due on 2026-08-01. CBE Acc: 1000123456789.',
      triggerType: 'PAYMENT_DUE_ALERT',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      costEthioBirr: 0.35,
    },
  ];

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
    if (!raw) return '251911234567';
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.startsWith('251')) return cleaned;
    if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
      return `251${cleaned.substring(1)}`;
    }
    if (cleaned.length === 9) {
      return `251${cleaned}`;
    }
    return cleaned.length >= 9 ? cleaned : `2519${cleaned.padStart(8, '1')}`;
  }

  /**
   * Get real CRM system database contacts (Leads + Customers)
   */
  async getSmsContacts(): Promise<SmsContact[]> {
    const leads = this.inMemory.listLeads();
    const customers = this.inMemory.listCustomers();

    const leadContacts: SmsContact[] = leads.map((l) => {
      let segment: SmsContact['segment'] = 'COLD_LEADS';
      if (l.stage === 'tour_scheduled') segment = 'SITE_VISITORS';
      else if (l.stage === 'proposal' || l.stage === 'qualified')
        segment = 'WARM_LEADS';

      return {
        id: l.id,
        name: l.name,
        phone: this.formatEthioPhone(l.phone || '0911550182'),
        email: l.email,
        type: 'LEAD',
        segment,
        details: `${l.company} (${l.stage.replace('_', ' ')}) · Budget: ETB ${(l.budget || 1500000).toLocaleString()}`,
      };
    });

    const customerContacts: SmsContact[] = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: this.formatEthioPhone(c.phone || '0922550118'),
      email: c.email,
      type: 'CUSTOMER',
      segment: 'RESERVATION_CLIENTS',
      details: `${c.type.toUpperCase()} (${c.status})`,
    }));

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

    if (recipientsMap.size === 0) {
      recipientsMap.set('demo-1', { name: 'Ari Kaplan', phone: '0911550182' });
      recipientsMap.set('demo-2', { name: 'Priya Shah', phone: '0922550144' });
    }

    const templateObj = LOCALIZED_TEMPLATES.constructionUpdate;
    const rawTemplate = lang === 'am' ? templateObj.am : templateObj.en;

    const dispatchedLogs = [];

    for (const recipient of Array.from(recipientsMap.values())) {
      const body = rawTemplate
        .replace('{projectName}', projectName)
        .replace('{stageName}', stageName.replace(/_/g, ' '));

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
   * Send an SMS alert via AfroMessage or Ethio Telecom API Gateway
   */
  async sendSms(dto: SmsSendDto) {
    const formattedPhone = this.formatEthioPhone(dto.recipientPhone);
    const triggerType = dto.triggerType || 'MANUAL_BROADCAST';

    this.logger.log(
      `[SMS Gateway Dispatch] Sending to ${formattedPhone} (${dto.recipientName}): "${dto.body.substring(0, 40)}..."`,
    );

    let status: 'DELIVERED' | 'QUEUED' | 'FAILED' = 'DELIVERED';

    // 1. AfroMessage Gateway Integration (Primary Ethiopian Aggregator)
    if (process.env.AFROMESSAGE_API_KEY) {
      try {
        const apiKey = process.env.AFROMESSAGE_API_KEY.trim();
        const senderId = process.env.AFROMESSAGE_SENDER_ID || '';
        const url = `https://api.afromessage.com/api/send?to=${formattedPhone}&message=${encodeURIComponent(dto.body)}${senderId ? `&sender=${encodeURIComponent(senderId)}` : ''}`;

        this.logger.log(
          `Dispatching real SMS via AfroMessage Gateway to +${formattedPhone}...`,
        );

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        });

        const data = (await response.json().catch(() => null)) as {
          acknowledge?: string;
          response?: { code?: number };
        } | null;

        if (
          response.ok &&
          (data?.acknowledge === 'success' || data?.response?.code === 200)
        ) {
          this.logger.log(
            `[AfroMessage SMS Success] Message delivered to +${formattedPhone}`,
          );
          status = 'DELIVERED';
        } else {
          this.logger.warn(
            `[AfroMessage SMS Failed] HTTP ${response.status}: ${JSON.stringify(data)}`,
          );
          status = 'FAILED';
        }
      } catch (err) {
        this.logger.error(`AfroMessage API connection failed: ${err}`);
        status = 'FAILED';
      }
    }
    // 2. Ethio Telecom Enterprise Direct API Gateway
    else if (process.env.ETHIO_SMS_API_URL) {
      try {
        const response = await fetch(process.env.ETHIO_SMS_API_URL, {
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
        });

        if (response.ok) {
          status = 'DELIVERED';
        } else {
          this.logger.warn(`Ethio Telecom HTTP Error: ${response.statusText}`);
          status = 'FAILED';
        }
      } catch (err) {
        this.logger.error(`Ethio Telecom API connection failed: ${err}`);
        status = 'FAILED';
      }
    }

    const logEntry = {
      id: `sms-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recipientName: dto.recipientName,
      recipientPhone: formattedPhone,
      body: dto.body,
      triggerType,
      status,
      sentAt: new Date().toISOString(),
      costEthioBirr: 0.35,
    };

    this.smsOutboxLogs.unshift(logEntry);

    // Record activity in CRM system database audit log
    try {
      this.inMemory.recordActivity({
        actorUserId: 'user_001',
        action: `Dispatched SMS (${triggerType}) to ${dto.recipientName} (+${formattedPhone})`,
        target: formattedPhone,
        type: 'call',
      });
    } catch {
      // Activity logging optional
    }

    return logEntry;
  }

  /**
   * Get all SMS Outbox Logs
   */
  async getOutboxLogs() {
    return this.smsOutboxLogs;
  }

  /**
   * Get SMS Gateway Analytics & System Status
   */
  async getSmsStats() {
    const totalSent = this.smsOutboxLogs.length;
    const delivered = this.smsOutboxLogs.filter(
      (l) => l.status === 'DELIVERED',
    ).length;
    const totalCostBirr = this.smsOutboxLogs.reduce(
      (acc, curr) => acc + (curr.costEthioBirr || 0),
      0,
    );
    const activeCampaigns = this.dripCampaigns.filter(
      (c) => c.status === 'ACTIVE',
    ).length;

    let gatewayProvider = 'Ethio Telecom Gateway Sandbox';
    if (process.env.AFROMESSAGE_API_KEY) {
      gatewayProvider = 'AfroMessage Live Gateway (Ethiopia)';
    } else if (process.env.ETHIO_SMS_API_URL) {
      gatewayProvider = 'Ethio Telecom Live Shortcode';
    }

    return {
      totalSent,
      delivered,
      failed: totalSent - delivered,
      deliveryRate:
        totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 100,
      totalCostBirr: Math.round(totalCostBirr * 100) / 100,
      gatewayProvider,
      shortcode: process.env.ETHIO_SMS_SHORTCODE || '8844',
      isLive: !!(
        process.env.AFROMESSAGE_API_KEY || process.env.ETHIO_SMS_API_URL
      ),
      activeCampaignsCount: activeCampaigns,
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
  ): Promise<{ success: boolean; message: string; campaign: DripCampaign }> {
    const campaign = this.dripCampaigns.find((c) => c.id === campaignId);
    if (!campaign)
      throw new NotFoundException(`Drip Campaign ${campaignId} not found`);

    campaign.enrolledCount += 1;

    // Record activity log in system database
    try {
      this.inMemory.recordActivity({
        actorUserId: 'user_001',
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
      await this.sendSms({
        recipientName: dto.clientName,
        recipientPhone: dto.clientPhone,
        body: step1.smsTemplate.replaceAll('{clientName}', dto.clientName),
        triggerType: 'DRIP_CAMPAIGN',
      });
    }

    return {
      success: true,
      message: `Enrolled ${dto.clientName} (+${this.formatEthioPhone(dto.clientPhone)}) into '${campaign.name}' sequence.`,
      campaign,
    };
  }
}
