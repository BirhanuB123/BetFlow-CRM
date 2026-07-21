import { Module } from '@nestjs/common';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { SaasModule } from './saas/saas.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { WebsiteLeadsModule } from './integrations/website-leads/website-leads.module';
import { SocialLeadsModule } from './integrations/social-leads/social-leads.module';

@Module({
  imports: [
    DocumentsModule,
    NotificationsModule,
    ReportsModule,
    SaasModule,
    EnterpriseModule,
    WebsiteLeadsModule,
    SocialLeadsModule,
  ],
  exports: [
    DocumentsModule,
    NotificationsModule,
    ReportsModule,
    SaasModule,
    EnterpriseModule,
    WebsiteLeadsModule,
    SocialLeadsModule,
  ],
})
export class PlatformModule {}
