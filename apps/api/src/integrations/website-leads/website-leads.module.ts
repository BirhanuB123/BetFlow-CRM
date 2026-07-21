import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { WebsiteLeadsController } from './website-leads.controller';
import { WebsiteLeadsService } from './website-leads.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [WebsiteLeadsController],
  providers: [WebsiteLeadsService],
})
export class WebsiteLeadsModule {}
