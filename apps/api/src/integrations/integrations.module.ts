import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SocialLeadsController } from './social-leads.controller';
import { TelegramBotController } from './telegram-bot.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SocialLeadsController, TelegramBotController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
