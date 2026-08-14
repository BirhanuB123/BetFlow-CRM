import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CampaignsService, CreateCampaignInput } from './campaigns.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../core/auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  list() {
    return this.campaignsService.listCampaigns();
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCampaignInput,
  ) {
    return this.campaignsService.createCampaign(user?.id, body);
  }
}
