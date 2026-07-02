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
exports.EnterpriseController = void 0;
const common_1 = require("@nestjs/common");
const enterpriseCapabilities = {
    'website-leads': {
        name: 'Website lead capture integration',
        status: 'configured',
        endpoints: ['POST /enterprise/website-leads/capture'],
    },
    'social-leads': {
        name: 'Facebook and Instagram lead import',
        status: 'configured',
        endpoints: ['POST /enterprise/social-leads/meta-webhook'],
    },
    'follow-up-automation': {
        name: 'WhatsApp and SMS follow-up automation',
        status: 'configured',
        endpoints: ['POST /enterprise/follow-up-automation/sequences'],
    },
    'email-campaigns': {
        name: 'Email campaign automation',
        status: 'configured',
        endpoints: ['POST /enterprise/email-campaigns'],
    },
    'customer-portal': {
        name: 'Customer portal',
        status: 'planned',
        endpoints: ['GET /portal/me'],
    },
    'mobile-pwa': {
        name: 'Agent mobile app and PWA',
        status: 'planned',
        endpoints: ['GET /mobile/sync'],
    },
    'sales-forecasting': {
        name: 'Advanced sales forecasting',
        status: 'configured',
        endpoints: ['GET /enterprise/sales-forecasting/run'],
    },
    'contract-builder': {
        name: 'Contract template builder',
        status: 'configured',
        endpoints: ['POST /enterprise/contract-builder/templates'],
    },
    'approval-workflows': {
        name: 'Approval workflows',
        status: 'configured',
        endpoints: ['POST /enterprise/approval-workflows'],
    },
    'api-marketplace': {
        name: 'API and webhook marketplace',
        status: 'configured',
        endpoints: ['GET /enterprise/api-marketplace/apps'],
    },
};
let EnterpriseController = class EnterpriseController {
    list() {
        return Object.entries(enterpriseCapabilities).map(([key, capability]) => ({
            key,
            ...capability,
        }));
    }
    get(key) {
        const capability = enterpriseCapabilities[key];
        if (!capability) {
            throw new common_1.NotFoundException(`Enterprise capability ${key} was not found`);
        }
        return {
            key,
            ...capability,
        };
    }
};
exports.EnterpriseController = EnterpriseController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "get", null);
exports.EnterpriseController = EnterpriseController = __decorate([
    (0, common_1.Controller)('enterprise')
], EnterpriseController);
//# sourceMappingURL=enterprise.controller.js.map