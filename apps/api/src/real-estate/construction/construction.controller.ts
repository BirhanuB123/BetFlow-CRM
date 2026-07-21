import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConstructionService } from './construction.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type { UpdateMilestoneProgressInput } from '@betflow/shared';

@UseGuards(JwtAuthGuard)
@Controller('real-estate/construction')
export class ConstructionController {
  constructor(private readonly construction: ConstructionService) {}

  @Get('milestones/:buildingId')
  getMilestones(@Param('buildingId') buildingId: string) {
    return this.construction.getBuildingMilestones(buildingId);
  }

  @Post('milestones/update')
  updateMilestone(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateMilestoneProgressInput,
  ) {
    return this.construction.updateMilestoneProgress(user.id, body);
  }
}
