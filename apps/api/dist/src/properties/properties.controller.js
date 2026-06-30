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
exports.PropertiesController = void 0;
const common_1 = require("@nestjs/common");
const in_memory_service_1 = require("../database/in-memory.service");
let PropertiesController = class PropertiesController {
    store;
    constructor(store) {
        this.store = store;
    }
    listBuildings(tenantId, projectId) {
        return this.store.listBuildings(tenantId, projectId);
    }
    createBuilding(body) {
        return this.store.createBuilding(body);
    }
    listFloors(tenantId, buildingId) {
        return this.store.listFloors(tenantId, buildingId);
    }
    createFloor(body) {
        return this.store.createFloor(body);
    }
    listMedia(tenantId, projectId) {
        return this.store.listPropertyMedia(tenantId, projectId);
    }
    createMedia(body) {
        return this.store.createPropertyMedia(body);
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Get)('buildings'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listBuildings", null);
__decorate([
    (0, common_1.Post)('buildings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "createBuilding", null);
__decorate([
    (0, common_1.Get)('floors'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('buildingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listFloors", null);
__decorate([
    (0, common_1.Post)('floors'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "createFloor", null);
__decorate([
    (0, common_1.Get)('media'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listMedia", null);
__decorate([
    (0, common_1.Post)('media'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "createMedia", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [in_memory_service_1.InMemoryService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map