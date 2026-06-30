"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const activities_module_1 = require("./activities/activities.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
const auth_module_1 = require("./auth/auth.module");
const customers_module_1 = require("./customers/customers.module");
const deals_module_1 = require("./deals/deals.module");
const leads_module_1 = require("./leads/leads.module");
const notes_module_1 = require("./notes/notes.module");
const permissions_module_1 = require("./permissions/permissions.module");
const projects_module_1 = require("./projects/projects.module");
const properties_module_1 = require("./properties/properties.module");
const roles_module_1 = require("./roles/roles.module");
const tasks_module_1 = require("./tasks/tasks.module");
const tenants_module_1 = require("./tenants/tenants.module");
const units_module_1 = require("./units/units.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            audit_logs_module_1.AuditLogsModule,
            leads_module_1.LeadsModule,
            customers_module_1.CustomersModule,
            deals_module_1.DealsModule,
            tasks_module_1.TasksModule,
            notes_module_1.NotesModule,
            activities_module_1.ActivitiesModule,
            projects_module_1.ProjectsModule,
            properties_module_1.PropertiesModule,
            units_module_1.UnitsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map