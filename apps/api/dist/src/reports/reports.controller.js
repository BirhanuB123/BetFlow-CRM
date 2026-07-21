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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const in_memory_service_1 = require("../database/in-memory.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let ReportsController = class ReportsController {
    reports;
    store;
    constructor(reports, store) {
        this.reports = reports;
        this.store = store;
    }
    catalog() {
        return this.store.getReportsCatalog();
    }
    salesDashboard() {
        return this.reports.salesDashboard();
    }
    agentPerformance() {
        return this.reports.agentPerformance();
    }
    revenue() {
        return this.reports.revenueReport();
    }
    inventory() {
        return this.store.getInventoryReport();
    }
    conversion() {
        return this.reports.conversionFunnel();
    }
    paymentAging() {
        return this.reports.paymentAging();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('catalog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "catalog", null);
__decorate([
    (0, common_1.Get)('sales'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "salesDashboard", null);
__decorate([
    (0, common_1.Get)('agents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "agentPerformance", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "revenue", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "inventory", null);
__decorate([
    (0, common_1.Get)('conversion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "conversion", null);
__decorate([
    (0, common_1.Get)('payment-aging'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "paymentAging", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        in_memory_service_1.InMemoryService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map