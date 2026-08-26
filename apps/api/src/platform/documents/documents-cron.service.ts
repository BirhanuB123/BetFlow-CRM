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
    return this.runAudit();
  }

  async runAudit() {
    const now = new Date();
    let expiredProcessed = 0;
    let expiringSoonProcessed = 0;

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
      expiredProcessed++;

      const targetUserId = doc.uploadedById || defaultUser?.id;

      // Create Notification if target user exists
      if (targetUserId) {
        let entityDesc = `${doc.entityType} ${doc.entityId}`;
        if (doc.entityType === 'CUSTOMER') {
          const cust = await this.prisma.customer.findUnique({
            where: { id: doc.entityId },
          });
          if (cust) entityDesc = `Customer ${cust.firstName} ${cust.lastName}`;
        } else if (doc.entityType === 'CONTRACT') {
          const cnt = await this.prisma.contract.findUnique({
            where: { id: doc.entityId },
          });
          if (cnt) entityDesc = `Contract ${cnt.contractNumber || cnt.id}`;
        }

        await this.prisma.notification.create({
          data: {
            userId: targetUserId,
            title: `🚨 KYC Document Expired: ${doc.name}`,
            message: `Document '${doc.name}' (${doc.category.replace(/_/g, ' ')}) for ${entityDesc} expired on ${doc.expiresAt?.toLocaleDateString()}. Please request an updated document from the buyer.`,
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

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const doc of expiringSoonDocs) {
      const daysLeft = Math.ceil(
        (doc.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const targetUserId = doc.uploadedById || defaultUser?.id;

      if (targetUserId) {
        // Prevent duplicate notification if alert was already created in last 24h
        const existingNotice = await this.prisma.notification.findFirst({
          where: {
            userId: targetUserId,
            createdAt: { gte: oneDayAgo },
            title: { contains: doc.name },
          },
        });

        if (!existingNotice) {
          let entityDesc = `${doc.entityType} ${doc.entityId}`;
          if (doc.entityType === 'CUSTOMER') {
            const cust = await this.prisma.customer.findUnique({
              where: { id: doc.entityId },
            });
            if (cust) entityDesc = `Customer ${cust.firstName} ${cust.lastName}`;
          } else if (doc.entityType === 'CONTRACT') {
            const cnt = await this.prisma.contract.findUnique({
              where: { id: doc.entityId },
            });
            if (cnt) entityDesc = `Contract ${cnt.contractNumber || cnt.id}`;
          }

          await this.prisma.notification.create({
            data: {
              userId: targetUserId,
              title: `⚠️ KYC Document Expiring Soon (${daysLeft}d): ${doc.name}`,
              message: `Document '${doc.name}' (${doc.category.replace(/_/g, ' ')}) for ${entityDesc} will expire in ${daysLeft} days (on ${doc.expiresAt?.toLocaleDateString()}).`,
            },
          });
          expiringSoonProcessed++;
        }
      }
    }

    return {
      checkedAt: new Date().toISOString(),
      expiredProcessed,
      expiringSoonProcessed,
      totalExpiringSoonFound: expiringSoonDocs.length,
    };
  }
}
