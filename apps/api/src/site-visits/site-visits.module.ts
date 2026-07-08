import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { SiteVisitsController } from './site-visits.controller';
import { SiteVisitsService } from './site-visits.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService],
})
export class SiteVisitsModule {}