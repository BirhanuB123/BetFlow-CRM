import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../core/auth/auth.module';
import { SocialLeadsController } from './social-leads.controller';
import { TelegramBotController } from './telegram-bot.controller';
import { SmsController } from './sms.controller';
import { CampaignsController } from './campaigns.controller';
import { IntegrationsService } from './integrations.service';
import { EthioTelecomSmsService } from './sms.service';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    SocialLeadsController,
    TelegramBotController,
    SmsController,
    CampaignsController,
  ],
  providers: [
    IntegrationsService,
    EthioTelecomSmsService,
    CampaignsService,
  ],
  exports: [IntegrationsService, EthioTelecomSmsService, CampaignsService],
})
export class IntegrationsModule {}

