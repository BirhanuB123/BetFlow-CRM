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
    @Query('channel') channel?: NotificationMessage['channel'],
  ) {
    return this.store.listNotificationMessages(channel);
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
  listOverduePayments() {
    return this.store.listOverduePaymentAlerts();
  }

  @Post('overdue-payments')
  createOverduePayment(@Body() body: CreateOverduePaymentAlertBody) {
    return this.store.createOverduePaymentAlert(body);
  }

  @Get('follow-ups')
  listFollowUps() {
    return this.store.listFollowUpReminders();
  }

  @Post('follow-ups')
  createFollowUp(@Body() body: CreateFollowUpReminderBody) {
    return this.store.createFollowUpReminder(body);
  }
}
