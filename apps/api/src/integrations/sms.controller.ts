import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  EthioTelecomSmsService,
  SmsSendDto,
  CreateDripCampaignDto,
  CreateDripStepDto,
  EnrollLeadDto,
  UpdateRuleDto,
} from './sms.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../core/auth/auth.types';

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

  @Get('templates')
  async getTemplates() {
    return this.smsService.getTemplates();
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('broadcast-construction')
  async broadcastConstruction(
    @Body()
    dto: {
      projectId: string;
      stageName: string;
      language?: 'en' | 'am';
    },
  ) {
    return this.smsService.broadcastConstructionProgress(
      dto.projectId,
      dto.stageName,
      dto.language || 'am',
    );
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('send')
  async sendSms(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SmsSendDto,
  ) {
    return this.smsService.sendSms(dto, user?.id);
  }

  @Public()
  @Post('afromessage/callback')
  async afroMessagePostCallback(@Body() body: any, @Query() query: any) {
    return this.smsService.handleAfroMessageCallback({ ...query, ...body });
  }

  @Public()
  @Get('afromessage/callback')
  async afroMessageGetCallback(@Query() query: any) {
    return this.smsService.handleAfroMessageCallback(query);
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
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') campaignId: string,
    @Body() dto: EnrollLeadDto,
  ) {
    return this.smsService.enrollLead(campaignId, dto, user?.id);
  }
}
