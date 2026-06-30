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
exports.SiteVisitsController = void 0;
const common_1 = require("@nestjs/common");
const in_memory_service_1 = require("../database/in-memory.service");
let SiteVisitsController = class SiteVisitsController {
    store;
    constructor(store) {
        this.store = store;
    }
    list(tenantId) {
        return this.store.listSiteVisits(tenantId);
    }
    create(body) {
        return this.store.createSiteVisit(body);
    }
    updateStatus(id, status, outcome) {
        return this.store.updateSiteVisitStatus(id, status, outcome);
    }
};
exports.SiteVisitsController = SiteVisitsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SiteVisitsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SiteVisitsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('outcome')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SiteVisitsController.prototype, "updateStatus", null);
exports.SiteVisitsController = SiteVisitsController = __decorate([
    (0, common_1.Controller)('site-visits'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService])
], SiteVisitsController);
//# sourceMappingURL=site-visits.controller.js.map