import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { WebsiteLeadCaptureDto } from './website-leads.dto';

const WEBSITE_SOURCE_NAME = 'Website';

@Injectable()
export class WebsiteLeadsService {
  private readonly logger = new Logger(WebsiteLeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async capture(dto: WebsiteLeadCaptureDto) {
    // 1. Find or create the "Website" lead source
    let source = await this.prisma.leadSource.findFirst({
      where: { name: WEBSITE_SOURCE_NAME },
    });
    if (!source) {
      source = await this.prisma.leadSource.create({
        data: { name: WEBSITE_SOURCE_NAME },
      });
    }

    // 2. Build note content from message + UTM data
    const noteParts: string[] = [];
    if (dto.message) noteParts.push(`Message: ${dto.message}`);
    if (dto.utmSource) noteParts.push(`UTM Source: ${dto.utmSource}`);
    if (dto.utmMedium) noteParts.push(`UTM Medium: ${dto.utmMedium}`);
    if (dto.utmCampaign) noteParts.push(`UTM Campaign: ${dto.utmCampaign}`);

    // 3. Create lead
    const lead = await this.prisma.lead.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email?.trim() || null,
        phone: dto.phone?.trim() || null,
        company: dto.company?.trim() || null,
        status: 'NEW',
        sourceId: source.id,
      },
    });

    // 4. Save any message/UTM data as a system Note
    if (noteParts.length > 0) {
      await this.prisma.note
        .create({
          data: {
            entityType: 'Lead',
            entityId: lead.id,
            authorId: lead.id, // system-generated; no real user — use lead id as placeholder
            content: noteParts.join('\n'),
          },
        })
        .catch(() => {
          // Note creation is non-critical; ignore failures
        });
    }

    // 5. Audit trail
    await this.prisma.auditLog.create({
      data: {
        action: 'lead.captured.website',
        entityType: 'Lead',
        entityId: lead.id,
        newValues: {
          source: WEBSITE_SOURCE_NAME,
          email: dto.email ?? '',
          utm: dto.utmSource ?? '',
        },
      },
    });

    this.logger.log(
      `Website lead captured: ${lead.id} (${lead.firstName} ${lead.lastName})`,
    );

    return {
      success: true,
      leadId: lead.id,
      message: 'Lead captured successfully. Our team will be in touch shortly.',
    };
  }

  /**
   * Returns capture statistics for the integration dashboard.
   */
  async stats() {
    const [total, today, thisWeek] = await Promise.all([
      this.prisma.lead.count({
        where: { source: { name: WEBSITE_SOURCE_NAME } },
      }),
      this.prisma.lead.count({
        where: {
          source: { name: WEBSITE_SOURCE_NAME },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.lead.count({
        where: {
          source: { name: WEBSITE_SOURCE_NAME },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return { total, today, thisWeek };
  }
}
