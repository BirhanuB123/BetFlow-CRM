import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LeadsController } from './leads.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [LeadsController],
})
export class LeadsModule {}
