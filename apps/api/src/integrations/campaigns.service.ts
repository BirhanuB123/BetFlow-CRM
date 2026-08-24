import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type CreateCampaignInput = {
  title: string;
  channel: 'TELEGRAM' | 'FACEBOOK' | 'SMS' | 'WHATSAPP';
  segment?: string;
  message: string;
};

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCampaigns() {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: { startDate: 'desc' },
    });

    // Query live recipient counts from PostgreSQL
    const leadCount = await this.prisma.lead.count();
    const customerCount = await this.prisma.customer.count();
    const actualRecipientCount = leadCount + customerCount;

    return campaigns.map((c) => {
      const channel = (c.type || 'TELEGRAM') as
        'TELEGRAM' | 'FACEBOOK' | 'SMS' | 'WHATSAPP';

      const recipients = actualRecipientCount;

      return {
        id: c.id,
        title: c.name,
        channel,
        segment: `${channel === 'TELEGRAM' ? 'Telegram Channel Subscribers' : 'Targeted Leads & Buyers'} (${recipients.toLocaleString()})`,
        recipients,
        sentAt: c.startDate
          ? c.startDate.toISOString()
          : new Date().toISOString(),
        clicks: 0,
        status: (c.status || 'SENT') as 'SENT' | 'SCHEDULED' | 'DRAFT',
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

    // Query live recipient counts from PostgreSQL database
    const leadCount = await this.prisma.lead.count();
    const customerCount = await this.prisma.customer.count();
    const recipients = leadCount + customerCount;

    const channel = input.channel || 'TELEGRAM';

    const campaign = await this.prisma.campaign.create({
      data: {
        name: input.title.trim(),
        type: channel,
        status: 'SENT',
        startDate: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: 'social_campaign.created',
        entityType: 'Campaign',
        entityId: campaign.id,
        newValues: {
          title: campaign.name,
          channel,
          recipients,
        },
      },
    });

    return {
      id: campaign.id,
      title: campaign.name,
      channel,
      segment:
        input.segment || `${channel} Audience (${recipients.toLocaleString()})`,
      recipients,
      sentAt: campaign.startDate?.toISOString() || new Date().toISOString(),
      clicks: 0,
      status: 'SENT',
      messagePreview: input.message.trim(),
    };
  }
}
