import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { ActivitiesModule } from './activities/activities.module';
import { CustomersModule } from './customers/customers.module';
import { DealsModule } from './deals/deals.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    AccountsModule,
    ActivitiesModule,
    CustomersModule,
    DealsModule,
    LeadsModule,
    NotesModule,
    TasksModule,
  ],
  exports: [
    AccountsModule,
    ActivitiesModule,
    CustomersModule,
    DealsModule,
    LeadsModule,
    NotesModule,
    TasksModule,
  ],
})
export class CrmModule {}
