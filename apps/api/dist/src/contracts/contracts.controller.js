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
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const in_memory_service_1 = require("../database/in-memory.service");
let ContractsController = class ContractsController {
    store;
    constructor(store) {
        this.store = store;
    }
    listTemplates(tenantId) {
        return this.store.listContractTemplates(tenantId);
    }
    createTemplate(body) {
        return this.store.createContractTemplate(body);
    }
    listGenerated(tenantId) {
        return this.store.listGeneratedContractPdfs(tenantId);
    }
    generatePdf(body) {
        return this.store.generateContractPdf(body);
    }
    listApprovals(tenantId) {
        return this.store.listLegalContractApprovals(tenantId);
    }
    createApproval(body) {
        return this.store.createLegalContractApproval(body);
    }
    updateApprovalStatus(id, status, note) {
        return this.store.updateLegalContractApprovalStatus(id, status, note);
    }
    listSigned(tenantId) {
        return this.store.listSignedContracts(tenantId);
    }
    createSigned(body) {
        return this.store.createSignedContract(body);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Get)('generated'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "listGenerated", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Get)('approvals'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "listApprovals", null);
__decorate([
    (0, common_1.Post)('approvals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "createApproval", null);
__decorate([
    (0, common_1.Patch)('approvals/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "updateApprovalStatus", null);
__decorate([
    (0, common_1.Get)('signed'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "listSigned", null);
__decorate([
    (0, common_1.Post)('signed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "createSigned", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map