import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';

type CreateNotificationMessageBody = {
  channel: 'sms' | 'telegram' | 'email';
  recipient: string;
  subject: string;
  relatedTo?: string;
  scheduledFor?: string;
  status?: 'queued' | 'sent' | 'failed' | 'scheduled';
};

type CreateOverduePaymentAlertBody = {
  customerId: string;
  reservationId: string;
  amount: number;
  overdueBy: string;
  ownerUserId: string;
  priority?: 'high' | 'medium' | 'low';
};

type CreateFollowUpReminderBody = {
  leadId: string;
  ownerUserId: string;
  dueAt: string;
  reason: string;
  channel: 'sms' | 'telegram' | 'email';
  priority?: 'high' | 'medium' | 'low';
};

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  // 1. Database-backed in-app inbox endpoints
  @UseGuards(JwtAuthGuard)
  @Get('inbox')
  listInbox(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.listForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('inbox/:id/read')
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('isRead') isRead: boolean,
  ) {
    return this.notifications.markAsRead(user.id, id, isRead);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('inbox/:id')
  deleteInbox(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notifications.delete(user.id, id);
  }

  // 2. Outbound message queue dispatch log (Prisma-backed)
  @Get()
  list(@Query('channel') channel?: string) {
    return this.notifications.listNotificationMessages(channel);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateNotificationMessageBody,
  ) {
    const msg = await this.notifications.createNotificationMessage(body);

    // Write dynamic notification for user
    await this.notifications.create({
      userId: user.id,
      title: `${body.channel.toUpperCase()} Dispatched`,
      message: `Message sent to ${body.recipient}: "${body.subject}"`,
    });

    return msg;
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.notifications.updateNotificationStatus(id, status);
  }

  @Get('overdue-payments')
  listOverduePayments() {
    return this.notifications.listOverduePayments();
  }

  @Post('overdue-payments')
  async createOverduePayment(@Body() body: CreateOverduePaymentAlertBody) {
    // Database notification for the late payment owner
    return this.notifications.create({
      userId: body.ownerUserId,
      title: 'Late Payment Alert',
      message: `Payment amount ${body.amount} is overdue by ${body.overdueBy}.`,
    });
  }

  @Get('follow-ups')
  listFollowUps() {
    return this.notifications.listFollowUps();
  }

  @Post('follow-ups')
  async createFollowUp(@Body() body: CreateFollowUpReminderBody) {
    // Database notification for the follow up task owner
    return this.notifications.create({
      userId: body.ownerUserId,
      title: 'Follow-up Reminder',
      message: `Action required for lead: ${body.reason}`,
    });
  }
}
