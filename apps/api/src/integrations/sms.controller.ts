import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  EthioTelecomSmsService,
  SmsSendDto,
  CreateDripCampaignDto,
  CreateDripStepDto,
  EnrollLeadDto,
  UpdateRuleDto,
} from './sms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sms')
@UseGuards(JwtAuthGuard)
export class SmsController {
  constructor(private readonly smsService: EthioTelecomSmsService) {}

  @Get('stats')
  async getStats() {
    return this.smsService.getSmsStats();
  }

  @Get('contacts')
  async getContacts() {
    return this.smsService.getSmsContacts();
  }

  @Get('outbox')
  async getOutbox() {
    return this.smsService.getOutboxLogs();
  }

  @Post('send')
  async sendSms(@Body() dto: SmsSendDto) {
    return this.smsService.sendSms(dto);
  }

  // --- AUTOMATED RULES ENDPOINTS ---

  @Get('rules')
  async getRules() {
    return this.smsService.getRules();
  }

  @Put('rules/:ruleKey')
  async updateRule(
    @Param('ruleKey') ruleKey: 'siteVisit' | 'holdExpiry' | 'paymentDue',
    @Body() dto: UpdateRuleDto,
  ) {
    return this.smsService.updateRule(ruleKey, dto);
  }

  // --- DRIP CAMPAIGN ENDPOINTS ---

  @Get('drip-campaigns')
  async getDripCampaigns() {
    return this.smsService.getDripCampaigns();
  }

  @Post('drip-campaigns')
  async createDripCampaign(@Body() dto: CreateDripCampaignDto) {
    return this.smsService.createDripCampaign(dto);
  }

  @Patch('drip-campaigns/:id/toggle')
  async toggleDripCampaign(@Param('id') id: string) {
    return this.smsService.toggleDripCampaign(id);
  }

  @Post('drip-campaigns/:id/steps')
  async addDripStep(
    @Param('id') campaignId: string,
    @Body() dto: CreateDripStepDto,
  ) {
    return this.smsService.addDripStep(campaignId, dto);
  }

  @Post('drip-campaigns/:id/enroll')
  async enrollLead(
    @Param('id') campaignId: string,
    @Body() dto: EnrollLeadDto,
  ) {
    return this.smsService.enrollLead(campaignId, dto);
  }
}
