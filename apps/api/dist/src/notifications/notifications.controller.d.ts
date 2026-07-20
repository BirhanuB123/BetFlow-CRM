import { InMemoryService } from '../database/in-memory.service';
import type { FollowUpReminder, NotificationMessage, OverduePaymentAlert } from '../database/in-memory.service';
type CreateNotificationMessageBody = Omit<NotificationMessage, 'id'>;
type CreateOverduePaymentAlertBody = Omit<OverduePaymentAlert, 'id'>;
type CreateFollowUpReminderBody = Omit<FollowUpReminder, 'id'>;
export declare class NotificationsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(channel?: NotificationMessage['channel']): NotificationMessage[];
    create(body: CreateNotificationMessageBody): NotificationMessage;
    updateStatus(id: string, status: NotificationMessage['status']): NotificationMessage;
    listOverduePayments(): void;
    createOverduePayment(body: CreateOverduePaymentAlertBody): OverduePaymentAlert;
    listFollowUps(): void;
    createFollowUp(body: CreateFollowUpReminderBody): FollowUpReminder;
}
export {};
