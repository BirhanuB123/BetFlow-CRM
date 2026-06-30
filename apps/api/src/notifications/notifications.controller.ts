import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type {
  FollowUpReminder,
  NotificationMessage,
  OverduePaymentAlert,
} from '../database/in-memory.service';

type CreateNotificationMessageBody = Omit<NotificationMessage, 'id'>;
type CreateOverduePaymentAlertBody = Omit<OverduePaymentAlert, 'id'>;
type CreateFollowUpReminderBody = Omit<FollowUpReminder, 'id'>;

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(
    @Query('tenantId') tenantId?: string,
    @Query('channel') channel?: NotificationMessage['channel'],
  ) {
    return this.store.listNotificationMessages(tenantId, channel);
  }

  @Post()
  create(@Body() body: CreateNotificationMessageBody) {
    return this.store.createNotificationMessage(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: NotificationMessage['status'],
  ) {
    return this.store.updateNotificationStatus(id, status);
  }

  @Get('overdue-payments')
  listOverduePayments(@Query('tenantId') tenantId?: string) {
    return this.store.listOverduePaymentAlerts(tenantId);
  }

  @Post('overdue-payments')
  createOverduePayment(@Body() body: CreateOverduePaymentAlertBody) {
    return this.store.createOverduePaymentAlert(body);
  }

  @Get('follow-ups')
  listFollowUps(@Query('tenantId') tenantId?: string) {
    return this.store.listFollowUpReminders(tenantId);
  }

  @Post('follow-ups')
  createFollowUp(@Body() body: CreateFollowUpReminderBody) {
    return this.store.createFollowUpReminder(body);
  }
}
