import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import type { MetaWebhookPayload } from './social-leads.types';

const FACEBOOK_SOURCE_NAME = 'Facebook';
const INSTAGRAM_SOURCE_NAME = 'Instagram';

@Injectable()
export class SocialLeadsService {
  private readonly logger = new Logger(SocialLeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------
  // Webhook verification (GET challenge)
  // Meta sends: hub.mode, hub.verify_token, hub.challenge
  // -------------------------------------------------------
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
  ): string {
    const expected = process.env.META_VERIFY_TOKEN;

    if (!expected) {
      throw new BadRequestException('META_VERIFY_TOKEN is not configured on the server.');
    }

    if (mode === 'subscribe' && token === expected) {
      this.logger.log('Meta webhook verification succeeded.');
      return challenge;
    }

    this.logger.warn(`Meta webhook verification failed. Received token: ${token}`);
    throw new UnauthorizedException('Webhook verification failed: token mismatch.');
  }

  // -------------------------------------------------------
  // Signature validation (POST inbound events)
  // Meta signs every POST with HMAC-SHA256 of the raw body
  // using the App Secret, sent as X-Hub-Signature-256 header.
  // -------------------------------------------------------
  validateSignature(rawBody: Buffer, signatureHeader: string): void {
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret) {
      // If secret is not configured we skip validation in dev
      this.logger.warn('META_APP_SECRET not set — skipping signature validation.');
      return;
    }

    const expected = 'sha256=' +
      crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

    if (signatureHeader !== expected) {
      throw new UnauthorizedException('Invalid Meta webhook signature.');
    }
  }

  // -------------------------------------------------------
  // Process inbound Meta Lead Ads payload
  // -------------------------------------------------------
  async processWebhook(payload: MetaWebhookPayload): Promise<{ processed: number }> {
    if (payload.object !== 'page') {
      return { processed: 0 };
    }

    let count = 0;

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'leadgen') continue;

        try {
          await this.ingestLeadgenEvent(change.value);
          count++;
        } catch (err) {
          // Log and continue — don't fail the whole batch
          this.logger.error('Failed to ingest Meta leadgen event', err);
        }
      }
    }

    this.logger.log(`Meta webhook processed: ${count} lead(s) ingested.`);
    return { processed: count };
  }

  // -------------------------------------------------------
  // Per-event ingestion
  // -------------------------------------------------------
  private async ingestLeadgenEvent(event: MetaWebhookPayload['entry'][0]['changes'][0]['value']) {
    // Parse field_data into a flat map
    const fields: Record<string, string> = {};
    for (const field of event.field_data ?? []) {
      fields[field.name.toLowerCase()] = field.values[0] ?? '';
    }

    // Resolve name
    const fullName = fields['full_name'] ?? '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = fields['first_name'] || nameParts[0] || 'Unknown';
    const lastName = fields['last_name'] || nameParts.slice(1).join(' ') || 'Lead';

    const email = fields['email'] ?? null;
    const phone = fields['phone_number'] ?? null;

    // Determine source: Facebook vs Instagram
    const sourceName = this.resolveSourceName(fields, event);
    const source = await this.findOrCreateSource(sourceName);

    // Create lead
    const lead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        status: 'NEW',
        sourceId: source.id,
      },
    });

    // Save campaign metadata as a note
    const noteParts = [
      `Meta Lead Ad — Campaign: ${event.campaign_name ?? 'N/A'}`,
      `Ad Set: ${event.adset_name ?? 'N/A'}`,
      `Ad: ${event.ad_name ?? 'N/A'}`,
      `Form ID: ${event.form_id}`,
      `Leadgen ID: ${event.leadgen_id}`,
    ];

    await this.prisma.note.create({
      data: {
        entityType: 'Lead',
        entityId: lead.id,
        authorId: lead.id, // system note — no real user
        content: noteParts.join('\n'),
      },
    }).catch(() => {});

    // Audit
    await this.prisma.auditLog.create({
      data: {
        action: 'lead.captured.meta',
        entityType: 'Lead',
        entityId: lead.id,
        newValues: {
          source: sourceName,
          campaign: event.campaign_name ?? '',
          formId: event.form_id,
          leadgenId: event.leadgen_id,
        },
      },
    });

    this.logger.log(`Meta lead ingested: ${lead.id} from ${sourceName} (${event.campaign_name})`);
    return lead;
  }

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------
  private resolveSourceName(
    fields: Record<string, string>,
    event: MetaWebhookPayload['entry'][0]['changes'][0]['value'],
  ): string {
    // If ad_name or campaign_name mentions Instagram, classify accordingly
    const combined = `${event.ad_name ?? ''} ${event.campaign_name ?? ''} ${fields['platform'] ?? ''}`.toLowerCase();
    return combined.includes('instagram') ? INSTAGRAM_SOURCE_NAME : FACEBOOK_SOURCE_NAME;
  }

  private async findOrCreateSource(name: string) {
    let source = await this.prisma.leadSource.findFirst({ where: { name } });
    if (!source) {
      source = await this.prisma.leadSource.create({ data: { name } });
    }
    return source;
  }

  /**
   * Dashboard stats for the integration page.
   */
  async stats() {
    const [facebook, instagram, thisWeek] = await Promise.all([
      this.prisma.lead.count({ where: { source: { name: FACEBOOK_SOURCE_NAME } } }),
      this.prisma.lead.count({ where: { source: { name: INSTAGRAM_SOURCE_NAME } } }),
      this.prisma.lead.count({
        where: {
          source: { name: { in: [FACEBOOK_SOURCE_NAME, INSTAGRAM_SOURCE_NAME] } },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      facebook,
      instagram,
      total: facebook + instagram,
      thisWeek,
      webhookConfigured: !!process.env.META_VERIFY_TOKEN,
      signatureValidation: !!process.env.META_APP_SECRET,
    };
  }
}
