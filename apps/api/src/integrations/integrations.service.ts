import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSocialLeadsStats() {
    const facebookLeads = await this.prisma.lead.count({
      where: { source: { name: 'Facebook' } },
    });
    const instagramLeads = await this.prisma.lead.count({
      where: { source: { name: 'Instagram' } },
    });
    const total = facebookLeads + instagramLeads;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await this.prisma.lead.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        source: { name: { in: ['Facebook', 'Instagram'] } },
      },
    });

    return {
      facebook: facebookLeads,
      instagram: instagramLeads,
      total,
      thisWeek,
      webhookConfigured: !!process.env.META_VERIFY_TOKEN,
      signatureValidation: !!process.env.META_APP_SECRET,
    };
  }

  async processMetaLead(entry: any) {
    if (!entry || !entry.changes) return;

    for (const change of entry.changes) {
      if (change.field !== 'leadgen') continue;

      const leadData = change.value;

      let firstName = 'Meta';
      let lastName = 'Lead';
      let email = 'lead@facebook.com';
      let phone = '';

      if (leadData.field_data) {
        for (const field of leadData.field_data) {
          if (field.name === 'full_name' || field.name === 'name') {
            const parts = field.values[0].split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || 'Lead';
          } else if (field.name === 'email') {
            email = field.values[0];
          } else if (field.name === 'phone_number') {
            phone = field.values[0];
          }
        }
      }

      await this.createLeadFromSource(
        'Facebook',
        firstName,
        lastName,
        email,
        phone,
      );
    }
  }

  async processTelegramLead(payload: any) {
    if (!payload.message) return;

    const message = payload.message;
    const text = message.text || '';
    const from = message.from;

    let firstName = from?.first_name || 'Telegram';
    let lastName = from?.last_name || 'User';
    let email = '';
    let phone = '';

    await this.createLeadFromSource(
      'Telegram',
      firstName,
      lastName,
      email,
      phone,
      text,
    );
  }

  private async createLeadFromSource(
    sourceName: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    notes?: string,
  ) {
    let source = await this.prisma.leadSource.findFirst({
      where: { name: sourceName },
    });
    if (!source) {
      source = await this.prisma.leadSource.create({
        data: { name: sourceName },
      });
    }

    const lead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        sourceId: source.id,
      },
    });

    if (notes) {
      this.logger.log(`Received notes: ${notes}`);
    }

    this.logger.log(`Created new lead ${lead.id} from ${sourceName}`);
  }

  validateMetaSignature(payload: string, signature: string): boolean {
    const secret = process.env.META_APP_SECRET;
    if (!secret) return true;

    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest),
      );
    } catch {
      return false;
    }
  }
}
