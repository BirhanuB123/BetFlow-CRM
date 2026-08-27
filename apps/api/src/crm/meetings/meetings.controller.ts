import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission, Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateMeetingInput,
  UpdateMeetingInput,
  UpdateMeetingStatusInput,
} from './meetings.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('meetings.manage')
@Roles('Owner', 'Admin', 'Sales Manager', 'Agent')
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetings: MeetingsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.meetings.list({
      status,
      upcoming: upcoming === 'true' || upcoming === '1',
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.meetings.get(id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateMeetingInput,
  ) {
    return this.meetings.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateMeetingStatusInput,
  ) {
    return this.meetings.updateStatus(user.id, id, body.status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateMeetingInput,
  ) {
    return this.meetings.update(user.id, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin', 'Sales Manager')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.meetings.remove(user.id, id);
  }
}
