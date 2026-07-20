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
const properties_service_1 = require("./properties.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let PropertiesController = class PropertiesController {
    properties;
    constructor(properties) {
        this.properties = properties;
    }
    listBuildings(user, projectId) {
        return this.properties.listBuildings(projectId);
    }
    getBuilding(user, id) {
        return this.properties.getBuilding(id);
    }
    createBuilding(user, body) {
        return this.properties.createBuilding(user.id, body);
    }
    updateBuilding(user, id, body) {
        return this.properties.updateBuilding(user.id, id, body);
    }
    removeBuilding(user, id) {
        return this.properties.removeBuilding(user.id, id);
    }
    listFloors(user, buildingId) {
        return this.properties.listFloors(buildingId);
    }
    createFloor(user, body) {
        return this.properties.createFloor(user.id, body);
    }
    updateFloor(user, id, body) {
        return this.properties.updateFloor(user.id, id, body);
    }
    removeFloor(user, id) {
        return this.properties.removeFloor(user.id, id);
    }
};
exports.PropertiesController = PropertiesController;
__decorate([
    (0, common_1.Get)('buildings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listBuildings", null);
__decorate([
    (0, common_1.Get)('buildings/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "getBuilding", null);
__decorate([
    (0, common_1.Post)('buildings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "createBuilding", null);
__decorate([
    (0, common_1.Patch)('buildings/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "updateBuilding", null);
__decorate([
    (0, common_1.Delete)('buildings/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "removeBuilding", null);
__decorate([
    (0, common_1.Get)('floors'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('buildingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "listFloors", null);
__decorate([
    (0, common_1.Post)('floors'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "createFloor", null);
__decorate([
    (0, common_1.Patch)('floors/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "updateFloor", null);
__decorate([
    (0, common_1.Delete)('floors/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PropertiesController.prototype, "removeFloor", null);
exports.PropertiesController = PropertiesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('properties'),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService])
], PropertiesController);
//# sourceMappingURL=properties.controller.js.map