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
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const core_module_1 = require("./core/core.module");
const crm_module_1 = require("./crm/crm.module");
const real_estate_module_1 = require("./real-estate/real-estate.module");
const finance_module_1 = require("./finance/finance.module");
const platform_module_1 = require("./platform/platform.module");
const integrations_module_1 = require("./integrations/integrations.module");
const audit_interceptor_1 = require("./core/audit-logs/audit.interceptor");
const audit_logs_module_1 = require("./core/audit-logs/audit-logs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            core_module_1.CoreModule,
            crm_module_1.CrmModule,
            real_estate_module_1.RealEstateModule,
            finance_module_1.FinanceModule,
            platform_module_1.PlatformModule,
            integrations_module_1.IntegrationsModule,
            audit_logs_module_1.AuditLogsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map