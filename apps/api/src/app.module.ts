import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { CrmModule } from './crm/crm.module';
import { RealEstateModule } from './real-estate/real-estate.module';
import { FinanceModule } from './finance/finance.module';
import { PlatformModule } from './platform/platform.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuditInterceptor } from './core/audit-logs/audit.interceptor';
import { AuditLogsModule } from './core/audit-logs/audit-logs.module';
import { HealthController } from './platform/health/health.controller';
import { validateEnv } from './config/env.config';


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 100, // 100 requests per minute default
      },
    ]),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    CoreModule,
    CrmModule,
    RealEstateModule,
    FinanceModule,
    PlatformModule,
    IntegrationsModule,
    AuditLogsModule,
  ],
  controllers: [AppController, HealthController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    validateEnv(process.env);
  }
}

