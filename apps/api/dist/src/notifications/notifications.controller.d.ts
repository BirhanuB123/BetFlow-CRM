import { InMemoryService } from '../database/in-memory.service';
import { NotificationsService } from './notifications.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { FollowUpReminder, NotificationMessage, OverduePaymentAlert } from '../database/in-memory.service';
type CreateNotificationMessageBody = Omit<NotificationMessage, 'id'>;
type CreateOverduePaymentAlertBody = Omit<OverduePaymentAlert, 'id'>;
type CreateFollowUpReminderBody = Omit<FollowUpReminder, 'id'>;
export declare class NotificationsController {
    private readonly store;
    private readonly notifications;
    constructor(store: InMemoryService, notifications: NotificationsService);
    listInbox(user: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(user: AuthenticatedUser, id: string, isRead: boolean): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    deleteInbox(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    list(channel?: NotificationMessage['channel']): NotificationMessage[];
    create(user: AuthenticatedUser, body: CreateNotificationMessageBody): Promise<NotificationMessage>;
    updateStatus(id: string, status: NotificationMessage['status']): NotificationMessage;
    listOverduePayments(): OverduePaymentAlert[];
    createOverduePayment(body: CreateOverduePaymentAlertBody): Promise<OverduePaymentAlert>;
    listFollowUps(): FollowUpReminder[];
    createFollowUp(body: CreateFollowUpReminderBody): Promise<FollowUpReminder>;
}
export {};
