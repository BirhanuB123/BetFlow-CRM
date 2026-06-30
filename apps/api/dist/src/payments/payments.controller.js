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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const in_memory_service_1 = require("../database/in-memory.service");
let PaymentsController = class PaymentsController {
    store;
    constructor(store) {
        this.store = store;
    }
    listSchedule(tenantId, reservationId) {
        return this.store.listPaymentSchedule(tenantId, reservationId);
    }
    createSchedule(body) {
        return this.store.createPaymentScheduleItem(body);
    }
    listTransactions(tenantId, reservationId) {
        return this.store.listPaymentTransactions(tenantId, reservationId);
    }
    createTransaction(body) {
        return this.store.createPaymentTransaction(body);
    }
    listReceipts(tenantId, paymentId) {
        return this.store.listReceiptUploads(tenantId, paymentId);
    }
    createReceipt(body) {
        return this.store.createReceiptUpload(body);
    }
    listApprovals(tenantId) {
        return this.store.listFinanceApprovals(tenantId);
    }
    createApproval(body) {
        return this.store.createFinanceApproval(body);
    }
    updateApprovalStatus(id, status, note) {
        return this.store.updateFinanceApprovalStatus(id, status, note);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('schedule'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('reservationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "listSchedule", null);
__decorate([
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('reservationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('receipts'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "listReceipts", null);
__decorate([
    (0, common_1.Post)('receipts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createReceipt", null);
__decorate([
    (0, common_1.Get)('approvals'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "listApprovals", null);
__decorate([
    (0, common_1.Post)('approvals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createApproval", null);
__decorate([
    (0, common_1.Patch)('approvals/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "updateApprovalStatus", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map