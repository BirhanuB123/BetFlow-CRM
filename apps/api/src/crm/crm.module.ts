import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { ActivitiesModule } from './activities/activities.module';
import { CustomersModule } from './customers/customers.module';
import { DealsModule } from './deals/deals.module';
import { LeadsModule } from './leads/leads.module';
import { NotesModule } from './notes/notes.module';
import { TasksModule } from './tasks/tasks.module';
import { MeetingsModule } from './meetings/meetings.module';
import { CallsModule } from './calls/calls.module';

@Module({
  imports: [
    AccountsModule,
    ActivitiesModule,
    CustomersModule,
    DealsModule,
    LeadsModule,
    NotesModule,
    TasksModule,
    MeetingsModule,
    CallsModule,
  ],
  exports: [
    AccountsModule,
    ActivitiesModule,
    CustomersModule,
    DealsModule,
    LeadsModule,
    NotesModule,
    TasksModule,
    MeetingsModule,
    CallsModule,
  ],
})
export class CrmModule {}
