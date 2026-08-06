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
import {
  InMemoryService,
  type FollowUpReminder,
  type NotificationMessage,
  type OverduePaymentAlert,
} from '../../database/in-memory.service';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';

type CreateNotificationMessageBody = Omit<NotificationMessage, 'id'>;
type CreateOverduePaymentAlertBody = Omit<OverduePaymentAlert, 'id'>;
type CreateFollowUpReminderBody = Omit<FollowUpReminder, 'id'>;

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly store: InMemoryService,
    private readonly notifications: NotificationsService,
  ) {}

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

  // 2. Existing communication channel queue (in-memory mock)
  @Get()
  list(@Query('channel') channel?: NotificationMessage['channel']) {
    return this.store.listNotificationMessages(channel);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateNotificationMessageBody,
  ) {
    const msg = this.store.createNotificationMessage(body);

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
    @Body('status') status: NotificationMessage['status'],
  ) {
    return this.store.updateNotificationStatus(id, status);
  }

  @Get('overdue-payments')
  listOverduePayments() {
    return this.notifications.listOverduePayments();
  }

  @Post('overdue-payments')
  async createOverduePayment(@Body() body: CreateOverduePaymentAlertBody) {
    const alert = this.store.createOverduePaymentAlert(body);

    // Database notification for the late payment owner
    await this.notifications.create({
      userId: body.ownerUserId,
      title: 'Late Payment Alert',
      message: `Payment amount ${body.amount} is overdue by ${body.overdueBy}.`,
    });

    return alert;
  }

  @Get('follow-ups')
  listFollowUps() {
    return this.notifications.listFollowUps();
  }

  @Post('follow-ups')
  async createFollowUp(@Body() body: CreateFollowUpReminderBody) {
    const reminder = this.store.createFollowUpReminder(body);

    // Database notification for the follow up task owner
    await this.notifications.create({
      userId: body.ownerUserId,
      title: 'Follow-up Reminder',
      message: `Action required for lead: ${body.reason}`,
    });

    return reminder;
  }
}
