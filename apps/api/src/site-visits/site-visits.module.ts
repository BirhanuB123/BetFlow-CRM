import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SiteVisitsController } from './site-visits.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SiteVisitsController],
})
export class SiteVisitsModule {}
