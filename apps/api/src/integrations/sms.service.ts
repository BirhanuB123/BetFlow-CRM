import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export class SmsSendDto {
  recipientPhone!: string;
  recipientName!: string;
  body!: string;
  triggerType?: 'SITE_VISIT_REMINDER' | 'HOLD_EXPIRY_ALERT' | 'PAYMENT_DUE_ALERT' | 'DRIP_CAMPAIGN' | 'MANUAL_BROADCAST';
  leadId?: string;
  customerId?: string;
}

@Injectable()
export class EthioTelecomSmsService {
  private readonly logger = new Logger(EthioTelecomSmsService.name);

  // In-memory SMS outbox logs store for demonstration & API delivery reports
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
      recipientName: 'Kebede User',
      recipientPhone: '251911234567',
      body: 'Dear Kebede User, reminder: Your property site visit to Harbor Point Towers is scheduled for today at 2:30 PM. Agent: Birhanu B.',
      triggerType: 'SITE_VISIT_REMINDER',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      costEthioBirr: 0.35,
    },
    {
      id: 'sms-log-2',
      recipientName: 'Tigist Alemu',
      recipientPhone: '251922345678',
      body: 'Dear Tigist Alemu, urgent notice: Your 14-day hold reservation on Unit 1202 (Harbor Point) expires in 24 hours.',
      triggerType: 'HOLD_EXPIRY_ALERT',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      costEthioBirr: 0.35,
    },
    {
      id: 'sms-log-3',
      recipientName: 'Dawit Haile',
      recipientPhone: '251933456789',
      body: 'Dear Dawit Haile, installment reminder: Your 30% Downpayment payment of ETB 2,500,000 for Unit 1103 is due on 2026-08-01. CBE Acc: 1000123456789.',
      triggerType: 'PAYMENT_DUE_ALERT',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      costEthioBirr: 0.35,
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Format any phone number into canonical Ethio Telecom format (e.g. 251911234567)
   */
  formatEthioPhone(raw: string): string {
    if (!raw) return '';
    const cleaned = raw.replace(/\D/g, '');
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

        this.logger.log(`Dispatching real SMS via AfroMessage Gateway to +${formattedPhone}...`);

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

        if (response.ok && (data?.acknowledge === 'success' || data?.response?.code === 200)) {
          this.logger.log(`[AfroMessage SMS Success] Message delivered to +${formattedPhone}`);
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
    return logEntry;
  }

  /**
   * Get all SMS Outbox Logs
   */
  async getOutboxLogs() {
    return this.smsOutboxLogs;
  }

  /**
   * Get SMS Gateway Analytics
   */
  async getSmsStats() {
    const totalSent = this.smsOutboxLogs.length;
    const delivered = this.smsOutboxLogs.filter((l) => l.status === 'DELIVERED').length;
    const totalCostBirr = this.smsOutboxLogs.reduce((acc, curr) => acc + (curr.costEthioBirr || 0), 0);

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
      deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 100,
      totalCostBirr: Math.round(totalCostBirr * 100) / 100,
      gatewayProvider,
      shortcode: process.env.ETHIO_SMS_SHORTCODE || '8844',
      isLive: !!(process.env.AFROMESSAGE_API_KEY || process.env.ETHIO_SMS_API_URL),
    };
  }
}
