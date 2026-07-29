import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../core/auth/auth.module';
import { SocialLeadsController } from './social-leads.controller';
import { TelegramBotController } from './telegram-bot.controller';
import { SmsController } from './sms.controller';
import { IntegrationsService } from './integrations.service';
import { EthioTelecomSmsService } from './sms.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SocialLeadsController, TelegramBotController, SmsController],
  providers: [IntegrationsService, EthioTelecomSmsService],
  exports: [IntegrationsService, EthioTelecomSmsService],
})
export class IntegrationsModule {}
