import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { EthioTelecomSmsService } from './sms.service';
import { interpolateTemplate } from './sms-template.util';

export type CreateCampaignInput = {
  title: string;
  channel: 'TELEGRAM' | 'FACEBOOK' | 'SMS' | 'WHATSAPP';
  segment?: string;
  message: string;
  targetUrl?: string;
};

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: EthioTelecomSmsService,
  ) {}

  async listCampaigns() {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: { startDate: 'desc' },
    });

    return campaigns.map((c) => {
      const channel = (c.type || 'TELEGRAM') as
        'TELEGRAM' | 'FACEBOOK' | 'SMS' | 'WHATSAPP';

      const isConnected = channel === 'TELEGRAM' || channel === 'SMS';
      const recipients = c.recipientCount ?? 0;

      let segment = 'Targeted Audience';
      if (channel === 'TELEGRAM') {
        segment = `Telegram Channel Subscribers (${recipients.toLocaleString()})`;
      } else if (channel === 'FACEBOOK') {
        segment = 'Meta Lead Audience (Channel Not Connected)';
      } else if (channel === 'WHATSAPP') {
        segment = 'WhatsApp Audience (Channel Not Connected)';
      } else if (channel === 'SMS') {
        segment = `SMS Contacts (${recipients.toLocaleString()})`;
      }

      return {
        id: c.id,
        title: c.name,
        channel,
        segment,
        recipients,
        sentAt: c.startDate
          ? c.startDate.toISOString()
          : new Date().toISOString(),
        clicks: channel === 'TELEGRAM' ? (c.clicks ?? 0) : 0,
        status: (c.status || (isConnected ? 'SENT' : 'DRAFT')) as
          'SENT' | 'SCHEDULED' | 'DRAFT' | 'FAILED',
        messagePreview: c.name,
      };
    });
  }

  async createCampaign(userId: string | undefined, input: CreateCampaignInput) {
    if (!input.title?.trim()) {
      throw new BadRequestException('title is required');
    }
    if (!input.message?.trim()) {
      throw new BadRequestException('message is required');
    }

    const channel = input.channel || 'TELEGRAM';

    if (channel !== 'TELEGRAM' && channel !== 'SMS') {
      const channelName =
        channel === 'FACEBOOK'
          ? 'Meta / Facebook Marketing API'
          : 'WhatsApp Business API';

      throw new BadRequestException(
        `${channelName} integration is not connected. Broadcasts are currently active for Telegram Official Channel and Ethio Telecom SMS Gateway.`,
      );
    }
    const campaignId = randomUUID();

    let campaignStatus: 'SENT' | 'FAILED' = 'SENT';
    let errorMessage: string | null = null;
    let realRecipientCount: number | null = null;

    let messageToSend = input.message.trim();
    let targetUrl: string | null = input.targetUrl?.trim() || null;

    // Detect first URL in message if targetUrl is not explicitly passed
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const urlMatch = messageToSend.match(urlRegex);
    if (!targetUrl && urlMatch) {
      targetUrl = urlMatch[0];
    }

    if (channel === 'TELEGRAM') {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const channelId = process.env.TELEGRAM_CHANNEL_ID;

      if (!botToken || !channelId) {
        errorMessage =
          'Telegram configuration missing: TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set in environment.';
        this.logger.error(errorMessage);
        campaignStatus = 'FAILED';
      } else {
        // Embed self-hosted trackable redirect link if a destination URL is present
        if (targetUrl) {
          const rawApiUrl =
            process.env.PUBLIC_API_URL ||
            process.env.API_BASE_URL ||
            'http://localhost:4000/api';
          const publicApiUrl = rawApiUrl.endsWith('/api')
            ? rawApiUrl
            : `${rawApiUrl.replace(/\/$/, '')}/api`;
          const trackableLink = `${publicApiUrl}/r/${campaignId}`;

          if (urlMatch) {
            messageToSend = messageToSend.replace(urlMatch[0], trackableLink);
          } else {
            messageToSend = `${messageToSend}\n\n${trackableLink}`;
          }
        }

        // Fetch real channel subscriber count at send time
        try {
          const countRes = await fetch(
            `https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${encodeURIComponent(channelId)}`,
          );
          const countJson = await countRes.json();
          if (
            countRes.ok &&
            countJson.ok === true &&
            typeof countJson.result === 'number'
          ) {
            realRecipientCount = countJson.result;
          } else {
            const fallbackRes = await fetch(
              `https://api.telegram.org/bot${botToken}/getChatMembersCount?chat_id=${encodeURIComponent(channelId)}`,
            );
            const fallbackJson = await fallbackRes.json();
            if (
              fallbackRes.ok &&
              fallbackJson.ok === true &&
              typeof fallbackJson.result === 'number'
            ) {
              realRecipientCount = fallbackJson.result;
            }
          }
        } catch (err) {
          this.logger.warn(`Could not fetch Telegram subscriber count: ${err}`);
        }

        try {
          // Attempt sending with parse_mode: 'HTML' for rich bold/italic/link formatting
          let response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: channelId,
                text: messageToSend,
                parse_mode: 'HTML',
              }),
            },
          );

          let result = await response.json();

          // Fallback to plain text if custom HTML parsing fails
          if (!response.ok || result.ok !== true) {
            response = await fetch(
              `https://api.telegram.org/bot${botToken}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: channelId,
                  text: messageToSend,
                }),
              },
            );
            result = await response.json();
          }

          if (response.ok && result.ok === true) {
            campaignStatus = 'SENT';
            this.logger.log(
              `Successfully broadcasted Telegram message to channel ${channelId}. Message ID: ${result.result?.message_id}`,
            );
          } else {
            campaignStatus = 'FAILED';
            errorMessage =
              result?.description ||
              `Telegram API returned HTTP ${response.status}`;
            this.logger.error(`Telegram broadcast failed: ${errorMessage}`);
          }
        } catch (err) {
          campaignStatus = 'FAILED';
          errorMessage =
            err instanceof Error
              ? err.message
              : 'Network error communicating with Telegram API';
          this.logger.error(
            `Telegram broadcast network error: ${errorMessage}`,
          );
        }
      }
    }

    if (channel === 'SMS') {
      try {
        const allContacts = await this.smsService.getSmsContacts();

        let targetContacts = allContacts;
        if (
          input.segment &&
          input.segment.trim() !== '' &&
          !input.segment.toLowerCase().includes('all')
        ) {
          const segNormalized = input.segment
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_');
          const filtered = allContacts.filter(
            (c) =>
              c.segment === segNormalized ||
              c.type === segNormalized ||
              (c.details && c.details.toUpperCase().includes(segNormalized)),
          );
          if (filtered.length > 0) {
            targetContacts = filtered;
          }
        }

        const validPhoneContacts = targetContacts.filter((c) => !!c.phone);
        let sentCount = 0;

        for (const contact of validPhoneContacts) {
          const { body } = interpolateTemplate(messageToSend, {
            clientName: contact.name,
            projectName: 'BetFlow Properties',
            agentPhone: process.env.AFROMESSAGE_SENDER_ID || '0911223344',
          });

          await this.smsService.sendSms(
            {
              recipientName: contact.name,
              recipientPhone: contact.phone,
              body,
              triggerType: 'MANUAL_BROADCAST',
            },
            userId,
          );
          sentCount++;
        }

        realRecipientCount = sentCount;
        campaignStatus = 'SENT';
        this.logger.log(
          `Successfully dispatched SMS Campaign "${input.title}" to ${sentCount} recipient(s).`,
        );
      } catch (err) {
        campaignStatus = 'FAILED';
        errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to dispatch SMS campaign';
        this.logger.error(`SMS campaign broadcast failed: ${errorMessage}`);
      }
    }

    const effectiveRecipients =
      channel === 'TELEGRAM' || channel === 'SMS'
        ? (realRecipientCount ?? 0)
        : 0;

    const campaign = await this.prisma.campaign.create({
      data: {
        id: campaignId,
        name: input.title.trim(),
        type: channel,
        status: campaignStatus,
        recipientCount:
          channel === 'TELEGRAM' || channel === 'SMS' ? realRecipientCount : 0,
        targetUrl: targetUrl || null,
        clicks: 0,
        startDate: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        action:
          channel === 'SMS'
            ? 'sms_campaign.created'
            : 'social_campaign.created',
        entityType: 'Campaign',
        entityId: campaign.id,
        newValues: {
          title: campaign.name,
          channel,
          recipients: effectiveRecipients,
          status: campaignStatus,
          targetUrl: targetUrl || undefined,
          error: errorMessage || undefined,
        },
      },
    });

    if (channel === 'TELEGRAM' && campaignStatus === 'FAILED') {
      throw new BadRequestException(
        `Telegram broadcast failed: ${errorMessage || 'Unknown error'}`,
      );
    }

    if (channel === 'SMS' && campaignStatus === 'FAILED') {
      throw new BadRequestException(
        `SMS broadcast failed: ${errorMessage || 'Unknown error'}`,
      );
    }

    return {
      id: campaign.id,
      title: campaign.name,
      channel,
      segment:
        input.segment ||
        `${channel} Audience (${effectiveRecipients.toLocaleString()})`,
      recipients: effectiveRecipients,
      sentAt: campaign.startDate?.toISOString() || new Date().toISOString(),
      clicks: 0,
      status: campaignStatus,
      messagePreview: input.message.trim(),
    };
  }
}
