import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { EthioTelecomSmsService } from '../../integrations/sms.service';

@Injectable()
export class DocumentsCronService {
  private readonly logger = new Logger(DocumentsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: EthioTelecomSmsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleDocumentExpiryCheck() {
    const now = new Date();

    // Fetch fallback user for system notifications
    const defaultUser = await this.prisma.user.findFirst();

    // 1. Process Expired Documents (expiresAt < now)
    const expiredDocs = await this.prisma.document.findMany({
      where: {
        expiresAt: { lt: now },
        status: { not: 'EXPIRED' },
      },
    });

    for (const doc of expiredDocs) {
      await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'EXPIRED' },
      });

      this.logger.warn(
        `Document ${doc.id} (${doc.name} - ${doc.category}) marked as EXPIRED`,
      );

      const targetUserId = doc.uploadedById || defaultUser?.id;

      // Create Notification if target user exists
      if (targetUserId) {
        await this.prisma.notification.create({
          data: {
            userId: targetUserId,
            title: `🚨 KYC Document Expired (${doc.category.replace(/_/g, ' ')})`,
            message: `Document '${doc.name}' attached to ${doc.entityType} ${doc.entityId} expired on ${doc.expiresAt?.toLocaleDateString()}. Please request renewed document from buyer.`,
          },
        });
      }

      // Send SMS alert to customer if attached to Customer
      if (doc.entityType === 'CUSTOMER') {
        try {
          const customer = await this.prisma.customer.findUnique({
            where: { id: doc.entityId },
          });

          if (customer && customer.phone) {
            const smsMessage = `Selam ${customer.firstName}! Your verified KYC document (${doc.category.replace(/_/g, ' ')}) expired on ${doc.expiresAt?.toLocaleDateString()}. Please submit an updated document to your sales rep.`;
            await this.smsService.sendSms({
              recipientName: `${customer.firstName} ${customer.lastName}`,
              recipientPhone: customer.phone,
              body: smsMessage,
              triggerType: 'HOLD_EXPIRY_ALERT',
              customerId: customer.id,
            });
          }
        } catch {
          // SMS send fallback
        }
      }
    }

    // 2. Process Upcoming Document Expiries (Expires within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoonDocs = await this.prisma.document.findMany({
      where: {
        expiresAt: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        status: 'VERIFIED',
      },
    });

    for (const doc of expiringSoonDocs) {
      const daysLeft = Math.ceil(
        (doc.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const targetUserId = doc.uploadedById || defaultUser?.id;

      if (targetUserId) {
        await this.prisma.notification.create({
          data: {
            userId: targetUserId,
            title: `⚠️ KYC Document Expiring Soon (${daysLeft} Days Remaining)`,
            message: `Document '${doc.name}' (${doc.category.replace(/_/g, ' ')}) for ${doc.entityType} ${doc.entityId} will expire on ${doc.expiresAt?.toLocaleDateString()}.`,
          },
        });
      }
    }
  }
}
