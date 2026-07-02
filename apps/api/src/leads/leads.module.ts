import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
