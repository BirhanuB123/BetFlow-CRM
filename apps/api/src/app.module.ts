import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { ActivitiesModule } from './activities/activities.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuthModule } from './auth/auth.module';
import { ContractsModule } from './contracts/contracts.module';
import { CustomersModule } from './customers/customers.module';
import { DealsModule } from './deals/deals.module';
import { DocumentsModule } from './documents/documents.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { WebsiteLeadsModule } from './integrations/website-leads/website-leads.module';
import { SocialLeadsModule } from './integrations/social-leads/social-leads.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProjectsModule } from './projects/projects.module';
import { PropertiesModule } from './properties/properties.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { TasksModule } from './tasks/tasks.module';
import { UnitsModule } from './units/units.module';
import { UsersModule } from './users/users.module';
import { SaasModule } from './saas/saas.module';

@Module({
  imports: [
    AuthModule,

    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
    AccountsModule,
    LeadsModule,
    CustomersModule,
    DealsModule,
    TasksModule,
    NotesModule,
    ActivitiesModule,
    ProjectsModule,
    PropertiesModule,
    UnitsModule,
    SiteVisitsModule,
    ReservationsModule,
    PaymentsModule,
    DocumentsModule,
    ContractsModule,
    NotificationsModule,
    ReportsModule,

    EnterpriseModule,
    WebsiteLeadsModule,
    SocialLeadsModule,
    SaasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
