import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EthioTelecomSmsService, SmsSendDto } from './sms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sms')
@UseGuards(JwtAuthGuard)
export class SmsController {
  constructor(private readonly smsService: EthioTelecomSmsService) {}

  @Get('stats')
  async getStats() {
    return this.smsService.getSmsStats();
  }

  @Get('outbox')
  async getOutbox() {
    return this.smsService.getOutboxLogs();
  }

  @Post('send')
  async sendSms(@Body() dto: SmsSendDto) {
    return this.smsService.sendSms(dto);
  }
}
