import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { IntegrationsService } from './integrations.service';

@Controller('enterprise/telegram')
export class TelegramBotController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('webhook')
  async receiveTelegramWebhook(@Body() body: any, @Res() res: Response) {
    await this.integrationsService.processTelegramLead(body);
    return res.status(HttpStatus.OK).send('OK');
  }
}
