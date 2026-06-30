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
exports.SaasController = void 0;
const common_1 = require("@nestjs/common");
const in_memory_service_1 = require("../database/in-memory.service");
let SaasController = class SaasController {
    store;
    constructor(store) {
        this.store = store;
    }
    plans(tenantId) {
        return this.store.listSubscriptionPlans(tenantId);
    }
    limits(tenantId) {
        return this.store.listFeatureLimits(tenantId);
    }
    branding(tenantId) {
        return this.store.listBrandingSettings(tenantId);
    }
    updateBranding(id, value, status) {
        return this.store.updateBrandingSetting(id, value, status);
    }
    billing(tenantId) {
        return this.store.listTenantBillingItems(tenantId);
    }
    domains(tenantId) {
        return this.store.listTenantDomains(tenantId);
    }
    createDomain(body) {
        return this.store.createTenantDomain(body);
    }
    dataJobs(tenantId) {
        return this.store.listDataTransferJobs(tenantId);
    }
    createDataJob(body) {
        return this.store.createDataTransferJob(body);
    }
};
exports.SaasController = SaasController;
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "plans", null);
__decorate([
    (0, common_1.Get)('limits'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "limits", null);
__decorate([
    (0, common_1.Get)('branding'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "branding", null);
__decorate([
    (0, common_1.Patch)('branding/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('value')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "updateBranding", null);
__decorate([
    (0, common_1.Get)('billing'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "billing", null);
__decorate([
    (0, common_1.Get)('domains'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "domains", null);
__decorate([
    (0, common_1.Post)('domains'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "createDomain", null);
__decorate([
    (0, common_1.Get)('data-jobs'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "dataJobs", null);
__decorate([
    (0, common_1.Post)('data-jobs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "createDataJob", null);
exports.SaasController = SaasController = __decorate([
    (0, common_1.Controller)('saas'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService])
], SaasController);
//# sourceMappingURL=saas.controller.js.map