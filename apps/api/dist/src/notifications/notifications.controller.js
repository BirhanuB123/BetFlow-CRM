"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const in_memory_service_1 = require("../database/in-memory.service");
const notifications_service_1 = require("./notifications.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let NotificationsController = class NotificationsController {
    store;
    notifications;
    constructor(store, notifications) {
        this.store = store;
        this.notifications = notifications;
    }
    listInbox(user) {
        return this.notifications.listForUser(user.id);
    }
    markRead(user, id, isRead) {
        return this.notifications.markAsRead(user.id, id, isRead);
    }
    deleteInbox(user, id) {
        return this.notifications.delete(user.id, id);
    }
    list(channel) {
        return this.store.listNotificationMessages(channel);
    }
    async create(user, body) {
        const msg = this.store.createNotificationMessage(body);
        await this.notifications.create({
            userId: user.id,
            title: `${body.channel.toUpperCase()} Dispatched`,
            message: `Message sent to ${body.recipient}: "${body.subject}"`,
        });
        return msg;
    }
    updateStatus(id, status) {
        return this.store.updateNotificationStatus(id, status);
    }
    listOverduePayments() {
        return this.store.listOverduePaymentAlerts();
    }
    async createOverduePayment(body) {
        const alert = this.store.createOverduePaymentAlert(body);
        await this.notifications.create({
            userId: body.ownerUserId,
            title: 'Late Payment Alert',
            message: `Payment amount ${body.amount} is overdue by ${body.overdueBy}.`,
        });
        return alert;
    }
    listFollowUps() {
        return this.store.listFollowUpReminders();
    }
    async createFollowUp(body) {
        const reminder = this.store.createFollowUpReminder(body);
        await this.notifications.create({
            userId: body.ownerUserId,
            title: 'Follow-up Reminder',
            message: `Action required for lead: ${body.reason}`,
        });
        return reminder;
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('inbox'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "listInbox", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('inbox/:id/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isRead')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('inbox/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "deleteInbox", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('overdue-payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "listOverduePayments", null);
__decorate([
    (0, common_1.Post)('overdue-payments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createOverduePayment", null);
__decorate([
    (0, common_1.Get)('follow-ups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "listFollowUps", null);
__decorate([
    (0, common_1.Post)('follow-ups'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createFollowUp", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService,
        notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map