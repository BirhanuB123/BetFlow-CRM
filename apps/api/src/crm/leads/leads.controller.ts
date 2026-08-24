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
import { LeadsService } from './leads.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  ConvertLeadInput,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
} from './leads.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('leads.manage')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('q') search?: string) {
    return this.leads.list(search);
  }

  @Get('sources')
  sources(@CurrentUser() user: AuthenticatedUser) {
    return this.leads.listSources();
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateLeadInput,
  ) {
    return this.leads.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateLeadStatusInput,
  ) {
    return this.leads.updateStatus(user, id, body.status);
  }

  @Post(':id/convert')
  convert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: ConvertLeadInput,
  ) {
    return this.leads.convert(user, id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateLeadInput,
  ) {
    return this.leads.update(user, id, body);
  }

  @Delete(':id')
  @RequirePermission('leads.manage')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.leads.remove(user, id);
  }
}
