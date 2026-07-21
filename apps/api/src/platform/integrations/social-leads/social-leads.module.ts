import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { AuthModule } from '../../../core/auth/auth.module';
import { SocialLeadsController } from './social-leads.controller';
import { SocialLeadsService } from './social-leads.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SocialLeadsController],
  providers: [SocialLeadsService],
})
export class SocialLeadsModule {}
