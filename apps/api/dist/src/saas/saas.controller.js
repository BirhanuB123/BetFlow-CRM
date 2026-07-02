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
const trialPeriod = {
    status: 'active',
    startedAt: '2026-06-26',
    endsAt: '2026-07-10',
    daysRemaining: 9,
    conversionOwnerUserId: 'user_001',
};
const billingAccount = {
    tenantId: 'tenant_001',
    accountName: 'BetFlow Realty LLC',
    billingEmail: 'finance@betflowrealty.com',
    taxId: 'US-88214-CRM',
    paymentMethod: 'Visa ending 4242',
    collectionMode: 'auto_charge',
    nextChargeAt: '2026-07-31',
};
const featureFlags = [
    {
        key: 'customer_portal',
        label: 'Customer portal',
        enabled: true,
        scope: 'tenant',
        rollout: '100%',
    },
    {
        key: 'mobile_pwa',
        label: 'Agent mobile PWA',
        enabled: false,
        scope: 'beta_cohort',
        rollout: '20%',
    },
    {
        key: 'advanced_forecasting',
        label: 'Advanced forecasting',
        enabled: true,
        scope: 'plan',
        rollout: 'Growth+',
    },
    {
        key: 'api_marketplace',
        label: 'API marketplace',
        enabled: false,
        scope: 'tenant',
        rollout: 'internal_preview',
    },
];
const onboardingSteps = [
    {
        key: 'workspace',
        step: 'Create tenant workspace',
        owner: 'platform',
        status: 'complete',
        dueAt: null,
    },
    {
        key: 'users',
        step: 'Invite admin users',
        owner: 'tenant_admin',
        status: 'complete',
        dueAt: null,
    },
    {
        key: 'rbac',
        step: 'Configure roles and permissions',
        owner: 'tenant_admin',
        status: 'in_progress',
        dueAt: '2026-07-02',
    },
    {
        key: 'branding_domain',
        step: 'Publish branding and domain',
        owner: 'brand_admin',
        status: 'in_progress',
        dueAt: '2026-07-03',
    },
    {
        key: 'excel_import',
        step: 'Import leads and inventory from Excel',
        owner: 'sales_ops',
        status: 'not_started',
        dueAt: '2026-07-05',
    },
];
const excelImportTemplates = [
    {
        template: 'Lead import workbook',
        entity: 'leads',
        requiredColumns: ['firstName', 'lastName', 'phone', 'source', 'budget'],
    },
    {
        template: 'Customer import workbook',
        entity: 'customers',
        requiredColumns: ['firstName', 'lastName', 'email', 'phone', 'nationalId'],
    },
    {
        template: 'Unit inventory workbook',
        entity: 'units',
        requiredColumns: ['project', 'building', 'floor', 'unitNumber', 'price', 'status'],
    },
    {
        template: 'Payment schedule workbook',
        entity: 'payments',
        requiredColumns: ['contractRef', 'dueDate', 'amount', 'installmentNumber'],
    },
];
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
    trial() {
        return trialPeriod;
    }
    usage(tenantId) {
        const limits = this.store.listFeatureLimits(tenantId);
        return limits.map((limit) => ({
            ...limit,
            usagePercent: Math.round((limit.used / limit.limit) * 100),
            exceeded: limit.used > limit.limit,
        }));
    }
    listFeatureFlags() {
        return featureFlags;
    }
    toggleFeatureFlag(key, body) {
        return {
            key,
            enabled: body.enabled,
            updatedAt: new Date().toISOString(),
        };
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
    billingAccount() {
        return billingAccount;
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
    onboarding() {
        return onboardingSteps;
    }
    completeOnboardingStep(key, body) {
        return {
            key,
            status: 'complete',
            completedByUserId: body.completedByUserId,
            completedAt: new Date().toISOString(),
        };
    }
    excelTemplates() {
        return excelImportTemplates;
    }
    createExcelImport(body) {
        return {
            id: `excel_${Math.random().toString(36).slice(2, 10)}`,
            tenantId: body.tenantId,
            template: body.template,
            fileName: body.fileName,
            rows: body.rows,
            status: 'queued',
            queuedAt: new Date().toISOString(),
        };
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
    (0, common_1.Get)('trial'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "trial", null);
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "usage", null);
__decorate([
    (0, common_1.Get)('feature-flags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "listFeatureFlags", null);
__decorate([
    (0, common_1.Patch)('feature-flags/:key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "toggleFeatureFlag", null);
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
    (0, common_1.Get)('billing/account'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "billingAccount", null);
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
__decorate([
    (0, common_1.Get)('onboarding'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "onboarding", null);
__decorate([
    (0, common_1.Patch)('onboarding/:key/complete'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "completeOnboardingStep", null);
__decorate([
    (0, common_1.Get)('imports/excel/templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "excelTemplates", null);
__decorate([
    (0, common_1.Post)('imports/excel'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SaasController.prototype, "createExcelImport", null);
exports.SaasController = SaasController = __decorate([
    (0, common_1.Controller)('saas'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService])
], SaasController);
//# sourceMappingURL=saas.controller.js.map